const mongoose = require('mongoose');
const dns = require('dns');
const logger = require('../utils/logger');

// Node's default DNS resolver fails SRV queries on some Windows setups
// (querySrv ECONNREFUSED). Force a public resolver for the Atlas lookup.
dns.setServers(['1.1.1.1', '8.8.8.8']);
mongoose.set('bufferCommands', false);

const DB_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

const RETRY_MIN_MS = 5_000;
const RETRY_MAX_MS = 60_000;

let retryAttempt = 0;
let retryTimer = null;

const scheduleReconnect = () => {
  if (retryTimer) return;
  retryAttempt += 1;
  const delay = Math.min(RETRY_MIN_MS * 2 ** (retryAttempt - 1), RETRY_MAX_MS);
  logger.warn(`Will retry MongoDB connection in ${Math.round(delay / 1000)}s (attempt ${retryAttempt})`);
  retryTimer = setTimeout(() => {
    retryTimer = null;
    connectDB().catch(() => {
      /* connectDB already logs + reschedules */
    });
  }, delay);
  retryTimer.unref?.();
};

/**
 * Attempt to connect to MongoDB. Resolves whether the connection succeeded
 * (so the caller can decide how to proceed). On failure, schedules a
 * background reconnect with exponential backoff — server stays up so the
 * frontend can still hit /health, /ready, and degraded routes.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'niso_db',
      serverSelectionTimeoutMS: 10_000,
    });
    retryAttempt = 0;
    logger.info('MongoDB Atlas connected');
    return true;
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err?.message || err}`);
    scheduleReconnect();
    return false;
  }
};

const getDbStatus = () => ({
  readyState: mongoose.connection.readyState,
  state: DB_STATES[mongoose.connection.readyState] || 'unknown',
  host: mongoose.connection.host || null,
  name: mongoose.connection.name || process.env.DB_NAME || 'niso_db',
  retryAttempt,
});

const isConnected = () => mongoose.connection.readyState === 1;

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
  scheduleReconnect();
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB error: ${err?.message || err}`);
});

module.exports = { connectDB, getDbStatus, isConnected };
