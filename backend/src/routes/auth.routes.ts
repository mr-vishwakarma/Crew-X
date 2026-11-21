import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password cannot be empty'),
});

const router = Router();

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), AuthController.login);

// POST /api/auth/logout
router.post('/logout', AuthController.logout);

// GET /api/auth/me
router.get('/me', authenticate, AuthController.getMe);

export default router;
