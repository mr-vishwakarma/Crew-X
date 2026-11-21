import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types/auth.types.js';
import { verifyToken } from '../utils/jwt.js';
import { env } from '../config/env.js';
import { sendError } from '../utils/response.js';

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // 1. Check HTTP-only cookie first
    let token = req.cookies?.[env.COOKIE_NAME];

    // 2. Check Authorization Bearer header as secondary fallback
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      sendError(res, 'Authentication required. Please sign in.', 401);
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    sendError(res, 'Invalid or expired session. Please sign in again.', 401);
    return;
  }
};

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource`,
        403
      );
      return;
    }

    next();
  };
};
