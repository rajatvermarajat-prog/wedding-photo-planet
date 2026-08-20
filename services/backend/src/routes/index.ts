import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import taskRoutes from './task.routes';
import activityRoutes from './activity.routes';
import sessionRoutes from './session.routes';
import breakRoutes from './break.routes';
import notificationRoutes from './notification.routes';
import crmRoutes from './crm.routes';
import attendanceRoutes from './attendance.routes';
import auditRoutes from './audit.routes';
import reportRoutes from './report.routes';
import settingRoutes from './setting.routes';

const router = Router();

// Route modules mounting
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/activity', activityRoutes);
router.use('/sessions', sessionRoutes);
router.use('/breaks', breakRoutes);
router.use('/notifications', notificationRoutes);
router.use('/crm', crmRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/audit', auditRoutes);
router.use('/reports', reportRoutes);
router.use('/settings', settingRoutes);

export default router;
