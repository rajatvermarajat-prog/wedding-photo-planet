import { Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { extractDeviceInfo } from '../utils/userAgent';
import { AuthenticatedRequest } from '../types';
import { ActivityType } from '@prisma/client';

export class AuthController {
  public static async login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const deviceInfo = extractDeviceInfo(req);

      const result = await AuthService.login(username, password, deviceInfo);

      // Set secure HTTP-only cookie
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccess(res, result, 'Login successful');
    } catch (error) {
      return next(error);
    }
  }

  public static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.sessionInfo) {
        return sendError(res, 'Not authenticated', 401);
      }

      await AuthService.logout(req.user.id, req.sessionInfo.id);

      // Clear cookie
      res.clearCookie('token');

      return sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      return next(error);
    }
  }

  public static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const user = await AuthService.getMe(req.user.id);
      return sendSuccess(res, user);
    } catch (error) {
      return next(error);
    }
  }

  public static async heartbeat(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.sessionInfo) {
        return sendError(res, 'Not authenticated', 401);
      }

      const { activityType, metadata } = req.body || {};
      const deviceInfo = extractDeviceInfo(req);

      const result = await AuthService.heartbeat(
        req.user.id,
        req.sessionInfo.id,
        (activityType as ActivityType) || ActivityType.HEARTBEAT,
        metadata,
        deviceInfo
      );

      return sendSuccess(res, result, 'Heartbeat recorded');
    } catch (error) {
      return next(error);
    }
  }
}
