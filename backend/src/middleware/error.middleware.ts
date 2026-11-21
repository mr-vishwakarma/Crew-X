import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
  });
};

export const errorHandler = (
  err: Error & { code?: number; statusCode?: number },
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  console.error('[Error Occurred]', {
    message: err.message,
    stack: env.isProduction ? undefined : err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'An internal server error occurred',
    ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
