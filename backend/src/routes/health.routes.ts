import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

/**
 * GET /api/health
 * Reports Express server status and database connectivity without exposing credentials.
 */
router.get('/health', (_req: Request, res: Response) => {
  const readyState = mongoose.connection.readyState;
  // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  const dbStatusMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isDbConnected = readyState === 1;

  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'ok' : 'degraded',
    server: {
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
    database: {
      status: dbStatusMap[readyState] || 'unknown',
      readyState,
      host: isDbConnected ? mongoose.connection.host : undefined,
    },
  });
});

export default router;
