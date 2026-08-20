import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';
import { authenticate, requireRoles, requireSelfOrAdmin } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Admin can view all sessions & login history
router.get('/', authenticate, requireRoles(Role.ADMIN), SessionController.getAllSessions);
router.get('/history', authenticate, requireRoles(Role.ADMIN), SessionController.getLoginHistory);

// Member can view their own sessions
router.get('/member/:id', authenticate, requireSelfOrAdmin('id'), SessionController.getMemberSessions);

// Admin can revoke any session
router.post('/:id/revoke', authenticate, requireRoles(Role.ADMIN), SessionController.revokeSession);

export default router;
