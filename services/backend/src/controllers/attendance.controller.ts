import { Response, NextFunction } from 'express';
import { AttendanceService } from '../services/attendance.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { AttendanceStatus } from '@prisma/client';

export class AttendanceController {
  public static async getAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId, startDate, endDate, status } = req.query;
      const records = await AttendanceService.getAttendance({
        userId: userId as string,
        startDate: startDate as string,
        endDate: endDate as string,
        status: status as AttendanceStatus,
      });
      return sendSuccess(res, records);
    } catch (error) {
      return next(error);
    }
  }

  public static async getMyAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const records = await AttendanceService.getMyAttendance(
        req.user!.id,
        startDate as string,
        endDate as string
      );
      return sendSuccess(res, records);
    } catch (error) {
      return next(error);
    }
  }
}
