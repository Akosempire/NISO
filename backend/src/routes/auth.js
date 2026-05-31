const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Station = require('../models/Station');
const logger = require('../utils/logger');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), isActive: true })
      .populate('stationId', 'name code region');

    if (!user) {
      logger.warn(`Login failed — not found: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      logger.warn(`Login failed — bad password: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const token = jwt.sign(
      {
        id:         user._id.toString(),
        email:      user.email,
        role:       user.role,
        stationId:  user.stationId?._id?.toString() || null,
        regionId:   user.regionId || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    logger.info(`User logged in: ${email}`);

    res.json({
      token,
      user: {
        id:        user._id.toString(),
        email:     user.email,
        firstName: user.firstName,
        lastName:  user.lastName,
        fullName:  `${user.firstName} ${user.lastName}`.trim(),
        role:      user.role,
        station:   user.stationId
          ? { id: user.stationId._id.toString(), name: user.stationId.name }
          : null,
        regionId:  user.regionId,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/register  (HQ Admin only — protected in production via authorize middleware)
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, stationId, regionId } = req.body;
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'email, password, firstName, lastName and role are required' });
    }

    const User_Model = require('../models/User');
    const { ROLES } = User_Model;
    if (!ROLES.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${ROLES.join(', ')}` });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email:        email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      role,
      stationId:    stationId || null,
      regionId:     regionId || null,
    });

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      user: {
        id:        newUser._id.toString(),
        email:     newUser.email,
        firstName: newUser.firstName,
        lastName:  newUser.lastName,
        role:      newUser.role,
      },
      message: 'User created successfully',
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

module.exports = router;
