import { Request } from 'express';
import { Role, UserStatus, SessionStatus } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  sessionId: string;
  username: string;
  role: Role;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  employee_code: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: Role;
  status: UserStatus;
  monthly_salary?: number | null;
  daily_rate?: number | null;
  profile_photo?: string | null;
  current_task_id?: string | null;
  last_activity_at?: Date | null;
}

export interface AuthenticatedSession {
  id: string;
  user_id: string;
  session_token: string;
  status: SessionStatus;
  last_activity_at: Date;
  expires_at: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  sessionInfo?: AuthenticatedSession;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
  errors?: any;
}

export interface ClientDeviceInfo {
  ipAddress: string;
  userAgent: string;
  browser: string;
  os: string;
  device: string;
}
