import { prisma } from '../config/prisma';
import { AttendanceStatus } from '@prisma/client';

export class AttendanceService {
  public static async getAttendance(filters?: {
    userId?: string;
    startDate?: string;
    endDate?: string;
    status?: AttendanceStatus;
  }) {
    const where: any = {};
    if (filters?.userId) where.user_id = filters.userId;
    if (filters?.status) where.status = filters.status;

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    return prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            full_name: true,
            employee_code: true,
            role: true,
            monthly_salary: true,
            daily_rate: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  public static async getMyAttendance(userId: string, startDate?: string, endDate?: string) {
    const where: any = { user_id: userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    return prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }
}
