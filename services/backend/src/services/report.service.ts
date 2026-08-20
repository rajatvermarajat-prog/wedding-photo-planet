import { prisma } from '../config/prisma';
import { TaskStatus } from '@prisma/client';

export class ReportService {
  /**
   * Productivity Summary Report
   */
  public static async getProductivityReport(startDate?: string, endDate?: string) {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const taskWhere: any = {};
    if (startDate || endDate) taskWhere.created_at = dateFilter;

    const [totalTasks, completedTasks, inProgressTasks, interruptedTasks, users] = await Promise.all([
      prisma.task.count({ where: taskWhere }),
      prisma.task.count({ where: { ...taskWhere, status: TaskStatus.COMPLETED } }),
      prisma.task.count({ where: { ...taskWhere, status: TaskStatus.IN_PROGRESS } }),
      prisma.task.count({ where: { ...taskWhere, status: TaskStatus.INTERRUPTED } }),
      prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          username: true,
          full_name: true,
          role: true,
          assigned_tasks: {
            where: taskWhere,
            select: { id: true, status: true, estimated_minutes: true, actual_minutes: true },
          },
          work_sessions: {
            where: startDate || endDate ? { started_at: dateFilter } : undefined,
            select: { active_seconds: true, idle_seconds: true, status: true },
          },
        },
      }),
    ]);

    const memberProductivity = users.map((u) => {
      const assignedCount = u.assigned_tasks.length;
      const completedCount = u.assigned_tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
      const totalEstimatedMin = u.assigned_tasks.reduce((sum, t) => sum + (t.estimated_minutes || 0), 0);
      const totalActualMin = u.assigned_tasks.reduce((sum, t) => sum + (t.actual_minutes || 0), 0);
      const totalActiveSec = u.work_sessions.reduce((sum, s) => sum + (s.active_seconds || 0), 0);
      const totalIdleSec = u.work_sessions.reduce((sum, s) => sum + (s.idle_seconds || 0), 0);

      return {
        userId: u.id,
        username: u.username,
        fullName: u.full_name,
        role: u.role,
        assignedTasks: assignedCount,
        completedTasks: completedCount,
        completionRate: assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 0,
        totalEstimatedMinutes: totalEstimatedMin,
        totalActualMinutes: totalActualMin,
        totalActiveHours: +(totalActiveSec / 3600).toFixed(2),
        totalIdleHours: +(totalIdleSec / 3600).toFixed(2),
      };
    });

    return {
      summary: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        interruptedTasks,
        overallCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      memberProductivity,
    };
  }

  /**
   * Activity & Work Sessions Report
   */
  public static async getActivityReport(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.started_at = {};
      if (startDate) where.started_at.gte = new Date(startDate);
      if (endDate) where.started_at.lte = new Date(endDate);
    }

    return prisma.workSession.findMany({
      where,
      include: {
        user: { select: { id: true, username: true, full_name: true, role: true } },
        task: {
          select: {
            id: true,
            title: true,
            category: true,
            project: { select: { id: true, project_name: true } },
          },
        },
      },
      orderBy: { started_at: 'desc' },
      take: 200,
    });
  }
}
