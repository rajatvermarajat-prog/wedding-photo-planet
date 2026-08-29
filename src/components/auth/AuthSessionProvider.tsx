'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { authApi, LoginInput, SessionUser } from '@/lib/api/auth';
import { TeamMemberStatus } from '@/types';

export type AuthenticatedUser = Omit<SessionUser, 'status'> & {
  name: string;
  role: string;
  status: TeamMemberStatus;
};

function toAuthenticatedUser(user: SessionUser): AuthenticatedUser {
  const statusMap: Record<string, TeamMemberStatus> = {
    ACTIVE: 'active', INACTIVE: 'inactive', SUSPENDED: 'suspended', ON_LEAVE: 'on_leave',
  };
  return { ...user, name: user.fullName, role: user.roles[0] ?? 'User', status: statusMap[user.status] ?? 'inactive' };
}

interface AuthSessionValue {
  currentUser: AuthenticatedUser | null;
  isHydrated: boolean;
  login: (input: LoginInput) => Promise<AuthenticatedUser>;
  logout: () => Promise<void>;
  refresh: (force?: boolean) => Promise<void>;
}

const AuthSessionContext = createContext<AuthSessionValue | null>(null);
let lastMeAt = 0;

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    authApi.me().then((user) => {
      lastMeAt = Date.now();
      setCurrentUser(toAuthenticatedUser(user));
    }).catch((error: unknown) => {
      if (error instanceof ApiError && (error.status === 401 || error.status === 429)) return;
    }).finally(() => setIsHydrated(true));
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const user = await authApi.login(input);
    const authenticatedUser = toAuthenticatedUser(user);
    setCurrentUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Local session still ends if the API is briefly unreachable.
    } finally {
      setCurrentUser(null);
    }
  }, []);

  const refresh = useCallback(async (force?: boolean) => {
    const now = Date.now();
    if (!force && now - lastMeAt < 15_000) return;
    lastMeAt = now;
    try {
      const user = await authApi.me();
      setCurrentUser(toAuthenticatedUser(user));
    } catch (error: unknown) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 429)) return;
    }
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh(true);
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [refresh]);

  const value = useMemo<AuthSessionValue>(() => ({
    currentUser,
    isHydrated,
    login,
    logout,
    refresh,
  }), [currentUser, isHydrated, login, logout, refresh]);

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const session = useContext(AuthSessionContext);
  if (!session) throw new Error('useAuthSession must be used inside AuthSessionProvider');
  return session;
}
