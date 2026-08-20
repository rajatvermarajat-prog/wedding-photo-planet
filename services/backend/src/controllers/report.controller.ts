import { Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { AttendanceService } from '../services/attendance.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class ReportController {
  public static async getProductivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const report = await ReportService.getProductivityReport(startDate as string, endDate as string);
      return sendSuccess(res, report);
    } catch (error) {
      return next(error);
    }
  }

  public static async getActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const report = await ReportService.getActivityReport(startDate as string, endDate as string);
      return sendSuccess(res, report);
    } catch (error) {
      return next(error);
    }
  }

  public static async getAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, userId } = req.query;
      const report = await AttendanceService.getAttendance({
        startDate: startDate as string,
        endDate: endDate as string,
        userId: userId as string,
      });
      return sendSuccess(res, report);
    } catch (error) {
      return next(error);
    }
  }
}
