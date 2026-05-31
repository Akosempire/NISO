// Legacy scaffold note:
// `src/server.js` is the active MongoDB/Mongoose backend entrypoint.
// This TypeScript file belongs to the earlier Prisma/PostgreSQL scaffold and
// is retained only as historical reference until the legacy path is removed.

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'express-async-errors';
import { config } from './config';
import { auditLog, errorHandler } from './middleware';

// Routes
import authRoutes from './routes/auth.routes';
import readingRoutes from './routes/readings.routes';
import slaRoutes from './routes/sla.routes';
import interruptionRoutes from './routes/interruptions.routes';
import healthRoutes from './routes/health.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (no auth)
app.use('/api', healthRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', readingRoutes);
app.use('/api', slaRoutes);
app.use('/api', interruptionRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`NISO Backend listening on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

export default app;
