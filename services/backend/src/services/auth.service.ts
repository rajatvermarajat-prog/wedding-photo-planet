import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { socketManager } from '../sockets/socketServer';
import { logAudit } from '../middleware/audit';
import {
  UserStatus,
  SessionStatus,
  LogoutReason,
  WorkSessionStatus,
  WorkSessionEndReason,
  TaskStatus,
  ActivityType,
} from '@prisma/client';
import { ClientDeviceInfo } from '../types';

export class AuthService {
  /**
   * Member / Admin Login
   */
  public static async login(
    username: string,
    passwordPlain: string,
    deviceInfo: ClientDeviceInfo
  ) {
    // 1. Find user by username
    const user = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    if (!user) {
      await logAudit({
        action: 'FAILED_LOGIN',
        module: 'AUTH',
        newValue: { username, reason: 'USER_NOT_FOUND', ip: deviceInfo.ipAddress },
      });
      throw { statusCode: 401, message: 'Invalid username or password', errorCode: 'INVALID_CREDENTIALS' };
    }

    // 2. Check User Status
    if (user.status !== UserStatus.ACTIVE) {
      throw {
        statusCode: 403,
        message: `Account is ${user.status}. Please contact the Administrator.`,
        errorCode: 'ACCOUNT_DISABLED',
      };
    }

    // 3. Verify Password
    const isMatch = await comparePassword(passwordPlain, user.password_hash);
    if (!isMatch) {
      await logAudit({
        userId: user.id,
        action: 'FAILED_LOGIN',
        module: 'AUTH',
        newValue: { username, reason: 'WRONG_PASSWORD', ip: deviceInfo.ipAddress },
      });
      throw { statusCode: 401, message: 'Invalid username or password', errorCode: 'INVALID_CREDENTIALS' };
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const sessionToken = crypto.randomBytes(32).toString('hex');

    // 4. If ALLOW_MULTIPLE_SESSIONS is false, revoke any prior active sessions
    if (!env.ALLOW_MULTIPLE_SESSIONS) {
      const activeSessions = await prisma.session.findMany({
        where: { user_id: user.id, status: SessionStatus.ACTIVE },
      });

      for (const oldSession of activeSessions) {
        await prisma.session.update({
          where: { id: oldSession.id },
          data: {
            status: SessionStatus.REVOKED,
            revoked_at: now,
            revoke_reason: 'NEW_LOGIN_REVOKED_PREVIOUS_SESSION',
          },
        });

        // Update login history for previous session
        await prisma.loginHistory.updateMany({
          where: { session_id: oldSession.id, logout_at: null },
          data: {
            logout_at: now,
            logout_reason: LogoutReason.SESSION_REVOKED,
          },
        });

        // Notify client if they were connected
        socketManager.emitToUser(user.id, 'session:revoked', {
          reason: 'Your account was logged in from another device/browser.',
          revokedAt: now,
        });
      }
    }

    // 5. Create new Session record
    const newSession = await prisma.session.create({
      data: {
        user_id: user.id,
        session_token: sessionToken,
        login_at: now,
        last_activity_at: now,
        expires_at: expiresAt,
        ip_address: deviceInfo.ipAddress,
        user_agent: deviceInfo.userAgent,
        browser: deviceInfo.browser,
        operating_system: deviceInfo.os,
        device: deviceInfo.device,
        status: SessionStatus.ACTIVE,
      },
    });

    // 6. Record Login History
    await prisma.loginHistory.create({
      data: {
        user_id: user.id,
        session_id: newSession.id,
        login_at: now,
        ip_address: deviceInfo.ipAddress,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        operating_system: deviceInfo.os,
      },
    });

    // 7. Update User's last_login_at and last_activity_at
    await prisma.user.update({
      where: { id: user.id },
      data: {
        last_login_at: now,
        last_activity_at: now,
      },
    });

    // 8. Update / Upsert Attendance for Today
    const todayDate = new Date(now.toISOString().split('T')[0]);
    await prisma.attendance.upsert({
      where: {
        user_id_date: {
          user_id: user.id,
          date: todayDate,
        },
      },
      create: {
        user_id: user.id,
        date: todayDate,
        first_login_at: now,
        total_sessions: 1,
      },
      update: {
        total_sessions: { increment: 1 },
      },
    });

    // 9. Generate JWT
    const token = generateToken({
      userId: user.id,
      sessionId: newSession.id,
      username: user.username,
      role: user.role,
    });

    // 10. Record Audit Log
    await logAudit({
      userId: user.id,
      action: 'LOGIN',
      module: 'AUTH',
      referenceId: newSession.id,
      newValue: { ip: deviceInfo.ipAddress, device: deviceInfo.device, browser: deviceInfo.browser },
    });

    // 11. Broadcast member online via Socket.IO
    socketManager.emitToAdmins('member:online', {
      userId: user.id,
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      onlineAt: now,
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        employee_code: user.employee_code,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        monthly_salary: user.monthly_salary,
        daily_rate: user.daily_rate,
        profile_photo: user.profile_photo,
        current_task_id: user.current_task_id,
        last_login_at: now,
      },
      session: {
        id: newSession.id,
        expiresAt: newSession.expires_at,
      },
    };
  }

  /**
   * Manual Logout
   */
  public static async logout(
    userId: string,
    sessionId: string,
    reason: LogoutReason = LogoutReason.MANUAL_LOGOUT
  ) {
    const now = new Date();

    // 1. Mark session as LOGGED_OUT
    await prisma.session.updateMany({
      where: { id: sessionId },
      data: {
        status: SessionStatus.LOGGED_OUT,
        revoked_at: now,
        revoke_reason: reason,
      },
    });

    // 2. Update Login History
    await prisma.loginHistory.updateMany({
      where: { session_id: sessionId, logout_at: null },
      data: {
        logout_at: now,
        logout_reason: reason,
      },
    });

    // 3. If there is an active WorkSession, end it
    const activeWorkSession = await prisma.workSession.findFirst({
      where: { user_id: userId, status: WorkSessionStatus.ACTIVE },
    });

    if (activeWorkSession) {
      const startedAt = activeWorkSession.started_at.getTime();
      const activeSec = Math.max(0, Math.floor((now.getTime() - startedAt) / 1000));

      await prisma.workSession.update({
        where: { id: activeWorkSession.id },
        data: {
          status: WorkSessionStatus.PAUSED,
          ended_at: now,
          end_reason: WorkSessionEndReason.MANUAL_PAUSE,
          active_seconds: { increment: activeSec },
        },
      });

      // Update Task status
      await prisma.task.update({
        where: { id: activeWorkSession.task_id },
        data: {
          status: TaskStatus.PAUSED,
          actual_minutes: { increment: Math.round(activeSec / 60) },
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { current_task_id: null },
      });
    }

    // 4. Update today's attendance last_logout_at
    const todayDate = new Date(now.toISOString().split('T')[0]);
    await prisma.attendance.updateMany({
      where: { user_id: userId, date: todayDate },
      data: { last_logout_at: now },
    });

    // 5. Audit Log
    await logAudit({
      userId,
      action: 'LOGOUT',
      module: 'AUTH',
      referenceId: sessionId,
      newValue: { reason },
    });

    // 6. Broadcast offline
    socketManager.emitToAdmins('member:offline', {
      userId,
      offlineAt: now,
    });

    return { message: 'Logged out successfully' };
  }

  /**
   * Heartbeat / Activity Ping
   * Authoritative update of user and session activity timestamps.
   */
  public static async heartbeat(
    userId: string,
    sessionId: string,
    activityType: ActivityType = ActivityType.HEARTBEAT,
    metadata?: any,
    deviceInfo?: ClientDeviceInfo
  ) {
    const now = new Date();

    // 1. Update Session last_activity_at
    await prisma.session.update({
      where: { id: sessionId },
      data: { last_activity_at: now },
    });

    // 2. Update User last_activity_at
    await prisma.user.update({
      where: { id: userId },
      data: { last_activity_at: now },
    });

    // 3. Update Active WorkSession if exists
    const activeWorkSession = await prisma.workSession.findFirst({
      where: { user_id: userId, status: WorkSessionStatus.ACTIVE },
    });

    if (activeWorkSession) {
      await prisma.workSession.update({
        where: { id: activeWorkSession.id },
        data: { last_activity_at: now },
      });
    }

    // 4. Record Activity Log (sample rate / debounced metadata)
    if (activityType !== ActivityType.HEARTBEAT || Math.random() < 0.1) {
      await prisma.activityLog.create({
        data: {
          user_id: userId,
          session_id: sessionId,
          work_session_id: activeWorkSession?.id || null,
          task_id: activeWorkSession?.task_id || null,
          activity_type: activityType,
          metadata: metadata ? JSON.stringify(metadata) : null,
          ip_address: deviceInfo?.ipAddress || null,
          user_agent: deviceInfo?.userAgent || null,
        },
      });
    }

    return {
      status: 'active',
      lastActivityAt: now,
      hasActiveTask: !!activeWorkSession,
      activeTaskId: activeWorkSession?.task_id || null,
    };
  }

  /**
   * Get Current Authenticated User Profile with Task & WorkSession State
   */
  public static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        work_sessions: {
          where: { status: WorkSessionStatus.ACTIVE },
          include: {
            task: {
              include: { project: true, client: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found', errorCode: 'USER_NOT_FOUND' };
    }

    return {
      id: user.id,
      username: user.username,
      employee_code: user.employee_code,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      monthly_salary: user.monthly_salary,
      daily_rate: user.daily_rate,
      profile_photo: user.profile_photo,
      current_task_id: user.current_task_id,
      last_login_at: user.last_login_at,
      last_activity_at: user.last_activity_at,
      activeWorkSession: user.work_sessions[0] || null,
    };
  }
}
