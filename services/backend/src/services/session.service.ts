import { prisma } from '../config/prisma';
import { socketManager } from '../sockets/socketServer';
import { logAudit } from '../middleware/audit';
import { SessionStatus, LogoutReason, WorkSessionStatus, WorkSessionEndReason, TaskStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../types';

export class SessionService {
  public static async getAllSessions(filters?: { status?: SessionStatus; userId?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.userId) where.user_id = filters.userId;

    return prisma.session.findMany({
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
      orderBy: { login_at: 'desc' },
      take: 100,
    });
  }

  public static async getMemberSessions(userId: string) {
    return prisma.session.findMany({
      where: { user_id: userId },
      orderBy: { login_at: 'desc' },
      take: 50,
    });
  }

  public static async revokeSession(
    sessionId: string,
    adminId: string,
    reason = 'ADMIN_MANUAL_REVOKE',
    req?: AuthenticatedRequest
  ) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session) {
      throw { statusCode: 404, message: 'Session not found', errorCode: 'SESSION_NOT_FOUND' };
    }

    const now = new Date();

    // 1. Update Session to REVOKED
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.REVOKED,
        revoked_at: now,
        revoke_reason: reason,
      },
    });

    // 2. Update Login History
    await prisma.loginHistory.updateMany({
      where: { session_id: sessionId, logout_at: null },
      data: {
        logout_at: now,
        logout_reason: LogoutReason.ADMIN_LOGOUT,
      },
    });

    // 3. If there is an active WorkSession for this user, pause it
    const activeWorkSession = await prisma.workSession.findFirst({
      where: { user_id: session.user_id, status: WorkSessionStatus.ACTIVE },
    });

    if (activeWorkSession) {
      const activeDuration = Math.max(0, Math.floor((now.getTime() - activeWorkSession.started_at.getTime()) / 1000));
      await prisma.workSession.update({
        where: { id: activeWorkSession.id },
        data: {
          status: WorkSessionStatus.PAUSED,
          ended_at: now,
          end_reason: WorkSessionEndReason.ADMIN_STOP,
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
        where: { id: session.user_id },
        data: { current_task_id: null },
      });
    }

    // 4. Audit Log
    await logAudit({
      userId: adminId,
      action: 'SESSION_REVOKED',
      module: 'SESSIONS',
      referenceId: sessionId,
      newValue: { targetUser: session.user.username, reason },
      req,
    });

    // 5. Socket broadcast to force logout on client
    socketManager.emitToUser(session.user_id, 'session:revoked', {
      sessionId,
      reason: 'Your session has been terminated by an Administrator.',
      revokedAt: now,
    });

    return updatedSession;
  }

  public static async getLoginHistory(filters?: { userId?: string; search?: string }) {
    const where: any = {};
    if (filters?.userId) where.user_id = filters.userId;

    return prisma.loginHistory.findMany({
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
      orderBy: { login_at: 'desc' },
      take: 100,
    });
  }
}
