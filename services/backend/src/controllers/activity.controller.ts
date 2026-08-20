import { Response, NextFunction } from 'express';
import { ActivityService } from '../services/activity.service';
import { AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { extractDeviceInfo } from '../utils/userAgent';
import { AuthenticatedRequest } from '../types';
import { ActivityType } from '@prisma/client';

export class ActivityController {
  public static async getLiveTeamActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await ActivityService.getLiveTeamActivity();
      return sendSuccess(res, data);
    } catch (error) {
      return next(error);
    }
  }

  public static async getMemberActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const logs = await ActivityService.getMemberActivity(req.params.id, limit, offset);
      return sendSuccess(res, logs);
    } catch (error) {
      return next(error);
    }
  }

  public static async getTaskActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const logs = await ActivityService.getTaskActivity(req.params.id);
      return sendSuccess(res, logs);
    } catch (error) {
      return next(error);
    }
  }

  public static async recordHeartbeat(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { activityType, metadata } = req.body || {};
      const deviceInfo = extractDeviceInfo(req);

      const result = await AuthService.heartbeat(
        req.user!.id,
        req.sessionInfo!.id,
        (activityType as ActivityType) || ActivityType.HEARTBEAT,
        metadata,
        deviceInfo
      );

      return sendSuccess(res, result);
    } catch (error) {
      return next(error);
    }
  }
}
