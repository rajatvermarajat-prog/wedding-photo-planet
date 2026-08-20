import { Response, NextFunction } from 'express';
import { BreakService } from '../services/break.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class BreakController {
  public static async startBreak(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body || {};
      const breakRecord = await BreakService.startBreak(req.user!.id, reason || 'Personal Break', req);
      return sendSuccess(res, breakRecord, 'Break started');
    } catch (error) {
      return next(error);
    }
  }

  public static async endBreak(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const breakRecord = await BreakService.endBreak(req.user!.id, req);
      return sendSuccess(res, breakRecord, 'Break ended');
    } catch (error) {
      return next(error);
    }
  }

  public static async getActiveBreaks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const breaks = await BreakService.getActiveBreaks();
      return sendSuccess(res, breaks);
    } catch (error) {
      return next(error);
    }
  }
}
