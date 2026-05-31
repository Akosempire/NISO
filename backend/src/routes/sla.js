const express = require('express');
const router = express.Router();
const SLAEntry = require('../models/SLAEntry');
const Interruption = require('../models/Interruption');
const Equipment = require('../models/Equipment');
const { authenticateToken, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

// GET /api/sla?stationId=&date=&equipmentId=&limit=
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { stationId, equipmentId, date, startDate, endDate, limit = 200 } = req.query;
    const filter = {};

    if (stationId)   filter.stationId   = stationId;
    if (equipmentId) filter.equipmentId = equipmentId;

    if (date) {
      const d    = new Date(date);
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      filter.date = { $gte: d, $lt: next };
    } else {
      if (startDate) filter.date = { ...(filter.date || {}), $gte: new Date(startDate) };
      if (endDate)   filter.date = { ...(filter.date || {}), $lte: new Date(endDate) };
    }

    const entries = await SLAEntry.find(filter)
      .populate('equipmentId', 'name type slaTarget')
      .populate('approvedBy', 'firstName lastName')
      .populate('createdBy', 'firstName lastName email')
      .sort({ date: -1, hour: 1 })
      .limit(Number(limit))
      .lean();

    res.json(entries);
  } catch (error) {
    logger.error('Error fetching SLA entries:', error);
    res.status(500).json({ error: 'Failed to fetch SLA entries' });
  }
});

// POST /api/sla
router.post(
  '/',
  authenticateToken,
  authorize('OPERATOR', 'SUPERVISOR', 'STATION_ADMIN', 'HQ_ADMIN', 'REGIONAL_ADMIN'),
  async (req, res) => {
    try {
      const { equipmentId, stationId, feederId, date, hour, forecastMw, actualMw, meterReadingKwh, remarks } = req.body;

      if (!equipmentId || !stationId || !feederId || !date || hour === undefined || forecastMw === undefined) {
        return res.status(400).json({ error: 'equipmentId, stationId, feederId, date, hour and forecastMw are required' });
      }

      let variance = null;
      let varianceMw = null;
      if (actualMw != null) {
        varianceMw = Number(actualMw) - Number(forecastMw);
        variance   = varianceMw;
      }

      const entry = await SLAEntry.create({
        equipmentId,
        stationId,
        feederId,
        date:            new Date(date),
        hour:            Number(hour),
        forecastMw:      Number(forecastMw),
        actualMw:        actualMw  != null ? Number(actualMw)  : null,
        meterReadingKwh: meterReadingKwh != null ? Number(meterReadingKwh) : null,
        varianceMw,
        variance,
        remarks:         remarks || null,
        createdBy:       req.user.id,
      });

      const populated = await SLAEntry.findById(entry._id)
        .populate('equipmentId', 'name type slaTarget')
        .populate('createdBy', 'firstName lastName email')
        .lean();

      logger.info(`SLA entry created by ${req.user.email}`);
      res.status(201).json(populated);
    } catch (error) {
      logger.error('Error creating SLA entry:', error);
      res.status(500).json({ error: 'Failed to create SLA entry' });
    }
  }
);

// PATCH /api/sla/:id
router.patch(
  '/:id',
  authenticateToken,
  authorize('SUPERVISOR', 'STATION_ADMIN', 'HQ_ADMIN', 'REGIONAL_ADMIN'),
  async (req, res) => {
    try {
      const entry = await SLAEntry.findById(req.params.id);
      if (!entry) return res.status(404).json({ error: 'SLA entry not found' });

      if (entry.status === 'approved') {
        return res.status(409).json({ error: 'Cannot modify an approved SLA entry', code: 'RECORD_APPROVED' });
      }

      const allowed = ['actualMw', 'meterReadingKwh', 'forecastMw', 'remarks'];
      const updates = {};
      allowed.forEach((key) => {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      });

      // Recalculate variance if actuals changed
      const effectualMw = updates.actualMw ?? entry.actualMw;
      const effectForecast = updates.forecastMw ?? entry.forecastMw;
      if (effectualMw != null) {
        updates.varianceMw = Number(effectualMw) - Number(effectForecast);
        updates.variance   = updates.varianceMw;
      }

      const updated = await SLAEntry.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      )
        .populate('equipmentId', 'name type slaTarget')
        .populate('createdBy', 'firstName lastName email')
        .lean();

      logger.info(`SLA entry updated by ${req.user.email}`, { entryId: req.params.id });
      res.json(updated);
    } catch (error) {
      logger.error('Error updating SLA entry:', error);
      res.status(500).json({ error: 'Failed to update SLA entry' });
    }
  }
);

// POST /api/sla/:id/approve
router.post(
  '/:id/approve',
  authenticateToken,
  authorize('SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN', 'HQ_ADMIN'),
  async (req, res) => {
    try {
      const entry = await SLAEntry.findById(req.params.id);
      if (!entry) return res.status(404).json({ error: 'SLA entry not found' });

      if (entry.status === 'approved') {
        return res.status(409).json({ error: 'SLA entry is already approved', code: 'ALREADY_APPROVED' });
      }

      const approved = await SLAEntry.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            status:     'approved',
            approvedAt: new Date(),
            approvedBy: req.user.id,
          },
        },
        { new: true }
      )
        .populate('equipmentId', 'name type slaTarget')
        .populate('approvedBy', 'firstName lastName email')
        .lean();

      logger.info(`SLA entry approved by ${req.user.email}`, { entryId: req.params.id });
      res.json(approved);
    } catch (error) {
      logger.error('Error approving SLA entry:', error);
      res.status(500).json({ error: 'Failed to approve SLA entry' });
    }
  }
);

// POST /api/sla/calculate  — compute SLA from interruption records
router.post(
  '/calculate',
  authenticateToken,
  authorize('SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN', 'HQ_ADMIN'),
  async (req, res) => {
    try {
      const { equipmentId, stationId, date } = req.body;
      if (!equipmentId || !stationId || !date) {
        return res.status(400).json({ error: 'equipmentId, stationId and date are required' });
      }

      const equipment = await Equipment.findById(equipmentId);
      if (!equipment) return res.status(404).json({ error: 'Equipment not found' });

      const dayStart = new Date(date);
      const dayEnd   = new Date(date);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const interruptions = await Interruption.find({
        equipmentId,
        tripTime: { $gte: dayStart, $lt: dayEnd },
      });

      const totalDowntime = interruptions.reduce((sum, i) => sum + (i.durationMinutes || 0), 0);
      const actualPct     = Math.max(0, 100 - (totalDowntime / 1440) * 100);
      const forecastPct   = equipment.slaTarget;
      const variance      = actualPct - forecastPct;

      logger.info(`SLA calculated for equipment ${equipmentId}: ${actualPct.toFixed(2)}%`);

      res.json({
        equipmentId,
        stationId,
        date,
        forecastPct,
        actualPct:    parseFloat(actualPct.toFixed(4)),
        variance:     parseFloat(variance.toFixed(4)),
        totalDowntimeMinutes: totalDowntime,
        status: actualPct >= forecastPct ? 'on-target' : 'warning',
      });
    } catch (error) {
      logger.error('Error calculating SLA:', error);
      res.status(500).json({ error: 'Failed to calculate SLA' });
    }
  }
);

module.exports = router;
