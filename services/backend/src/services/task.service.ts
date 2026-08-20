import { prisma } from '../config/prisma';
import { socketManager } from '../sockets/socketServer';
import { logAudit } from '../middleware/audit';
import {
  Role,
  TaskStatus,
  Priority,
  TaskCategory,
  WorkSessionStatus,
  WorkSessionEndReason,
  NotificationType,
} from '@prisma/client';
import { AuthenticatedRequest } from '../types';

export class TaskService {
  public static async getAllTasks(filters?: {
    assignedTo?: string;
    projectId?: string;
    clientId?: string;
    status?: TaskStatus;
    priority?: Priority;
    category?: TaskCategory;
    search?: string;
  }) {
    const where: any = {};
    if (filters?.assignedTo) where.assigned_to = filters.assignedTo;
    if (filters?.projectId) where.project_id = filters.projectId;
    if (filters?.clientId) where.client_id = filters.clientId;
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.category) where.category = filters.category;
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    return prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, project_name: true, status: true } },
        client: { select: { id: true, name: true, phone: true } },
        assignee: {
          select: {
            id: true,
            username: true,
            full_name: true,
            employee_code: true,
            profile_photo: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            full_name: true,
          },
        },
        work_sessions: {
          where: { status: WorkSessionStatus.ACTIVE },
        },
      },
      orderBy: [{ priority: 'desc' }, { created_at: 'desc' }],
    });
  }

  public static async getTaskById(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        client: true,
        assignee: {
          select: {
            id: true,
            username: true,
            full_name: true,
            employee_code: true,
            email: true,
            phone: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            full_name: true,
          },
        },
        assignments: {
          include: {
            previous_user: { select: { id: true, full_name: true, username: true } },
            new_user: { select: { id: true, full_name: true, username: true } },
            actor: { select: { id: true, full_name: true, username: true } },
          },
          orderBy: { created_at: 'desc' },
        },
        work_sessions: {
          orderBy: { started_at: 'desc' },
        },
        files: true,
      },
    });

    if (!task) {
      throw { statusCode: 404, message: 'Task not found', errorCode: 'TASK_NOT_FOUND' };
    }
    return task;
  }

  public static async createTask(
    data: {
      project_id?: string;
      client_id?: string;
      title: string;
      description?: string;
      category?: TaskCategory;
      assigned_to?: string;
      priority?: Priority;
      due_date?: Date | string;
      estimated_minutes?: number;
    },
    creatorId: string,
    req?: AuthenticatedRequest
  ) {
    const task = await prisma.task.create({
      data: {
        project_id: data.project_id || null,
        client_id: data.client_id || null,
        title: data.title.trim(),
        description: data.description?.trim(),
        category: data.category || TaskCategory.OTHER,
        assigned_to: data.assigned_to || null,
        assigned_by: creatorId,
        priority: data.priority || Priority.MEDIUM,
        status: TaskStatus.ASSIGNED,
        due_date: data.due_date ? new Date(data.due_date) : null,
        estimated_minutes: data.estimated_minutes || 0,
      },
      include: {
        project: true,
        assignee: true,
      },
    });

    // If assigned to a member, create assignment record & notification
    if (data.assigned_to) {
      await prisma.taskAssignment.create({
        data: {
          task_id: task.id,
          new_user_id: data.assigned_to,
          assigned_by: creatorId,
          reason: 'Initial task assignment',
        },
      });

      const notification = await prisma.notification.create({
        data: {
          user_id: data.assigned_to,
          type: NotificationType.NEW_TASK,
          title: `New Task Assigned: ${task.title}`,
          message: `Task: ${task.title}\nProject: ${task.project?.project_name || 'General'}\nPriority: ${task.priority}\nDue Date: ${task.due_date ? task.due_date.toISOString().split('T')[0] : 'N/A'}`,
          reference_id: task.id,
          reference_type: 'TASK',
        },
      });

      // Emit Socket.IO event to assigned member
      socketManager.notifyTaskAssigned(data.assigned_to, {
        task,
        notification,
      });
    }

    await logAudit({
      userId: creatorId,
      action: 'TASK_CREATED',
      module: 'TASKS',
      referenceId: task.id,
      newValue: { title: task.title, assigned_to: data.assigned_to, priority: task.priority },
      req,
    });

    return task;
  }

  public static async updateTask(
    id: string,
    data: {
      title?: string;
      description?: string;
      category?: TaskCategory;
      priority?: Priority;
      status?: TaskStatus;
      due_date?: Date | string;
      estimated_minutes?: number;
    },
    req?: AuthenticatedRequest
  ) {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      throw { statusCode: 404, message: 'Task not found', errorCode: 'TASK_NOT_FOUND' };
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...data,
        due_date: data.due_date ? new Date(data.due_date) : undefined,
      },
    });

    await logAudit({
      action: 'TASK_UPDATED',
      module: 'TASKS',
      referenceId: id,
      oldValue: existing,
      newValue: updated,
      req,
    });

    return updated;
  }

  public static async reassignTask(
    taskId: string,
    newUserId: string,
    reason: string,
    actorId: string,
    req?: AuthenticatedRequest
  ) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      throw { statusCode: 404, message: 'Task not found', errorCode: 'TASK_NOT_FOUND' };
    }

    const previousUserId = task.assigned_to;

    // If there's an active work session for previous user, pause it
    if (previousUserId) {
      const activeSession = await prisma.workSession.findFirst({
        where: { task_id: taskId, user_id: previousUserId, status: WorkSessionStatus.ACTIVE },
      });

      if (activeSession) {
        const now = new Date();
        const durationSec = Math.floor((now.getTime() - activeSession.started_at.getTime()) / 1000);
        await prisma.workSession.update({
          where: { id: activeSession.id },
          data: {
            status: WorkSessionStatus.PAUSED,
            ended_at: now,
            end_reason: WorkSessionEndReason.ADMIN_STOP,
            active_seconds: { increment: durationSec },
          },
        });
        await prisma.user.update({
          where: { id: previousUserId },
          data: { current_task_id: null },
        });
      }
    }

    // Update Task
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        assigned_to: newUserId,
        status: TaskStatus.REASSIGNED,
      },
    });

    // Create Assignment Log
    await prisma.taskAssignment.create({
      data: {
        task_id: taskId,
        previous_user_id: previousUserId,
        new_user_id: newUserId,
        assigned_by: actorId,
        reason: reason || 'Reassigned by Admin/Manager',
      },
    });

    // Notify New User
    const notification = await prisma.notification.create({
      data: {
        user_id: newUserId,
        type: NotificationType.TASK_REASSIGNED,
        title: `Task Reassigned To You: ${task.title}`,
        message: `Task: ${task.title}\nProject: ${task.project?.project_name || 'General'}\nReason: ${reason || 'Work reassignment'}`,
        reference_id: task.id,
        reference_type: 'TASK',
      },
    });

    socketManager.notifyTaskAssigned(newUserId, { task: updated, notification });

    await logAudit({
      userId: actorId,
      action: 'TASK_REASSIGNED',
      module: 'TASKS',
      referenceId: taskId,
      oldValue: { previous_user_id: previousUserId },
      newValue: { new_user_id: newUserId, reason },
      req,
    });

    return updated;
  }
}
