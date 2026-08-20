import { Router } from 'express';
import { BreakController } from '../controllers/break.controller';
import { authenticate, requireRoles } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.post('/start', authenticate, BreakController.startBreak);
router.post('/end', authenticate, BreakController.endBreak);
router.get('/active', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), BreakController.getActiveBreaks);

export default router;
