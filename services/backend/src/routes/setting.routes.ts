import { Router } from 'express';
import { z } from 'zod';
import { SettingController } from '../controllers/setting.controller';
import { authenticate, requireRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { Role } from '@prisma/client';

const router = Router();

const updateSettingSchema = z.object({
  body: z.object({
    key: z.string().min(1, 'Setting key is required'),
    value: z.string().min(1, 'Setting value is required'),
  }),
});

// Authenticated users can read settings
router.get('/', authenticate, SettingController.getAllSettings);

// Only Admin can update system settings
router.post('/', authenticate, requireRoles(Role.ADMIN), validateRequest(updateSettingSchema), SettingController.updateSetting);
router.patch('/', authenticate, requireRoles(Role.ADMIN), validateRequest(updateSettingSchema), SettingController.updateSetting);

export default router;
