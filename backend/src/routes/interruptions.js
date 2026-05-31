const express = require('express');
const router = express.Router();
const Interruption = require('../models/Interruption');
const { authenticateToken, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

// GET /api/interruptions?stationId=&status=&startDate=&endDate=
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { stationId, equipmentId, status, startDate, endDate } = req.query;
    const filter = {};

    if (stationId)   filter.stationId   = stationId;
    if (equipmentId) filter.equipmentId = equipmentId;
    if (status)      filter.status      = status;

    if (startDate) filter.tripTime = { ...(filter.tripTime || {}), $gte: new Date(startDate) };
    if (endDate)   filter.tripTime = { ...(filter.tripTime || {}), $lte: new Date(endDate) };

    const interruptions = await Interruption.find(filter)
      .populate('equipmentId', 'name type')
      .populate('equipmentList', 'name type')
      .populate('createdBy', 'firstName lastName email')
      .sort({ tripTime: -1 })
      .limit(500)
      .lean();

    res.json(interruptions);
  } catch (error) {
    logger.error('Error fetching interruptions:', error);
    res.status(500).json({ error: 'Failed to fetch interruptions' });
  }
});

// POST /api/interruptions
router.post(
  '/',
  authenticateToken,
  authorize('OPERATOR', 'SUPERVISOR', 'STATION_ADMIN', 'HQ_ADMIN', 'REGIONAL_ADMIN'),
  async (req, res) => {
    try {
      const { equipmentId, stationId, tripTime, reason, causeCode, notes, equipmentList } = req.body;

      if (!equipmentId || !stationId || !tripTime) {
        return res.status(400).json({ error: 'equipmentId, stationId and tripTime are required' });
      }

      const interruption = await Interruption.create({
        equipmentId,
        stationId,
        tripTime:      new Date(tripTime),
        reason:        reason    || null,
        causeCode:     causeCode || null,
        notes:         notes     || null,
        equipmentList: equipmentList || [],
        status:        'active',
        createdBy:     req.user.id,
      });

      const populated = await Interruption.findById(interruption._id)
        .populate('equipmentId', 'name type')
        .populate('equipmentList', 'name type')
        .populate('createdBy', 'firstName lastName email')
        .lean();

      logger.info(`Interruption created by ${req.user.email}`, { equipmentId, stationId });

      global.broadcast({
        type:     'interruption_created',
        severity: 'critical',
        data:     populated,
      });

      res.status(201).json(populated);
    } catch (error) {
      logger.error('Error creating interruption:', error);
      res.status(500).json({ error: 'Failed to create interruption' });
    }
  }
);

// PATCH /api/interruptions/:id
router.patch(
  '/:id',
  authenticateToken,
  authorize('OPERATOR', 'SUPERVISOR', 'STATION_ADMIN', 'HQ_ADMIN', 'REGIONAL_ADMIN'),
  async (req, res) => {
    try {
      const interruption = await Interruption.findById(req.params.id);
      if (!interruption) return res.status(404).json({ error: 'Interruption not found' });

      const allowed = ['reason', 'causeCode', 'notes', 'equipmentList'];
      const updates = {};
      allowed.forEach((key) => {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      });

      const updated = await Interruption.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true }
      )
        .populate('equipmentId', 'name type')
        .populate('equipmentList', 'name type')
        .lean();

      logger.info(`Interruption updated by ${req.user.email}`, { id: req.params.id });
      res.json(updated);
    } catch (error) {
      logger.error('Error updating interruption:', error);
      res.status(500).json({ error: 'Failed to update interruption' });
    }
  }
);

// POST /api/interruptions/:id/restore
router.post(
  '/:id/restore',
  authenticateToken,
  authorize('OPERATOR', 'SUPERVISOR', 'STATION_ADMIN', 'HQ_ADMIN', 'REGIONAL_ADMIN'),
  async (req, res) => {
    try {
      const { restoreTime } = req.body;
      if (!restoreTime) return res.status(400).json({ error: 'restoreTime is required' });

      const interruption = await Interruption.findById(req.params.id);
      if (!interruption) return res.status(404).json({ error: 'Interruption not found' });

      if (interruption.status === 'restored') {
        return res.status(409).json({ error: 'Interruption is already restored' });
      }

      const restore  = new Date(restoreTime);
      const durationMinutes = Math.max(
        0,
        Math.floor((restore - interruption.tripTime) / 60000)
      );

      const restored = await Interruption.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            restoreTime,
            durationMinutes,
            status: 'restored',
          },
        },
        { new: true }
      )
        .populate('equipmentId', 'name type')
        .lean();

      logger.info(`Interruption restored by ${req.user.email}`, { durationMinutes });

      global.broadcast({ type: 'interruption_resolved', data: restored });

      res.json(restored);
    } catch (error) {
      logger.error('Error restoring equipment:', error);
      res.status(500).json({ error: 'Failed to restore equipment' });
    }
  }
);

module.exports = router;
