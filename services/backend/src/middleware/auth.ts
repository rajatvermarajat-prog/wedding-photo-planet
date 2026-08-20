import { Response, NextFunction } from 'express';
import { Role, UserStatus, SessionStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.token) {
      // 2. Check HTTP-only cookies
      token = req.cookies.token;
    }

    if (!token) {
      return sendError(res, 'Authentication required. No session token provided.', 401, 'AUTH_REQUIRED');
    }

    // 3. Verify JWT payload
    let payload;
    try {
      payload = verifyToken(token);
    } catch (err: any) {
      return sendError(res, 'Invalid or expired authentication token', 401, 'INVALID_TOKEN');
    }

    // 4. Verify session exists in DB and is ACTIVE
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: { user: true },
    });

    if (!session) {
      return sendError(res, 'Session does not exist or was deleted', 401, 'SESSION_NOT_FOUND');
    }

    if (session.status !== SessionStatus.ACTIVE) {
      let message = 'Session is no longer active. Please login again.';
      if (session.status === SessionStatus.AUTO_LOGGED_OUT) {
        message = 'You have been logged out due to inactivity.';
      } else if (session.status === SessionStatus.REVOKED) {
        message = 'Your session was revoked (logged in from another location or revoked by Admin).';
      }
      return sendError(res, message, 401, `SESSION_${session.status}`);
    }

    if (session.expires_at < new Date()) {
      await prisma.session.update({
        where: { id: session.id },
        data: { status: SessionStatus.EXPIRED },
      });
      return sendError(res, 'Session has expired. Please login again.', 401, 'SESSION_EXPIRED');
    }

    // 5. Verify User status
    const user = session.user;
    if (!user || user.status !== UserStatus.ACTIVE) {
      return sendError(
        res,
        `Account is ${user?.status || 'inactive'}. Please contact your administrator.`,
        403,
        'ACCOUNT_INACTIVE'
      );
    }

    // 6. Attach authenticated data to request
    req.user = {
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
      last_activity_at: user.last_activity_at,
    };

    req.sessionInfo = {
      id: session.id,
      user_id: session.user_id,
      session_token: session.session_token,
      status: session.status,
      last_activity_at: session.last_activity_at,
      expires_at: session.expires_at,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

// RBAC Role Authorization Middleware
export const requireRoles = (...allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401, 'AUTH_REQUIRED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Forbidden: Access requires one of [${allowedRoles.join(', ')}] role.`,
        403,
        'FORBIDDEN_ROLE'
      );
    }

    return next();
  };
};

// Strict Member Self-Access or Admin/Manager Guard
export const requireSelfOrAdmin = (paramKey = 'id') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401, 'AUTH_REQUIRED');
    }

    const targetId = req.params[paramKey];
    if (req.user.role === Role.ADMIN || req.user.role === Role.MANAGER) {
      return next();
    }

    if (req.user.id === targetId) {
      return next();
    }

    return sendError(
      res,
      'Forbidden: You do not have permission to access another member’s data.',
      403,
      'ACCESS_DENIED'
    );
  };
};
