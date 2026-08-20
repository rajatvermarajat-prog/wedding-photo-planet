import { Router } from 'express';
import { z } from 'zod';
import { UserController } from '../controllers/user.controller';
import { authenticate, requireRoles, requireSelfOrAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { Role, UserStatus } from '@prisma/client';

const router = Router();

const createUserSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50),
    employee_code: z.string().min(2).max(50),
    full_name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.nativeEnum(Role).optional(),
    monthly_salary: z.number().optional(),
    daily_rate: z.number().optional(),
  }),
});

const updateUserSchema = z.object({
  body: z.object({
    full_name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    role: z.nativeEnum(Role).optional(),
    status: z.nativeEnum(UserStatus).optional(),
    monthly_salary: z.number().optional(),
    daily_rate: z.number().optional(),
    profile_photo: z.string().optional(),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

// Admin & Manager can list users
router.get('/', authenticate, requireRoles(Role.ADMIN, Role.MANAGER), UserController.getAllUsers);

// Admin can create users
router.post('/', authenticate, requireRoles(Role.ADMIN), validateRequest(createUserSchema), UserController.createUser);

// Member can view their own profile, Admin & Manager can view any
router.get('/:id', authenticate, requireSelfOrAdmin('id'), UserController.getUserById);

// Admin can update any user; Member can update basic profile
router.patch('/:id', authenticate, requireSelfOrAdmin('id'), validateRequest(updateUserSchema), UserController.updateUser);

// Admin can reset password
router.post('/:id/reset-password', authenticate, requireRoles(Role.ADMIN), validateRequest(resetPasswordSchema), UserController.resetPassword);

// Admin can disable user
router.delete('/:id', authenticate, requireRoles(Role.ADMIN), UserController.deleteUser);

export default router;
