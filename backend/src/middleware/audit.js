const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

/**
 * Audit log middleware — attaches to all mutating routes (POST, PATCH, DELETE).
 * Intercepts res.json() to capture the response payload after it succeeds.
 */
const auditLog = (req, res, next) => {
  if (req.method === 'GET') return next();

  const originalJson = res.json.bind(res);

  res.json = async function (data) {
    // Only log successful mutations
    if (res.statusCode < 400 && req.user) {
      const pathParts   = req.path.split('/').filter(Boolean);
      const entityType  = pathParts[0] || 'unknown';
      const action      = getActionFromMethod(req.method);

      try {
        await AuditLog.create({
          userId:     req.user.id,
          action,
          entityType,
          entityId:   data?._id?.toString() || data?.id?.toString() || req.params.id || null,
          changes:    req.method === 'POST' ? data : { body: req.body, result: data },
          ipAddress:  req.ip || req.connection?.remoteAddress || null,
          userAgent:  req.get('user-agent') || null,
        });
      } catch (err) {
        // Audit failure must never break the response
        logger.warn('Audit log write failed:', err.message);
      }
    }

    return originalJson(data);
  };

  next();
};

/**
 * Sealed record protection middleware.
 * Apply to any route that operates on a Reading by :id.
 * Usage: router.patch('/:id', authenticateToken, protectSealedRecord, ...)
 */
const protectSealedRecord = async (req, res, next) => {
  if (req.method === 'GET') return next();

  const id = req.params.id;
  if (!id) return next();

  try {
    const Reading = require('../models/Reading');
    const reading = await Reading.findById(id).select('status').lean();

    if (!reading) {
      return res.status(404).json({ error: 'Reading not found' });
    }

    if (reading.status === 'sealed') {
      return res.status(409).json({
        error: 'Cannot modify a sealed reading',
        code:  'RECORD_SEALED',
      });
    }

    next();
  } catch (err) {
    logger.error('protectSealedRecord error:', err);
    next(err);
  }
};

function getActionFromMethod(method) {
  switch (method) {
    case 'POST':   return 'create';
    case 'PUT':
    case 'PATCH':  return 'update';
    case 'DELETE': return 'delete';
    default:       return 'unknown';
  }
}

module.exports = { auditLog, protectSealedRecord };
