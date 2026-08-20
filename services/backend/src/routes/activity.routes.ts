import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller';
import { authenticate, requireRoles, requireSelfOrAdmin } from '../middleware/auth';
import { activityLimiter } from '../middleware/rateLimiter';
import { Role } from '@prisma/client';

const router = Router();

// Heartbeat endpoint
router.post('/heartbeat', activityLimiter, authenticate, ActivityController.recordHeartbeat);

// Live team activity feed for Admin & Manager
router.get('/live', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), ActivityController.getLiveTeamActivity);

// Activity logs for a specific member
router.get('/member/:id', authenticate, requireSelfOrAdmin('id'), ActivityController.getMemberActivity);

// Activity logs for a specific task
router.get('/task/:id', authenticate, ActivityController.getTaskActivity);

export default router;
