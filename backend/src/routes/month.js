const express = require('express');
const router = express.Router();
const Reading = require('../models/Reading');
const SLAEntry = require('../models/SLAEntry');
const { authenticateToken, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

// In-memory ledger of seal states by station/month while a dedicated
// MonthSeal model is pending (BUILD_LOG Phase 2). Survives within a single
// process; restart resets to OPEN. Adequate for staging walkthrough.
const sealLedger = new Map(); // key: `${stationId}-${year}-${month}` -> { state, transitionedAt, transitionedBy }

const keyFor = (stationId, year, month) => `${stationId}-${year}-${month}`;

// GET /api/month/seal?stationId=&year=&month=
router.get('/seal', authenticateToken, async (req, res) => {
  const { stationId, year, month } = req.query;
  if (!stationId || !year || !month) {
    return res.status(400).json({ error: 'stationId, year, and month are required' });
  }
  const record = sealLedger.get(keyFor(stationId, year, month)) || {
    state: 'OPEN',
    transitionedAt: null,
    transitionedBy: null,
  };
  res.json({ stationId, year: Number(year), month: Number(month), ...record });
});

// POST /api/month/seal  { stationId, year, month, transition: 'REVIEW' | 'SEALED' }
router.post(
  '/seal',
  authenticateToken,
  authorize('STATION_ADMIN', 'REGIONAL_ADMIN', 'HQ_ADMIN'),
  async (req, res) => {
    try {
      const { stationId, year, month, transition } = req.body || {};
      if (!stationId || !year || !month || !transition) {
        return res.status(400).json({ error: 'stationId, year, month, transition are required' });
      }
      if (!['REVIEW', 'SEALED'].includes(transition)) {
        return res.status(400).json({ error: 'transition must be REVIEW or SEALED' });
      }

      const key = keyFor(stationId, year, month);
      const current = sealLedger.get(key) || { state: 'OPEN' };

      // Enforce state machine: OPEN -> REVIEW -> SEALED. Skipping or reversing is rejected.
      const order = ['OPEN', 'REVIEW', 'SEALED'];
      if (order.indexOf(transition) !== order.indexOf(current.state) + 1) {
        return res.status(409).json({
          error: `Cannot transition from ${current.state} to ${transition}`,
          code: 'INVALID_TRANSITION',
        });
      }

      const next = {
        state: transition,
        transitionedAt: new Date(),
        transitionedBy: req.user.id,
      };
      sealLedger.set(key, next);

      // When sealing, stamp every reading and SLA entry in the month as sealed too.
      if (transition === 'SEALED') {
        const start = new Date(Number(year), Number(month) - 1, 1);
        const end = new Date(Number(year), Number(month), 1);

        const [r, s] = await Promise.all([
          Reading.updateMany(
            { stationId, date: { $gte: start, $lt: end }, status: { $ne: 'sealed' } },
            { $set: { status: 'sealed', sealedAt: new Date(), sealedBy: req.user.id } }
          ),
          SLAEntry.updateMany(
            { stationId, date: { $gte: start, $lt: end }, approvedAt: { $exists: false } },
            { $set: { approvedAt: new Date(), approvedBy: req.user.id } }
          ),
        ]);

        logger.info(`Month sealed by ${req.user.email}`, {
          stationId,
          year,
          month,
          readingsSealed: r.modifiedCount,
          slaApproved: s.modifiedCount,
        });

        return res.json({
          stationId,
          year: Number(year),
          month: Number(month),
          ...next,
          readingsSealed: r.modifiedCount,
          slaApproved: s.modifiedCount,
        });
      }

      logger.info(`Month moved to ${transition} by ${req.user.email}`, { stationId, year, month });
      res.json({ stationId, year: Number(year), month: Number(month), ...next });
    } catch (error) {
      logger.error('Error transitioning month seal:', error);
      res.status(500).json({ error: 'Failed to transition month seal' });
    }
  }
);

module.exports = router;
