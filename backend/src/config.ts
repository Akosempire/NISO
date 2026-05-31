// Legacy scaffold note:
// The live backend uses MongoDB via `src/db/connect.js`.
// This Prisma/PostgreSQL config remains only as a legacy reference and should
// not be treated as the active runtime source of truth.

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/niso',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiry: process.env.JWT_EXPIRY || '24h',
  logLevel: process.env.LOG_LEVEL || 'info',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
};

export const prisma = new PrismaClient({
  log:
    config.nodeEnv === 'development'
      ? ['query', 'error', 'warn']
      : ['error']
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
