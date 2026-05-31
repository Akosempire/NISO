const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authenticateToken, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

// GET /api/users
router.get('/', authenticateToken, authorize('HQ_ADMIN', 'ICT_ADMIN', 'STATION_ADMIN'), async (req, res) => {
  try {
    const filter = {};
    // Station admins see only their station's users
    if (req.user.role === 'STATION_ADMIN' && req.user.stationId) {
      filter.stationId = req.user.stationId;
    }

    const users = await User.find(filter)
      .populate('stationId', 'name code')
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    res.json(users);
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('stationId', 'name code region')
      .select('-passwordHash')
      .lean();

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    logger.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/users  (HQ Admin creates users)
router.post('/', authenticateToken, authorize('HQ_ADMIN', 'ICT_ADMIN'), async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, stationId, regionId } = req.body;
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'email, password, firstName, lastName and role are required' });
    }

    const { ROLES } = require('../models/User');
    if (!ROLES.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Valid: ${ROLES.join(', ')}` });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      role,
      stationId: stationId || null,
      regionId:  regionId  || null,
    });

    logger.info(`User created by ${req.user.email}: ${email}`);

    const populated = await User.findById(newUser._id)
      .populate('stationId', 'name code')
      .select('-passwordHash')
      .lean();

    res.status(201).json(populated);
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PATCH /api/users/:id/disable
router.patch('/:id/disable', authenticateToken, authorize('HQ_ADMIN'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    )
      .select('_id email isActive')
      .lean();

    if (!user) return res.status(404).json({ error: 'User not found' });

    logger.info(`User disabled by ${req.user.email}`, { userId: req.params.id });
    res.json(user);
  } catch (error) {
    logger.error('Error disabling user:', error);
    res.status(500).json({ error: 'Failed to disable user' });
  }
});

module.exports = router;
