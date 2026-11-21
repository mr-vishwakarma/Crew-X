import express, { Express } from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

export const createApp = (): Express => {
  const app = express();

  // Trust first proxy (required for secure cookies behind reverse proxies like Vercel/Render)
  app.set('trust proxy', 1);

  // Security HTTP headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // Collect allowed origins from env and defaults
  const envOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((u) => u.trim().replace(/\/$/, ''))
    .filter(Boolean);

  const defaultOrigins = [
    'https://nirikshanx.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
  ];

  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

  // CORS configuration supporting vercel.app domains & multi-frontend URLs
  const corsOptions: CorsOptions = {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ): void => {
      // Allow requests with no origin (mobile apps, Postman, server-to-server)
      if (!origin) {
        callback(null, true);
        return;
      }

      const cleanOrigin = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.includes('localhost') ||
        cleanOrigin.includes('127.0.0.1')
      ) {
        callback(null, true);
        return;
      }

      console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  };

  app.use(cors(corsOptions));

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // HTTP Request Logging in development
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.isProduction ? 'combined' : 'dev'));
  }

  // API Routes - mounted on both /api and root / for universal compatibility
  app.use('/api', routes);
  app.use('/', routes);

  // 404 Handler
  app.use(notFoundHandler);

  // Central Error Handler
  app.use(errorHandler);

  return app;
};
