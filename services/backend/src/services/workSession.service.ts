import { prisma } from '../config/prisma';
import { socketManager } from '../sockets/socketServer';
import { logAudit } from '../middleware/audit';
import {
  TaskStatus,
  WorkSessionStatus,
  WorkSessionEndReason,
  ActivityType,
  NotificationType,
  Role,
} from '@prisma/client';
import { AuthenticatedRequest } from '../types';

export class WorkSessionService {
  /**
   * Start Work on a Task (Creates WorkSession and begins monitoring)
   */
  public static async startWork(taskId: string, userId: string, req?: AuthenticatedRequest) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true, client: true },
    });

    if (!task) {
      throw { statusCode: 404, message: 'Task not found', errorCode: 'TASK_NOT_FOUND' };
    }

    // Permission check: Task must be assigned to logged-in user unless Admin/Manager
    if (task.assigned_to !== userId && req?.user?.role === Role.MEMBER) {
      throw {
        statusCode: 403,
        message: 'You can only start work on tasks assigned to you',
        errorCode: 'FORBIDDEN_TASK_ACCESS',
      };
    }

    const now = new Date();

    // 1. If user already has an active work session on any task, automatically pause it first
    const existingActiveSession = await prisma.workSession.findFirst({
      where: { user_id: userId, status: WorkSessionStatus.ACTIVE },
    });

    if (existingActiveSession) {
      const activeDurationSec = Math.max(
        0,
        Math.floor((now.getTime() - existingActiveSession.started_at.getTime()) / 1000)
      );

      await prisma.workSession.update({
        where: { id: existingActiveSession.id },
        data: {
          status: WorkSessionStatus.PAUSED,
          ended_at: now,
          end_reason: WorkSessionEndReason.MANUAL_PAUSE,
          active_seconds: { increment: activeDurationSec },
        },
      });

      await prisma.task.update({
        where: { id: existingActiveSession.task_id },
        data: {
          status: TaskStatus.PAUSED,
          actual_minutes: { increment: Math.round(activeDurationSec / 60) },
        },
      });
    }

    // 2. Create New Work Session
    const newWorkSession = await prisma.workSession.create({
      data: {
        task_id: taskId,
        user_id: userId,
        started_at: now,
        last_activity_at: now,
        status: WorkSessionStatus.ACTIVE,
      },
    });

    // 3. Update Task to IN_PROGRESS
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.IN_PROGRESS,
        started_at: task.started_at || now,
      },
    });

    // 4. Update User state
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        current_task_id: taskId,
        last_activity_at: now,
      },
      select: {
        id: true,
        username: true,
        full_name: true,
        role: true,
      },
    });

    // 5. Record Activity Log
    await prisma.activityLog.create({
      data: {
        user_id: userId,
        work_session_id: newWorkSession.id,
        task_id: taskId,
        activity_type: ActivityType.WORK_START,
        metadata: JSON.stringify({ taskTitle: task.title, project: task.project?.project_name }),
      },
    });

    // 6. Record Audit Log
    await logAudit({
      userId,
      action: 'TASK_STARTED',
      module: 'WORK_SESSION',
      referenceId: newWorkSession.id,
      newValue: { taskId, title: task.title },
      req,
    });

    // 7. Real-time Live Monitoring Broadcast to Admins
    socketManager.emitToAdmins('member:working', {
      userId,
      username: updatedUser.username,
      fullName: updatedUser.full_name,
      taskId,
      taskTitle: task.title,
      projectName: task.project?.project_name,
      startedAt: now,
    });

    return {
      workSession: newWorkSession,
      task: updatedTask,
    };
  }

  /**
   * Pause Work on a Task
   */
  public static async pauseWork(taskId: string, userId: string, reason = 'MANUAL_PAUSE', req?: AuthenticatedRequest) {
    const now = new Date();

    const activeSession = await prisma.workSession.findFirst({
      where: { task_id: taskId, user_id: userId, status: WorkSessionStatus.ACTIVE },
    });

    if (!activeSession) {
      throw { statusCode: 400, message: 'No active work session found for this task', errorCode: 'NO_ACTIVE_SESSION' };
    }

    const durationSec = Math.max(0, Math.floor((now.getTime() - activeSession.started_at.getTime()) / 1000));

    // 1. End WorkSession
    const endedSession = await prisma.workSession.update({
      where: { id: activeSession.id },
      data: {
        status: WorkSessionStatus.PAUSED,
        ended_at: now,
        end_reason: WorkSessionEndReason.MANUAL_PAUSE,
        active_seconds: { increment: durationSec },
      },
    });

    // 2. Update Task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.PAUSED,
        paused_at: now,
        actual_minutes: { increment: Math.round(durationSec / 60) },
      },
    });

    // 3. Clear User Current Task
    await prisma.user.update({
      where: { id: userId },
      data: { current_task_id: null },
    });

    // 4. Record Activity Log
    await prisma.activityLog.create({
      data: {
        user_id: userId,
        work_session_id: activeSession.id,
        task_id: taskId,
        activity_type: ActivityType.WORK_PAUSE,
        metadata: JSON.stringify({ activeSeconds: durationSec, reason }),
      },
    });

    // 5. Audit Log
    await logAudit({
      userId,
      action: 'TASK_PAUSED',
      module: 'WORK_SESSION',
      referenceId: activeSession.id,
      newValue: { activeSeconds: durationSec, reason },
      req,
    });

    // 6. Socket Broadcast
    socketManager.emitToAdmins('task:paused', {
      userId,
      taskId,
      pausedAt: now,
      durationSec,
    });

    return {
      workSession: endedSession,
      task: updatedTask,
      totalActiveSeconds: endedSession.active_seconds,
    };
  }

  /**
   * Resume Work (Alias to startWork)
   */
  public static async resumeWork(taskId: string, userId: string, req?: AuthenticatedRequest) {
    return this.startWork(taskId, userId, req);
  }

  /**
   * Complete Task
   */
  public static async completeWork(taskId: string, userId: string, req?: AuthenticatedRequest) {
    const now = new Date();

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      throw { statusCode: 404, message: 'Task not found', errorCode: 'TASK_NOT_FOUND' };
    }

    // 1. If active work session exists, end it as COMPLETED
    const activeSession = await prisma.workSession.findFirst({
      where: { task_id: taskId, user_id: userId, status: WorkSessionStatus.ACTIVE },
    });

    let activeSec = 0;
    if (activeSession) {
      activeSec = Math.max(0, Math.floor((now.getTime() - activeSession.started_at.getTime()) / 1000));
      await prisma.workSession.update({
        where: { id: activeSession.id },
        data: {
          status: WorkSessionStatus.COMPLETED,
          ended_at: now,
          end_reason: WorkSessionEndReason.TASK_COMPLETED,
          active_seconds: { increment: activeSec },
        },
      });
    }

    // 2. Mark Task COMPLETED
    const completedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.COMPLETED,
        completed_at: now,
        actual_minutes: { increment: Math.round(activeSec / 60) },
      },
    });

    // 3. Clear User current task
    await prisma.user.update({
      where: { id: userId },
      data: { current_task_id: null },
    });

    // 4. Create Activity & Audit logs
    await prisma.activityLog.create({
      data: {
        user_id: userId,
        task_id: taskId,
        activity_type: ActivityType.WORK_COMPLETE,
        metadata: JSON.stringify({ taskTitle: task.title }),
      },
    });

    await logAudit({
      userId,
      action: 'TASK_COMPLETED',
      module: 'TASKS',
      referenceId: taskId,
      newValue: { completed_at: now, actual_minutes: completedTask.actual_minutes },
      req,
    });

    // 5. Notify Admins and Managers
    const adminManagers = await prisma.user.findMany({
      where: { role: { in: [Role.ADMIN, Role.MANAGER] }, status: 'ACTIVE' },
      select: { id: true },
    });

    for (const adm of adminManagers) {
      await prisma.notification.create({
        data: {
          user_id: adm.id,
          type: NotificationType.TASK_COMPLETED,
          title: `Task Completed: ${task.title}`,
          message: `Member completed task '${task.title}' on project '${task.project?.project_name || 'General'}'.`,
          reference_id: taskId,
          reference_type: 'TASK',
        },
      });
    }

    // 6. Broadcast Real-time event
    socketManager.emitToAdmins('task:completed', {
      userId,
      taskId,
      taskTitle: task.title,
      completedAt: now,
    });

    return completedTask;
  }
}
