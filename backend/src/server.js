const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const WebSocket = require('ws');
const dotenv = require('dotenv');
const logger = require('./utils/logger');
const { connectDB, getDbStatus } = require('./db/connect');
const { requireDb } = require('./middleware/requireDb');
const { auditLog } = require('./middleware/audit');
const { demoApi, isDemoFallbackEnabled } = require('./demo-api');

dotenv.config();

const app = express();
const server = http.createServer(app);
const allowedOrigins = new Set(
  [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    ...(process.env.CORS_ORIGIN || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  ]
);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  if (isDemoFallbackEnabled()) {
    res.setHeader('X-NISO-DB-Mode', 'demo-fallback');
  }
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ── Audit middleware — applies to all mutating routes ────────────────────────
app.use(auditLog);

// ── Health & readiness (must not require DB) ─────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    database: getDbStatus(),
  });
});

app.get('/ready', (req, res) => {
  const database = getDbStatus();
  const ready = database.readyState === 1;

  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'degraded',
    timestamp: new Date(),
    database,
  });
});

// ── Routes (gated on DB availability) ─────────────────────────────────────────
// Every data-backed route requires MongoDB. Without this gate, requests hit
// Mongoose with bufferCommands disabled and return opaque errors. With it,
// the client gets a clean 503 + code so the toast UI can degrade gracefully.
app.use('/api', demoApi);
app.use('/api', requireDb);

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/readings',      require('./routes/readings'));
app.use('/api/sla',           require('./routes/sla'));
app.use('/api/interruptions', require('./routes/interruptions'));
app.use('/api/inspections',   require('./routes/inspections'));
app.use('/api/equipment',     require('./routes/equipment'));
app.use('/api/reports',       require('./routes/reports'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/approvals',     require('./routes/approvals'));
app.use('/api/knowledge',     require('./routes/knowledge'));
app.use('/api/month',         require('./routes/month'));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date(),
  });
});

// ── WebSocket ─────────────────────────────────────────────────────────────────
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  logger.info('WebSocket client connected');

  ws.on('close', ()  => logger.info('WebSocket client disconnected'));
  ws.on('error', (e) => logger.error('WebSocket error:', e));
});

// Broadcast helper — used by route handlers
global.broadcast = (message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

// ── Boot ──────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

// Boot the HTTP server immediately so /health and /ready respond even when
// MongoDB is unreachable. connectDB() runs in the background with auto-retry.
server.listen(PORT, () => {
  logger.info(`NISO Backend listening on port ${PORT}`);
  connectDB().catch((err) => {
    logger.error(`Initial MongoDB attempt failed; will retry: ${err?.message || err}`);
  });
});

module.exports = server;
