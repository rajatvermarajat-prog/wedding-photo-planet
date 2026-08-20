import { prisma } from '../config/prisma';

export class AuditService {
  public static async getAuditLogs(filters?: {
    userId?: string;
    module?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    if (filters?.userId) where.user_id = filters.userId;
    if (filters?.module) where.module = filters.module;
    if (filters?.action) where.action = { contains: filters.action };

    if (filters?.startDate || filters?.endDate) {
      where.created_at = {};
      if (filters.startDate) where.created_at.gte = new Date(filters.startDate);
      if (filters.endDate) where.created_at.lte = new Date(filters.endDate);
    }

    const take = filters?.limit || 100;
    const skip = filters?.offset || 0;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              full_name: true,
              employee_code: true,
              role: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take,
        skip,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total, limit: take, offset: skip };
  }
}
