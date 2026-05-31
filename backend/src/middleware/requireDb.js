const { isConnected } = require('../db/connect');

/**
 * Return 503 immediately when MongoDB isn't connected. Without this gate,
 * routes that hit the DB raise opaque MongooseError (since
 * `bufferCommands: false`). With it, the client gets a clear, structured
 * "database unavailable" response that the frontend toast can render.
 */
const requireDb = (req, res, next) => {
  if (isConnected()) return next();
  return res.status(503).json({
    error: 'Database is currently unavailable. Try again shortly.',
    code: 'DB_UNAVAILABLE',
  });
};

module.exports = { requireDb };
