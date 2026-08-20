import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { authenticate, requireRoles } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Admin and Manager can view all team attendance records
router.get('/', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), AttendanceController.getAttendance);

// Any member can view their own attendance records
router.get('/my', authenticate, AttendanceController.getMyAttendance);

export default router;
