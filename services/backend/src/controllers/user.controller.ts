import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { Role, UserStatus } from '@prisma/client';

export class UserController {
  public static async getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { role, status, search } = req.query;
      const users = await UserService.getAllUsers({
        role: role as Role,
        status: status as UserStatus,
        search: search as string,
      });
      return sendSuccess(res, users);
    } catch (error) {
      return next(error);
    }
  }

  public static async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getUserById(req.params.id);
      return sendSuccess(res, user);
    } catch (error) {
      return next(error);
    }
  }

  public static async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.createUser(
        {
          username: req.body.username,
          employee_code: req.body.employee_code,
          full_name: req.body.full_name,
          email: req.body.email,
          phone: req.body.phone,
          passwordPlain: req.body.password,
          role: req.body.role,
          monthly_salary: req.body.monthly_salary ? Number(req.body.monthly_salary) : undefined,
          daily_rate: req.body.daily_rate ? Number(req.body.daily_rate) : undefined,
        },
        req
      );
      return sendSuccess(res, user, 'Member created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  public static async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.updateUser(req.params.id, req.body, req);
      return sendSuccess(res, user, 'Member updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  public static async resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await UserService.resetPassword(req.params.id, req.body.password, req);
      return sendSuccess(res, result, 'Password reset successfully');
    } catch (error) {
      return next(error);
    }
  }

  public static async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await UserService.deleteUser(req.params.id, req);
      return sendSuccess(res, result);
    } catch (error) {
      return next(error);
    }
  }
}
