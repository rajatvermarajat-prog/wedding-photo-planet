'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TeamMember } from '@/types';

export type AuthenticatedUser = TeamMember | {
  id: string;
  name: string;
  role: string;
  email: string;
};

interface AuthSessionValue {
  currentUser: AuthenticatedUser | null;
  isHydrated: boolean;
  login: (user: AuthenticatedUser) => void;
  logout: () => void;
}

const AuthSessionContext = createContext<AuthSessionValue | null>(null);
const AUTH_STORAGE_KEY = 'wpp_crm_logged_user';

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser) as AuthenticatedUser;
        if (parsedUser?.id && parsedUser?.name && parsedUser?.role) {
          setCurrentUser(parsedUser);
        } else {
          window.localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const login = useCallback((user: AuthenticatedUser) => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setCurrentUser(null);
  }, []);

  const value = useMemo<AuthSessionValue>(() => ({
    currentUser,
    isHydrated,
    login,
    logout,
  }), [currentUser, isHydrated, login, logout]);

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const session = useContext(AuthSessionContext);
  if (!session) throw new Error('useAuthSession must be used inside AuthSessionProvider');
  return session;
}
