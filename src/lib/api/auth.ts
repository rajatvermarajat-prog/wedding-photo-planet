import { apiRequest, setAccessToken } from './client';

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
    const { data } = await apiRequest<{ user: SessionUser; tokens?: { accessToken?: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify(input) },
    );
    setAccessToken(data.tokens?.accessToken ?? null);
    return data.user;
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
      setAccessToken(null);
    }
  },
};
