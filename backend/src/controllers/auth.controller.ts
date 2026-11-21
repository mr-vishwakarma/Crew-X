import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { env } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/auth.types.js';

export class AuthController {
  /**
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const { user, token } = await AuthService.login(email, password);

      // Set secure HTTP-only cookie
      res.cookie(env.COOKIE_NAME, token, {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: env.isProduction ? 'strict' : 'lax',
        maxAge: env.COOKIE_MAX_AGE_MS,
        path: '/',
      });

      sendSuccess(
        res,
        {
          user,
          token, // Returned for client storage or test convenience
        },
        'Authentication successful',
        200
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      // 401 Unauthorized for invalid credentials
      sendError(res, message, 401);
    }
  }

  /**
   * POST /api/auth/logout
   */
  static async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie(env.COOKIE_NAME, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: env.isProduction ? 'strict' : 'lax',
      path: '/',
    });

    sendSuccess(res, null, 'Logged out successfully', 200);
  }

  /**
   * GET /api/auth/me
   */
  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', 401);
        return;
      }

      const user = await AuthService.getMe(req.user.userId);
      sendSuccess(res, { user }, 'User profile retrieved successfully', 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve profile';
      sendError(res, message, 404);
    }
  }
}
