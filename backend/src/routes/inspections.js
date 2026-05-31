const express = require('express');
const router = express.Router();
const Inspection = require('../models/Inspection');
const { authenticateToken, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

// GET /api/inspections?stationId=&equipmentId=&status=
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { stationId, equipmentId, status } = req.query;
    const filter = {};

    if (stationId)   filter.stationId   = stationId;
    if (equipmentId) filter.equipmentId = equipmentId;
    if (status)      filter.status      = status;

    const inspections = await Inspection.find(filter)
      .populate('equipmentId', 'name type')
      .populate('inspectorId', 'firstName lastName email')
      .sort({ inspectionDate: -1 })
      .limit(500)
      .lean();

    res.json(inspections);
  } catch (error) {
    logger.error('Error fetching inspections:', error);
    res.status(500).json({ error: 'Failed to fetch inspections' });
  }
});

// POST /api/inspections
router.post(
  '/',
  authenticateToken,
  authorize('SUPERVISOR', 'STATION_ADMIN', 'HQ_ADMIN', 'REGIONAL_ADMIN'),
  async (req, res) => {
    try {
      const { equipmentId, stationId, inspectionDate, findings, severity } = req.body;

      if (!equipmentId || !stationId || !inspectionDate) {
        return res.status(400).json({ error: 'equipmentId, stationId and inspectionDate are required' });
      }

      const inspection = await Inspection.create({
        equipmentId,
        stationId,
        inspectionDate: new Date(inspectionDate),
        inspectorId:    req.user.id,
        findings:       findings || null,
        severity:       severity || 'low',
        status:         'in-progress',
      });

      const populated = await Inspection.findById(inspection._id)
        .populate('equipmentId', 'name type')
        .populate('inspectorId', 'firstName lastName email')
        .lean();

      logger.info(`Inspection created by ${req.user.email}`, { equipmentId });
      res.status(201).json(populated);
    } catch (error) {
      logger.error('Error creating inspection:', error);
      res.status(500).json({ error: 'Failed to create inspection' });
    }
  }
);

// PATCH /api/inspections/:id
router.patch(
  '/:id',
  authenticateToken,
  authorize('SUPERVISOR', 'STATION_ADMIN', 'HQ_ADMIN', 'REGIONAL_ADMIN'),
  async (req, res) => {
    try {
      const inspection = await Inspection.findById(req.params.id);
      if (!inspection) return res.status(404).json({ error: 'Inspection not found' });

      const allowed = ['status', 'findings', 'severity', 'resolvedAt'];
      const updates = {};
      allowed.forEach((key) => {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      });

      if (updates.status === 'completed' && !updates.resolvedAt) {
        updates.resolvedAt = new Date();
      }

      const updated = await Inspection.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      )
        .populate('equipmentId', 'name type')
        .populate('inspectorId', 'firstName lastName email')
        .lean();

      logger.info(`Inspection updated by ${req.user.email}`, { inspectionId: req.params.id });
      res.json(updated);
    } catch (error) {
      logger.error('Error updating inspection:', error);
      res.status(500).json({ error: 'Failed to update inspection' });
    }
  }
);

// POST /api/inspections/:id/approve  — supervisor sign-off (immutable after)
router.post(
  '/:id/approve',
  authenticateToken,
  authorize('SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN', 'HQ_ADMIN'),
  async (req, res) => {
    try {
      const inspection = await Inspection.findById(req.params.id);
      if (!inspection) return res.status(404).json({ error: 'Inspection not found' });

      if (inspection.approvedAt) {
        return res.status(409).json({ error: 'Inspection is already approved', code: 'ALREADY_APPROVED' });
      }

      const approved = await Inspection.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            status:     'completed',
            approvedAt: new Date(),
            approvedBy: req.user.id,
            resolvedAt: inspection.resolvedAt || new Date(),
          },
        },
        { new: true }
      )
        .populate('equipmentId', 'name type')
        .populate('inspectorId', 'firstName lastName email')
        .populate('approvedBy', 'firstName lastName email')
        .lean();

      logger.info(`Inspection approved by ${req.user.email}`, { inspectionId: req.params.id });
      res.json(approved);
    } catch (error) {
      logger.error('Error approving inspection:', error);
      res.status(500).json({ error: 'Failed to approve inspection' });
    }
  }
);

module.exports = router;
