import { prisma } from '../config/prisma';
import { socketManager } from '../sockets/socketServer';
import { env } from '../config/env';
import { WorkSessionStatus, Role, BreakStatus } from '@prisma/client';

export class ActivityService {
  /**
   * Live Team Activity Monitoring for Admin / Manager Dashboard
   */
  public static async getLiveTeamActivity() {
    const now = new Date();
    const inactivityMs = env.INACTIVITY_TIMEOUT_MINUTES * 60 * 1000;

    // Fetch all active members
    const members = await prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        username: true,
        full_name: true,
        employee_code: true,
        role: true,
        profile_photo: true,
        last_login_at: true,
        last_activity_at: true,
        current_task_id: true,
        work_sessions: {
          where: { status: WorkSessionStatus.ACTIVE },
          include: {
            task: {
              include: {
                project: { select: { id: true, project_name: true } },
                client: { select: { id: true, name: true } },
              },
            },
          },
        },
        breaks: {
          where: { status: BreakStatus.ACTIVE },
        },
      },
      orderBy: { role: 'asc' },
    });

    const liveData = members.map((member) => {
      const isOnline = socketManager.isUserOnline(member.id);
      const activeWorkSession = member.work_sessions[0];
      const activeBreak = member.breaks[0];

      let activityStatus: 'WORKING' | 'IDLE_WARNING' | 'INACTIVE' | 'BREAK' | 'OFFLINE' = 'OFFLINE';
      let activeDurationSec = 0;
      let idleDurationSec = 0;

      if (!isOnline) {
        activityStatus = 'OFFLINE';
      } else if (activeBreak) {
        activityStatus = 'BREAK';
        activeDurationSec = Math.floor((now.getTime() - activeBreak.started_at.getTime()) / 1000);
      } else if (activeWorkSession) {
        const timeSinceLastActivity = member.last_activity_at
          ? now.getTime() - member.last_activity_at.getTime()
          : 0;

        activeDurationSec = Math.max(
          0,
          Math.floor((now.getTime() - activeWorkSession.started_at.getTime()) / 1000)
        );

        if (timeSinceLastActivity >= inactivityMs) {
          activityStatus = 'IDLE_WARNING';
          idleDurationSec = Math.floor(timeSinceLastActivity / 1000);
        } else {
          activityStatus = 'WORKING';
        }
      } else {
        activityStatus = 'INACTIVE';
      }

      return {
        member: {
          id: member.id,
          username: member.username,
          fullName: member.full_name,
          employeeCode: member.employee_code,
          role: member.role,
          profilePhoto: member.profile_photo,
        },
        isOnline,
        status: activityStatus,
        lastLoginAt: member.last_login_at,
        lastActivityAt: member.last_activity_at,
        activeTask: activeWorkSession
          ? {
              id: activeWorkSession.task.id,
              title: activeWorkSession.task.title,
              category: activeWorkSession.task.category,
              priority: activeWorkSession.task.priority,
              projectName: activeWorkSession.task.project?.project_name || 'General Project',
              clientName: activeWorkSession.task.client?.name || 'Studio Client',
              startedAt: activeWorkSession.started_at,
            }
          : null,
        activeDurationSec,
        idleDurationSec,
        activeBreak: activeBreak
          ? {
              id: activeBreak.id,
              reason: activeBreak.reason,
              startedAt: activeBreak.started_at,
            }
          : null,
      };
    });

    return liveData;
  }

  /**
   * Get Activity Logs for Member
   */
  public static async getMemberActivity(userId: string, limit = 50, offset = 0) {
    return prisma.activityLog.findMany({
      where: { user_id: userId },
      include: {
        task: { select: { id: true, title: true } },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get Activity Logs for Task
   */
  public static async getTaskActivity(taskId: string) {
    return prisma.activityLog.findMany({
      where: { task_id: taskId },
      include: {
        user: { select: { id: true, username: true, full_name: true, role: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
