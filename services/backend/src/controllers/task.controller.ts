import { Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { WorkSessionService } from '../services/workSession.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { Role, TaskStatus, Priority, TaskCategory } from '@prisma/client';

export class TaskController {
  public static async getAllTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { assignedTo, projectId, clientId, status, priority, category, search } = req.query;

      // If user is a MEMBER, only return their own tasks unless explicitly authorized
      let filterAssignedTo = assignedTo as string;
      if (req.user?.role === Role.MEMBER) {
        filterAssignedTo = req.user.id;
      }

      const tasks = await TaskService.getAllTasks({
        assignedTo: filterAssignedTo,
        projectId: projectId as string,
        clientId: clientId as string,
        status: status as TaskStatus,
        priority: priority as Priority,
        category: category as TaskCategory,
        search: search as string,
      });

      return sendSuccess(res, tasks);
    } catch (error) {
      return next(error);
    }
  }

  public static async getTaskById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.getTaskById(req.params.id);

      // Member authorization check
      if (req.user?.role === Role.MEMBER && task.assigned_to !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You cannot view tasks assigned to other members',
          errorCode: 'ACCESS_DENIED',
        });
      }

      return sendSuccess(res, task);
    } catch (error) {
      return next(error);
    }
  }

  public static async createTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.createTask(req.body, req.user!.id, req);
      return sendSuccess(res, task, 'Task created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  public static async updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.updateTask(req.params.id, req.body, req);
      return sendSuccess(res, task, 'Task updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  public static async reassignTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { new_user_id, reason } = req.body;
      const task = await TaskService.reassignTask(req.params.id, new_user_id, reason, req.user!.id, req);
      return sendSuccess(res, task, 'Task reassigned successfully');
    } catch (error) {
      return next(error);
    }
  }

  // Work Session Handlers
  public static async startWork(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await WorkSessionService.startWork(req.params.id, req.user!.id, req);
      return sendSuccess(res, result, 'Work session started. Monitoring is active.');
    } catch (error) {
      return next(error);
    }
  }

  public static async pauseWork(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body || {};
      const result = await WorkSessionService.pauseWork(req.params.id, req.user!.id, reason, req);
      return sendSuccess(res, result, 'Work paused');
    } catch (error) {
      return next(error);
    }
  }

  public static async resumeWork(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await WorkSessionService.resumeWork(req.params.id, req.user!.id, req);
      return sendSuccess(res, result, 'Work session resumed');
    } catch (error) {
      return next(error);
    }
  }

  public static async completeTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await WorkSessionService.completeWork(req.params.id, req.user!.id, req);
      return sendSuccess(res, result, 'Task marked as completed');
    } catch (error) {
      return next(error);
    }
  }
}
