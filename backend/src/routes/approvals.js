const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

// Phase 2 — approvals service. Until the dedicated approvals queue lands,
// these routes return empty/success responses so the SupervisorFlow UI can
// degrade gracefully (and the frontend's FALLBACK_APPROVALS keeps it usable).

// GET /api/approvals?stationId=
router.get('/', authenticateToken, async (_req, res) => {
  res.json([]);
});

// POST /api/approvals/:id/approve { comment? }
router.post(
  '/:id/approve',
  authenticateToken,
  authorize('SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN', 'HQ_ADMIN'),
  async (req, res) => {
    logger.info(`Approval recorded by ${req.user.email}`, {
      id: req.params.id,
      comment: req.body?.comment || null,
    });
    res.json({
      id: req.params.id,
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: req.user.id,
      comment: req.body?.comment || null,
    });
  }
);

// POST /api/approvals/:id/reject { comment }
router.post(
  '/:id/reject',
  authenticateToken,
  authorize('SUPERVISOR', 'STATION_ADMIN', 'REGIONAL_ADMIN', 'HQ_ADMIN'),
  async (req, res) => {
    const { comment } = req.body || {};
    if (!comment || !String(comment).trim()) {
      return res.status(400).json({ error: 'Reject requires a comment' });
    }
    logger.info(`Approval rejected by ${req.user.email}`, {
      id: req.params.id,
      comment,
    });
    res.json({
      id: req.params.id,
      status: 'rejected',
      rejectedAt: new Date(),
      rejectedBy: req.user.id,
      comment,
    });
  }
);

module.exports = router;
