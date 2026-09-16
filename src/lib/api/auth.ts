import { apiRequest, hasStoredSession, setAuthTokens } from './client';

export interface SessionUser {
  id: string;
  organizationId: string;
  branchId: string | null;
  email: string;
  fullName: string;
  employeeCode: string | null;
  status: string;
  roles: string[];
  permissions: string[];
  organization: { id: string; name: string; slug: string; currency: string; timezone: string };
}

export interface LoginInput {
  email: string;
  password: string;
  organizationSlug?: string;
}

export const authApi = {
  async login(input: LoginInput): Promise<SessionUser> {
    const { data } = await apiRequest<{
      user: SessionUser;
      tokens?: { accessToken?: string; refreshToken?: string; accessTokenExpiresIn?: number; refreshTokenExpiresIn?: number };
    }>('/auth/login', { method: 'POST', body: JSON.stringify(input) });
    setAuthTokens(data.tokens ?? null);
    return data.user;
  },
  /** True when this browser holds a JavaScript-readable access token. */
  hasSession(): boolean {
    return hasStoredSession();
  },
  async me(): Promise<SessionUser> {
    const { data } = await apiRequest<SessionUser>('/auth/me');
    return data;
  },
  async logout(): Promise<void> {
    try {
      await apiRequest<void>('/auth/logout', { method: 'POST' });
    } catch {
      return;
    } finally {
      setAuthTokens(null);
    }
  },
};
