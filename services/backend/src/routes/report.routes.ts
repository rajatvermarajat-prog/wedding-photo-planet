import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate, requireRoles } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Admin and Manager can access analytical and performance reports
router.get('/productivity', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), ReportController.getProductivity);
router.get('/activity', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), ReportController.getActivity);
router.get('/attendance', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), ReportController.getAttendance);

export default router;
