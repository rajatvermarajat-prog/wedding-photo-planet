import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class NotificationController {
  public static async getUserNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const notifications = await NotificationService.getUserNotifications(req.user!.id, limit);
      return sendSuccess(res, notifications);
    } catch (error) {
      return next(error);
    }
  }

  public static async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const notification = await NotificationService.markAsRead(req.params.id, req.user!.id);
      return sendSuccess(res, notification, 'Notification marked as read');
    } catch (error) {
      return next(error);
    }
  }

  public static async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await NotificationService.markAllAsRead(req.user!.id);
      return sendSuccess(res, null, 'All notifications marked as read');
    } catch (error) {
      return next(error);
    }
  }
}
