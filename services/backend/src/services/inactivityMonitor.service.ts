import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { socketManager } from '../sockets/socketServer';
import { SessionStatus, LogoutReason, WorkSessionStatus, WorkSessionEndReason, TaskStatus, NotificationType } from '@prisma/client';

export class InactivityMonitorService {
  private static timer: NodeJS.Timeout | null = null;
  private static isRunning = false;

  // Start background periodic checker (runs every 30 seconds)
  public static start(intervalMs = 30000) {
    if (this.timer) return;

    console.log(`⏱️ Inactivity Monitor Service started (Check interval: ${intervalMs / 1000}s)`);
    this.timer = setInterval(() => {
      this.checkSessions().catch((err) => {
        console.error('❌ Error during inactivity session check:', err);
      });
    }, intervalMs);
  }

  public static stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('🛑 Inactivity Monitor Service stopped');
    }
  }

  public static async checkSessions() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      if (!env.AUTO_LOGOUT_ENABLED) {
        this.isRunning = false;
        return;
      }

      const now = new Date();
      const inactivityMs = env.INACTIVITY_TIMEOUT_MINUTES * 60 * 1000;
      const gracePeriodMs = env.GRACE_PERIOD_MINUTES * 60 * 1000;
      const totalTimeoutMs = inactivityMs + gracePeriodMs;

      // 1. Fetch all ACTIVE sessions
      const activeSessions = await prisma.session.findMany({
        where: {
          status: SessionStatus.ACTIVE,
        },
        include: {
          user: {
            include: {
              work_sessions: {
                where: { status: WorkSessionStatus.ACTIVE },
                include: { task: true },
              },
            },
          },
        },
      });

      for (const session of activeSessions) {
        const user = session.user;
        if (!user) continue;

        const lastActivity = session.last_activity_at.getTime();
        const timeElapsed = now.getTime() - lastActivity;
        const activeWorkSession = user.work_sessions[0];

        // CASE 1: Inactivity exceeds Total Timeout (10m idle + 5m grace = 15m) -> FORCED AUTO LOGOUT
        if (timeElapsed >= totalTimeoutMs) {
          console.log(`🔒 Auto-logging out member ${user.username} (${user.id}) due to ${Math.round(timeElapsed / 60000)}m inactivity`);

          // 1. Revoke session
          await prisma.session.update({
            where: { id: session.id },
            data: {
              status: SessionStatus.AUTO_LOGGED_OUT,
              revoked_at: now,
              revoke_reason: 'INACTIVITY_TIMEOUT_AUTO_LOGOUT',
            },
          });

          // 2. End active work session if any
          if (activeWorkSession) {
            const startedAt = activeWorkSession.startedAt ? new Date(activeWorkSession.startedAt).getTime() : activeWorkSession.started_at.getTime();
            const totalDurationSec = Math.max(0, Math.floor((now.getTime() - startedAt) / 1000));
            const idleSec = Math.min(totalDurationSec, Math.floor(timeElapsed / 1000));
            const activeSec = Math.max(0, totalDurationSec - idleSec);

            await prisma.workSession.update({
              where: { id: activeWorkSession.id },
              data: {
                status: WorkSessionStatus.AUTO_LOGGED_OUT,
                ended_at: now,
                end_reason: WorkSessionEndReason.AUTO_LOGOUT,
                active_seconds: activeWorkSession.active_seconds + activeSec,
                idle_seconds: activeWorkSession.idle_seconds + idleSec,
              },
            });

            // 3. Mark Task as INTERRUPTED
            await prisma.task.update({
              where: { id: activeWorkSession.task_id },
              data: {
                status: TaskStatus.INTERRUPTED,
                actual_minutes: {
                  increment: Math.round(activeSec / 60),
                },
              },
            });

            // Reset current task in User model
            await prisma.user.update({
              where: { id: user.id },
              data: { current_task_id: null },
            });
          }

          // 4. Record LoginHistory logout
          const loginHist = await prisma.loginHistory.findFirst({
            where: { session_id: session.id, logout_at: null },
            orderBy: { login_at: 'desc' },
          });

          if (loginHist) {
            await prisma.loginHistory.update({
              where: { id: loginHist.id },
              data: {
                logout_at: now,
                logout_reason: LogoutReason.INACTIVITY_TIMEOUT,
              },
            });
          }

          // 5. Update user daily attendance record
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
              first_login_at: session.login_at,
              last_logout_at: now,
              auto_logout_count: 1,
            },
            update: {
              last_logout_at: now,
              auto_logout_count: { increment: 1 },
            },
          });

          // 6. Record Audit Log
          await prisma.auditLog.create({
            data: {
              user_id: user.id,
              action: 'AUTO_LOGOUT',
              module: 'AUTH',
              reference_id: session.id,
              new_value: JSON.stringify({
                reason: 'INACTIVITY_TIMEOUT',
                idleMinutes: Math.round(timeElapsed / 60000),
                taskId: activeWorkSession?.task_id,
              }),
              ip_address: session.ip_address,
              user_agent: session.user_agent,
            },
          });

          // 7. Create Admin Notification
          await prisma.notification.create({
            data: {
              user_id: user.id,
              type: NotificationType.AUTO_LOGOUT,
              title: 'Auto-Logged Out Due to Inactivity',
              message: `You were automatically logged out because no CRM activity was detected for over ${env.INACTIVITY_TIMEOUT_MINUTES + env.GRACE_PERIOD_MINUTES} minutes.`,
              reference_id: session.id,
              reference_type: 'SESSION',
            },
          });

          // 8. Trigger real-time Socket.IO auto-logout event
          socketManager.notifyAutoLogout(user.id, {
            reason: 'INACTIVITY_TIMEOUT',
            message: 'You have been logged out because no activity was detected. Please login again to continue your work.',
            taskId: activeWorkSession?.task_id,
          });
        }

        // CASE 2: Inactivity between 10m and 15m (Within Grace Period) -> Send Real-time Idle Warning
        else if (timeElapsed >= inactivityMs && timeElapsed < totalTimeoutMs) {
          const remainingGraceMs = totalTimeoutMs - timeElapsed;
          const remainingGraceMinutes = Math.ceil(remainingGraceMs / 60000);
          const expiresAt = new Date(session.last_activity_at.getTime() + totalTimeoutMs);

          // Emit real-time warning event to member & admins
          socketManager.notifyInactivityWarning(user.id, {
            minutesIdle: Math.floor(timeElapsed / 60000),
            gracePeriodMinutes: remainingGraceMinutes,
            expiresAt,
            taskId: activeWorkSession?.task_id,
            taskTitle: activeWorkSession?.task?.title,
          });
        }
      }
    } catch (err) {
      console.error('❌ Inactivity check iteration failed:', err);
    } finally {
      this.isRunning = false;
    }
  }
}
