import { Response, NextFunction } from 'express';
import { SessionService } from '../services/session.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { SessionStatus } from '@prisma/client';

export class SessionController {
  public static async getAllSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, userId } = req.query;
      const sessions = await SessionService.getAllSessions({
        status: status as SessionStatus,
        userId: userId as string,
      });
      return sendSuccess(res, sessions);
    } catch (error) {
      return next(error);
    }
  }

  public static async getMemberSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sessions = await SessionService.getMemberSessions(req.params.id);
      return sendSuccess(res, sessions);
    } catch (error) {
      return next(error);
    }
  }

  public static async revokeSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body || {};
      const session = await SessionService.revokeSession(
        req.params.id,
        req.user!.id,
        reason || 'Revoked by Admin',
        req
      );
      return sendSuccess(res, session, 'Session revoked successfully');
    } catch (error) {
      return next(error);
    }
  }

  public static async getLoginHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId, search } = req.query;
      const history = await SessionService.getLoginHistory({
        userId: userId as string,
        search: search as string,
      });
      return sendSuccess(res, history);
    } catch (error) {
      return next(error);
    }
  }
}
