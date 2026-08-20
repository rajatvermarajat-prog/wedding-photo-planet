import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { authenticate, requireRoles } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Only Admin can view system audit logs
router.get('/', authenticate, requireRoles(Role.ADMIN), AuditController.getAuditLogs);

export default router;
