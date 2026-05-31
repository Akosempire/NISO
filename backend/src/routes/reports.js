const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const SLAEntry = require('../models/SLAEntry');
const Equipment = require('../models/Equipment');
const Interruption = require('../models/Interruption');
const Reading = require('../models/Reading');
const Report = require('../models/Report');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// GET /api/reports/summary?stationId=&startDate=&endDate=
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { stationId, startDate, endDate } = req.query;
    if (!stationId || !startDate || !endDate) {
      return res.status(400).json({ error: 'stationId, startDate and endDate are required' });
    }

    const stationOid = new mongoose.Types.ObjectId(stationId);
    const start = new Date(startDate);
    const end   = new Date(endDate);

    // SLA aggregate
    const slaAgg = await SLAEntry.aggregate([
      { $match: { stationId: stationOid, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id:         null,
          avgActualMw: { $avg: '$actualMw' },
          avgForecastMw: { $avg: '$forecastMw' },
          total:       { $sum: 1 },
          approved:    { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
        },
      },
    ]);

    // Equipment status counts
    const equipmentAgg = await Equipment.aggregate([
      { $match: { stationId: stationOid } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Interruptions
    const intAgg = await Interruption.aggregate([
      { $match: { stationId: stationOid, tripTime: { $gte: start, $lte: end } } },
      {
        $group: {
          _id:           null,
          total:         { $sum: 1 },
          totalDowntime: { $sum: { $ifNull: ['$durationMinutes', 0] } },
          active:        { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        },
      },
    ]);

    // Readings
    const readingsAgg = await Reading.aggregate([
      { $match: { stationId: stationOid, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id:    null,
          total:  { $sum: 1 },
          sealed: { $sum: { $cond: [{ $eq: ['$status', 'sealed'] }, 1, 0] } },
        },
      },
    ]);

    res.json({
      period: { startDate, endDate },
      sla:          slaAgg[0] || { avgActualMw: null, avgForecastMw: null, total: 0, approved: 0 },
      equipment:    equipmentAgg,
      interruptions: intAgg[0] || { total: 0, totalDowntime: 0, active: 0 },
      readings:     readingsAgg[0] || { total: 0, sealed: 0 },
    });
  } catch (error) {
    logger.error('Error generating report summary:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// POST /api/reports/export/pdf
router.post('/export/pdf', authenticateToken, async (req, res) => {
  try {
    const { stationId, startDate, endDate, title } = req.body;
    if (!stationId) return res.status(400).json({ error: 'stationId is required' });

    const stationOid = new mongoose.Types.ObjectId(stationId);
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 86400000);
    const end   = endDate   ? new Date(endDate)   : new Date();

    const [readings, interruptions] = await Promise.all([
      Reading.find({ stationId: stationOid, date: { $gte: start, $lte: end } })
        .populate('equipmentId', 'name')
        .sort({ date: -1, hour: 1 })
        .limit(200)
        .lean(),
      Interruption.find({ stationId: stationOid, tripTime: { $gte: start, $lte: end } })
        .populate('equipmentId', 'name')
        .sort({ tripTime: -1 })
        .limit(100)
        .lean(),
    ]);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="niso-report-${Date.now()}.pdf"`);
    doc.pipe(res);

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text(title || 'NISO Operational Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(
      `Period: ${start.toDateString()} – ${end.toDateString()} | Generated: ${new Date().toLocaleString()}`,
      { align: 'center' }
    );
    doc.moveDown(1);

    // Readings section
    doc.fontSize(13).font('Helvetica-Bold').text('Readings Summary');
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica');
    const sealedCount = readings.filter((r) => r.status === 'sealed').length;
    doc.text(`Total: ${readings.length}  |  Sealed: ${sealedCount}  |  Pending: ${readings.length - sealedCount}`);
    doc.moveDown(0.5);

    // Interruptions section
    doc.fontSize(13).font('Helvetica-Bold').text('Interruptions');
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica');
    interruptions.forEach((i) => {
      const dur = i.durationMinutes ? `${i.durationMinutes} min` : 'ongoing';
      doc.text(`• ${i.equipmentId?.name || 'N/A'} — ${new Date(i.tripTime).toLocaleString()} [${i.status}] ${dur}`);
    });
    if (interruptions.length === 0) doc.text('No interruptions in period.');

    doc.end();

    logger.info(`PDF report exported by ${req.user.email}`);
  } catch (error) {
    logger.error('Error exporting PDF:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Export failed' });
  }
});

// POST /api/reports/export/excel
router.post('/export/excel', authenticateToken, async (req, res) => {
  try {
    const { stationId, startDate, endDate } = req.body;
    if (!stationId) return res.status(400).json({ error: 'stationId is required' });

    const stationOid = new mongoose.Types.ObjectId(stationId);
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 86400000);
    const end   = endDate   ? new Date(endDate)   : new Date();

    const [readings, slaEntries, interruptions] = await Promise.all([
      Reading.find({ stationId: stationOid, date: { $gte: start, $lte: end } })
        .populate('equipmentId', 'name').sort({ date: -1, hour: 1 }).limit(500).lean(),
      SLAEntry.find({ stationId: stationOid, date: { $gte: start, $lte: end } })
        .populate('equipmentId', 'name').sort({ date: -1, hour: 1 }).limit(500).lean(),
      Interruption.find({ stationId: stationOid, tripTime: { $gte: start, $lte: end } })
        .populate('equipmentId', 'name').sort({ tripTime: -1 }).limit(500).lean(),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'NISO System';
    workbook.created = new Date();

    // Readings sheet
    const readingsSheet = workbook.addWorksheet('Readings');
    readingsSheet.columns = [
      { header: 'Date',        key: 'date',      width: 14 },
      { header: 'Hour',        key: 'hour',       width: 8  },
      { header: 'Equipment',   key: 'equipment',  width: 20 },
      { header: 'MW',          key: 'mw',         width: 10 },
      { header: 'MVAR',        key: 'mvar',       width: 10 },
      { header: 'KV',          key: 'kv',         width: 10 },
      { header: 'Amperage',    key: 'amperage',   width: 12 },
      { header: 'Temperature', key: 'temperature',width: 14 },
      { header: 'Raw Input',   key: 'rawInput',   width: 14 },
      { header: 'Status',      key: 'status',     width: 10 },
    ];
    readings.forEach((r) => {
      readingsSheet.addRow({
        date:        r.date ? new Date(r.date).toLocaleDateString() : '',
        hour:        r.hour,
        equipment:   r.equipmentId?.name || '',
        mw:          r.mw,
        mvar:        r.mvar,
        kv:          r.kv,
        amperage:    r.amperage,
        temperature: r.temperature,
        rawInput:    r.rawInput || '',
        status:      r.status,
      });
    });

    // SLA sheet
    const slaSheet = workbook.addWorksheet('SLA');
    slaSheet.columns = [
      { header: 'Date',        key: 'date',       width: 14 },
      { header: 'Hour',        key: 'hour',        width: 8  },
      { header: 'Feeder ID',   key: 'feederId',    width: 16 },
      { header: 'Equipment',   key: 'equipment',   width: 20 },
      { header: 'Forecast MW', key: 'forecastMw',  width: 14 },
      { header: 'Actual MW',   key: 'actualMw',    width: 12 },
      { header: 'Variance MW', key: 'varianceMw',  width: 14 },
      { header: 'Status',      key: 'status',      width: 12 },
      { header: 'Remarks',     key: 'remarks',     width: 20 },
    ];
    slaEntries.forEach((s) => {
      slaSheet.addRow({
        date:       s.date ? new Date(s.date).toLocaleDateString() : '',
        hour:       s.hour,
        feederId:   s.feederId,
        equipment:  s.equipmentId?.name || '',
        forecastMw: s.forecastMw,
        actualMw:   s.actualMw,
        varianceMw: s.varianceMw,
        status:     s.status,
        remarks:    s.remarks || '',
      });
    });

    // Interruptions sheet
    const intSheet = workbook.addWorksheet('Interruptions');
    intSheet.columns = [
      { header: 'Equipment',      key: 'equipment',    width: 20 },
      { header: 'Trip Time',      key: 'tripTime',     width: 20 },
      { header: 'Restore Time',   key: 'restoreTime',  width: 20 },
      { header: 'Duration (min)', key: 'duration',     width: 16 },
      { header: 'Reason',         key: 'reason',       width: 24 },
      { header: 'Status',         key: 'status',       width: 12 },
    ];
    interruptions.forEach((i) => {
      intSheet.addRow({
        equipment:   i.equipmentId?.name || '',
        tripTime:    i.tripTime ? new Date(i.tripTime).toLocaleString() : '',
        restoreTime: i.restoreTime ? new Date(i.restoreTime).toLocaleString() : 'Active',
        duration:    i.durationMinutes || '',
        reason:      i.reason || '',
        status:      i.status,
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="niso-report-${Date.now()}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();

    logger.info(`Excel report exported by ${req.user.email}`);
  } catch (error) {
    logger.error('Error exporting Excel:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;
