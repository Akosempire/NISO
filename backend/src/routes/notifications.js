const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

// GET /api/notifications?unreadOnly=
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { unreadOnly, limit = 50 } = req.query;
    const filter = { userId: req.user.id };
    if (unreadOnly === 'true') filter.read = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    res.json(notifications);
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { read: true } },
      { new: true }
    ).lean();

    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    logger.error('Error updating notification:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// POST /api/notifications  (system use)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { userId, title, message, type, severity } = req.body;
    if (!userId || !title || !message) {
      return res.status(400).json({ error: 'userId, title and message are required' });
    }

    const notification = await Notification.create({
      userId, title, message,
      type:     type     || 'info',
      severity: severity || 'info',
    });

    logger.info(`Notification created for user ${userId}`);
    res.status(201).json(notification);
  } catch (error) {
    logger.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

module.exports = router;
