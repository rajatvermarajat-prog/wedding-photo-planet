import { prisma } from '../config/prisma';
import { socketManager } from '../sockets/socketServer';
import { logAudit } from '../middleware/audit';
import { BreakStatus, WorkSessionStatus, WorkSessionEndReason, TaskStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../types';

export class BreakService {
  /**
   * Start a Break
   */
  public static async startBreak(userId: string, reason = 'Personal Break', req?: AuthenticatedRequest) {
    const now = new Date();

    // 1. Check if break already active
    const existingBreak = await prisma.break.findFirst({
      where: { user_id: userId, status: BreakStatus.ACTIVE },
    });

    if (existingBreak) {
      return existingBreak;
    }

    // 2. If user has an active work session, automatically pause it
    const activeWorkSession = await prisma.workSession.findFirst({
      where: { user_id: userId, status: WorkSessionStatus.ACTIVE },
    });

    if (activeWorkSession) {
      const activeDuration = Math.max(0, Math.floor((now.getTime() - activeWorkSession.started_at.getTime()) / 1000));
      await prisma.workSession.update({
        where: { id: activeWorkSession.id },
        data: {
          status: WorkSessionStatus.PAUSED,
          ended_at: now,
          end_reason: WorkSessionEndReason.MANUAL_PAUSE,
          active_seconds: { increment: activeDuration },
        },
      });

      await prisma.task.update({
        where: { id: activeWorkSession.task_id },
        data: {
          status: TaskStatus.PAUSED,
          actual_minutes: { increment: Math.round(activeDuration / 60) },
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { current_task_id: null },
      });
    }

    // 3. Create active break
    const newBreak = await prisma.break.create({
      data: {
        user_id: userId,
        reason,
        started_at: now,
        status: BreakStatus.ACTIVE,
      },
      include: {
        user: { select: { id: true, username: true, full_name: true } },
      },
    });

    // 4. Audit Log
    await logAudit({
      userId,
      action: 'BREAK_STARTED',
      module: 'BREAKS',
      referenceId: newBreak.id,
      newValue: { reason },
      req,
    });

    // 5. Broadcast to Admins
    socketManager.emitToAdmins('member:break', {
      userId,
      username: newBreak.user.username,
      fullName: newBreak.user.full_name,
      reason,
      startedAt: now,
    });

    return newBreak;
  }

  /**
   * End Break
   */
  public static async endBreak(userId: string, req?: AuthenticatedRequest) {
    const now = new Date();

    const activeBreak = await prisma.break.findFirst({
      where: { user_id: userId, status: BreakStatus.ACTIVE },
      include: { user: true },
    });

    if (!activeBreak) {
      throw { statusCode: 400, message: 'No active break found', errorCode: 'NO_ACTIVE_BREAK' };
    }

    const durationSec = Math.max(0, Math.floor((now.getTime() - activeBreak.started_at.getTime()) / 1000));

    // 1. Update Break record
    const endedBreak = await prisma.break.update({
      where: { id: activeBreak.id },
      data: {
        status: BreakStatus.COMPLETED,
        ended_at: now,
        duration_seconds: durationSec,
      },
    });

    // 2. Update daily attendance break seconds
    const todayDate = new Date(now.toISOString().split('T')[0]);
    await prisma.attendance.updateMany({
      where: { user_id: userId, date: todayDate },
      data: {
        break_seconds: { increment: durationSec },
      },
    });

    // 3. Audit Log
    await logAudit({
      userId,
      action: 'BREAK_ENDED',
      module: 'BREAKS',
      referenceId: activeBreak.id,
      newValue: { durationSeconds: durationSec },
      req,
    });

    // 4. Broadcast to Admins
    socketManager.emitToAdmins('member:break-ended', {
      userId,
      username: activeBreak.user.username,
      durationSec,
      endedAt: now,
    });

    return endedBreak;
  }

  /**
   * Get Active Breaks for Live Monitoring
   */
  public static async getActiveBreaks() {
    return prisma.break.findMany({
      where: { status: BreakStatus.ACTIVE },
      include: {
        user: { select: { id: true, username: true, full_name: true, role: true, employee_code: true } },
      },
      orderBy: { started_at: 'desc' },
    });
  }
}
