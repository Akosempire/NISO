const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Reading = require('../models/Reading');
const { authenticateToken, authorize, checkStationAccess } = require('../middleware/auth');
const logger = require('../utils/logger');

// GET /api/readings?stationId=&date=&equipmentId=&limit=&offset=
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { stationId, equipmentId, date, startDate, endDate, limit = 100, offset = 0 } = req.query;
    const filter = {};

    if (stationId)    filter.stationId   = stationId;
    if (equipmentId)  filter.equipmentId = equipmentId;

    if (date) {
      const d = new Date(date);
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      filter.date = { $gte: d, $lt: next };
    } else {
      if (startDate) filter.date = { ...(filter.date || {}), $gte: new Date(startDate) };
      if (endDate)   filter.date = { ...(filter.date || {}), $lte: new Date(endDate) };
    }

    const readings = await Reading.find(filter)
      .populate('equipmentId', 'name type')
      .populate('createdBy', 'firstName lastName email')
      .populate('sealedBy', 'firstName lastName')
      .sort({ date: -1, hour: 1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .lean();

    res.json(readings);
  } catch (error) {
    logger.error('Error fetching readings:', error);
    res.status(500).json({ error: 'Failed to fetch readings' });
  }
});

// POST /api/readings
router.post(
  '/',
  authenticateToken,
  authorize('OPERATOR', 'SUPERVISOR', 'STATION_ADMIN', 'HQ_ADMIN', 'REGIONAL_ADMIN'),
  async (req, res) => {
    try {
      const {
        equipmentId, stationId, hour, date,
        amperage, mw, mvar, kv, temperature,
        rawInput, valueType, remarks,
      } = req.body;

      if (!equipmentId || !stationId || hour === undefined || !date) {
        return res.status(400).json({ error: 'equipmentId, stationId, hour, and date are required' });
      }

      const reading = await Reading.create({
        equipmentId,
        stationId,
        hour: Number(hour),
        date:        new Date(date),
        amperage:    amperage    != null ? Number(amperage)    : null,
        mw:          mw          != null ? Number(mw)          : null,
        mvar:        mvar        != null ? Number(mvar)        : null,
        kv:          kv          != null ? Number(kv)          : null,
        temperature: temperature != null ? Number(temperature) : null,
        rawInput:    rawInput  || null,
        valueType:   valueType || 'number',
        remarks:     remarks   || null,
        createdBy:   req.user.id,
      });

      const populated = await Reading.findById(reading._id)
        .populate('equipmentId', 'name type')
        .populate('createdBy', 'firstName lastName email')
        .lean();

      logger.info(`Reading created by ${req.user.email}`, { readingId: reading._id });

      global.broadcast({ type: 'reading_created', data: populated });

      res.status(201).json(populated);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ error: 'A reading already exists for this equipment, date, and hour' });
      }
      logger.error('Error creating reading:', error);
      res.status(500).json({ error: 'Failed to create reading' });
    }
  }
);

// PATCH /api/readings/:id  (update non-sealed fields)
router.patch(
  '/:id',
  authenticateToken,
  authorize('SUPERVISOR', 'STATION_ADMIN', 'HQ_ADMIN', 'REGIONAL_ADMIN'),
  async (req, res) => {
    try {
      const reading = await Reading.findById(req.params.id);
      if (!reading) return res.status(404).json({ error: 'Reading not found' });

      if (reading.status === 'sealed') {
        return res.status(409).json({ error: 'Cannot modify a sealed reading', code: 'RECORD_SEALED' });
      }

      const allowed = ['amperage', 'mw', 'mvar', 'kv', 'temperature', 'rawInput', 'valueType', 'remarks'];
      const updates = {};
      allowed.forEach((key) => {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      });

      const updated = await Reading.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      )
        .populate('equipmentId', 'name type')
        .populate('createdBy', 'firstName lastName email')
        .lean();

      logger.info(`Reading updated by ${req.user.email}`, { readingId: req.params.id });
      res.json(updated);
    } catch (error) {
      logger.error('Error updating reading:', error);
      res.status(500).json({ error: 'Failed to update reading' });
    }
  }
);

// POST /api/readings/:id/seal  — SEAL a reading (immutable after this)
router.post(
  '/:id/seal',
  authenticateToken,
  authorize('SUPERVISOR', 'STATION_ADMIN', 'HQ_ADMIN'),
  async (req, res) => {
    try {
      const reading = await Reading.findById(req.params.id);
      if (!reading) return res.status(404).json({ error: 'Reading not found' });

      if (reading.status === 'sealed') {
        return res.status(409).json({ error: 'Reading is already sealed', code: 'ALREADY_SEALED' });
      }

      const sealed = await Reading.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            status:   'sealed',
            sealedAt: new Date(),
            sealedBy: req.user.id,
          },
        },
        { new: true }
      )
        .populate('equipmentId', 'name type')
        .populate('sealedBy', 'firstName lastName email')
        .lean();

      logger.info(`Reading sealed by ${req.user.email}`, { readingId: req.params.id });
      res.json(sealed);
    } catch (error) {
      logger.error('Error sealing reading:', error);
      res.status(500).json({ error: 'Failed to seal reading' });
    }
  }
);

module.exports = router;
