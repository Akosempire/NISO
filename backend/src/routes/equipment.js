const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const { authenticateToken, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

// GET /api/equipment?stationId=
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { stationId, status } = req.query;
    const filter = {};
    if (stationId) filter.stationId = stationId;
    if (status)    filter.status    = status;

    const equipment = await Equipment.find(filter)
      .populate('stationId', 'name code')
      .sort({ name: 1 })
      .lean();

    res.json(equipment);
  } catch (error) {
    logger.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// GET /api/equipment/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('stationId', 'name code region')
      .lean();

    if (!equipment) return res.status(404).json({ error: 'Equipment not found' });
    res.json(equipment);
  } catch (error) {
    logger.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// POST /api/equipment
router.post(
  '/',
  authenticateToken,
  authorize('STATION_ADMIN', 'REGIONAL_ADMIN', 'HQ_ADMIN', 'ICT_ADMIN'),
  async (req, res) => {
    try {
      const { name, type, stationId, model, serialNumber, installedDate, slaTarget } = req.body;
      if (!name || !type || !stationId) {
        return res.status(400).json({ error: 'name, type and stationId are required' });
      }

      const equipment = await Equipment.create({
        name,
        type,
        stationId,
        model:         model        || null,
        serialNumber:  serialNumber || null,
        installedDate: installedDate ? new Date(installedDate) : null,
        slaTarget:     slaTarget != null ? Number(slaTarget) : 95,
      });

      const populated = await Equipment.findById(equipment._id)
        .populate('stationId', 'name code')
        .lean();

      logger.info(`Equipment created by ${req.user.email}`, { name });
      res.status(201).json(populated);
    } catch (error) {
      logger.error('Error creating equipment:', error);
      res.status(500).json({ error: 'Failed to create equipment' });
    }
  }
);

module.exports = router;
