const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn(`Invalid token attempt: ${err.message}`);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by ${req.user.email} for role ${req.user.role}`);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const checkStationAccess = async (req, res, next) => {
  const stationId = req.params.stationId || req.body.station_id;
  
  if (req.user.role === 'HQ Admin' || req.user.role === 'ICT Admin') {
    return next(); // Full access
  }

  if (req.user.station_id && req.user.station_id !== parseInt(stationId)) {
    logger.warn(`Station access violation: user ${req.user.email} attempted ${stationId}`);
    return res.status(403).json({ error: 'Cannot access other stations' });
  }

  next();
};

module.exports = {
  authenticateToken,
  authorize,
  checkStationAccess
};
