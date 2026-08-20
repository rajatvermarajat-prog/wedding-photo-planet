import { prisma } from '../config/prisma';
import { hashPassword } from '../utils/password';
import { logAudit } from '../middleware/audit';
import { Role, UserStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../types';

export class UserService {
  public static async getAllUsers(filters?: { role?: Role; status?: UserStatus; search?: string }) {
    const where: any = {};
    if (filters?.role) where.role = filters.role;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [
        { full_name: { contains: filters.search } },
        { username: { contains: filters.search } },
        { employee_code: { contains: filters.search } },
        { email: { contains: filters.search } },
      ];
    }

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        employee_code: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        monthly_salary: true,
        daily_rate: true,
        profile_photo: true,
        current_task_id: true,
        last_login_at: true,
        last_activity_at: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  public static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        employee_code: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        monthly_salary: true,
        daily_rate: true,
        profile_photo: true,
        current_task_id: true,
        last_login_at: true,
        last_activity_at: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found', errorCode: 'USER_NOT_FOUND' };
    }
    return user;
  }

  public static async createUser(data: {
    username: string;
    employee_code: string;
    full_name: string;
    email: string;
    phone?: string;
    passwordPlain: string;
    role?: Role;
    monthly_salary?: number;
    daily_rate?: number;
  }, req?: AuthenticatedRequest) {
    // 1. Check uniqueness
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: data.username.trim() },
          { employee_code: data.employee_code.trim() },
          { email: data.email.trim() },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username.toLowerCase() === data.username.toLowerCase()) {
        throw { statusCode: 409, message: 'Username already taken', errorCode: 'DUPLICATE_USERNAME' };
      }
      if (existingUser.employee_code.toLowerCase() === data.employee_code.toLowerCase()) {
        throw { statusCode: 409, message: 'Employee code already exists', errorCode: 'DUPLICATE_EMPLOYEE_CODE' };
      }
      throw { statusCode: 409, message: 'Email address already registered', errorCode: 'DUPLICATE_EMAIL' };
    }

    const password_hash = await hashPassword(data.passwordPlain);

    const user = await prisma.user.create({
      data: {
        username: data.username.trim(),
        employee_code: data.employee_code.trim(),
        full_name: data.full_name.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim(),
        password_hash,
        role: data.role || Role.MEMBER,
        status: UserStatus.ACTIVE,
        monthly_salary: data.monthly_salary,
        daily_rate: data.daily_rate,
      },
      select: {
        id: true,
        username: true,
        employee_code: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        monthly_salary: true,
        daily_rate: true,
        created_at: true,
      },
    });

    await logAudit({
      action: 'USER_CREATED',
      module: 'USERS',
      referenceId: user.id,
      newValue: { username: user.username, role: user.role, name: user.full_name },
      req,
    });

    return user;
  }

  public static async updateUser(
    id: string,
    data: {
      full_name?: string;
      email?: string;
      phone?: string;
      role?: Role;
      status?: UserStatus;
      monthly_salary?: number;
      daily_rate?: number;
      profile_photo?: string;
    },
    req?: AuthenticatedRequest
  ) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw { statusCode: 404, message: 'User not found', errorCode: 'USER_NOT_FOUND' };
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        employee_code: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        monthly_salary: true,
        daily_rate: true,
        profile_photo: true,
        updated_at: true,
      },
    });

    await logAudit({
      action: 'USER_UPDATED',
      module: 'USERS',
      referenceId: id,
      oldValue: { role: existing.role, status: existing.status, name: existing.full_name },
      newValue: data,
      req,
    });

    return updated;
  }

  public static async resetPassword(userId: string, newPasswordPlain: string, req?: AuthenticatedRequest) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw { statusCode: 404, message: 'User not found', errorCode: 'USER_NOT_FOUND' };
    }

    const password_hash = await hashPassword(newPasswordPlain);
    await prisma.user.update({
      where: { id: userId },
      data: { password_hash },
    });

    await logAudit({
      action: 'PASSWORD_RESET',
      module: 'USERS',
      referenceId: userId,
      newValue: { message: 'Password reset by admin' },
      req,
    });

    return { message: 'Password reset successfully' };
  }

  public static async deleteUser(id: string, req?: AuthenticatedRequest) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw { statusCode: 404, message: 'User not found', errorCode: 'USER_NOT_FOUND' };
    }

    // Soft-disable user
    const updated = await prisma.user.update({
      where: { id },
      data: { status: UserStatus.DISABLED },
    });

    await logAudit({
      action: 'USER_DISABLED',
      module: 'USERS',
      referenceId: id,
      oldValue: { status: user.status },
      newValue: { status: UserStatus.DISABLED },
      req,
    });

    return { message: 'User disabled successfully', user: updated };
  }
}
