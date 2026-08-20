import { Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class AuditController {
  public static async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId, module, action, startDate, endDate, limit, offset } = req.query;

      const result = await AuditService.getAuditLogs({
        userId: userId as string,
        module: module as string,
        action: action as string,
        startDate: startDate as string,
        endDate: endDate as string,
        limit: limit ? parseInt(limit as string) : 100,
        offset: offset ? parseInt(offset as string) : 0,
      });

      return sendSuccess(res, result);
    } catch (error) {
      return next(error);
    }
  }
}
