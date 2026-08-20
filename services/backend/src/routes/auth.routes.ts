import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { authLimiter, activityLimiter } from '../middleware/rateLimiter';

const router = Router();

const loginSchema = z.object({
  body: z.object({
    username: z.string().min(2, 'Username must be at least 2 characters'),
    password: z.string().min(4, 'Password must be at least 4 characters'),
  }),
});

const heartbeatSchema = z.object({
  body: z.object({
    activityType: z.string().optional(),
    metadata: z.any().optional(),
  }),
});

router.post('/login', authLimiter, validateRequest(loginSchema), AuthController.login);
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.getMe);
router.post('/heartbeat', activityLimiter, authenticate, validateRequest(heartbeatSchema), AuthController.heartbeat);

export default router;
