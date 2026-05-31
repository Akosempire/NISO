const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

// Phase 2 — knowledge center + AI assistant.
// Stubs let the frontend render empty states / "assistant unavailable"
// instead of failing on network errors.

// GET /api/knowledge?category=
router.get('/', authenticateToken, async (_req, res) => {
  res.json([]);
});

// GET /api/knowledge/search?q=
router.get('/search', authenticateToken, async (req, res) => {
  const q = String(req.query.q || '').trim();
  logger.info(`Knowledge search by ${req.user.email}`, { q });
  res.json([]);
});

// POST /api/knowledge/ask  { question }
router.post('/ask', authenticateToken, async (req, res) => {
  const { question } = req.body || {};
  if (!question || !String(question).trim()) {
    return res.status(400).json({ error: 'question is required' });
  }
  logger.info(`AI question from ${req.user.email}`, { question: String(question).slice(0, 200) });
  res.status(501).json({
    error: 'AI assistant not yet provisioned. Configure a provider in settings.',
    code: 'AI_UNAVAILABLE',
  });
});

module.exports = router;
