import { Router } from 'express';
import { z } from 'zod';
import { TaskController } from '../controllers/task.controller';
import { authenticate, requireRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { Role, Priority, TaskCategory, TaskStatus } from '@prisma/client';

const router = Router();

const createTaskSchema = z.object({
  body: z.object({
    project_id: z.string().optional(),
    client_id: z.string().optional(),
    title: z.string().min(2),
    description: z.string().optional(),
    category: z.nativeEnum(TaskCategory).optional(),
    assigned_to: z.string().optional(),
    priority: z.nativeEnum(Priority).optional(),
    due_date: z.string().optional(),
    estimated_minutes: z.number().optional(),
  }),
});

const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    category: z.nativeEnum(TaskCategory).optional(),
    priority: z.nativeEnum(Priority).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    due_date: z.string().optional(),
    estimated_minutes: z.number().optional(),
  }),
});

const reassignTaskSchema = z.object({
  body: z.object({
    new_user_id: z.string().min(1, 'New user ID is required'),
    reason: z.string().min(2, 'Reason for reassignment is required'),
  }),
});

router.get('/', authenticate, TaskController.getAllTasks);
router.get('/:id', authenticate, TaskController.getTaskById);

// Admin & Manager can create tasks
router.post('/', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), validateRequest(createTaskSchema), TaskController.createTask);
router.patch('/:id', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), validateRequest(updateTaskSchema), TaskController.updateTask);

// Task reassignment
router.post('/:id/reassign', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), validateRequest(reassignTaskSchema), TaskController.reassignTask);

// Work Session Action Endpoints
router.post('/:id/start', authenticate, TaskController.startWork);
router.post('/:id/pause', authenticate, TaskController.pauseWork);
router.post('/:id/resume', authenticate, TaskController.resumeWork);
router.post('/:id/complete', authenticate, TaskController.completeTask);

export default router;
