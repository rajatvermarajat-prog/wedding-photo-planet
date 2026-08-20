'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import { TeamMember } from '@/types';

export type AuthenticatedUser = TeamMember | {
  id: string;
  name: string;
  role: string;
  email: string;
};

interface AuthSessionValue {
  currentUser: AuthenticatedUser | null;
  login: (user: AuthenticatedUser) => void;
  logout: () => void;
}

const AuthSessionContext = createContext<AuthSessionValue | null>(null);

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  // This provider lives in the root layout, so client-side page navigation keeps
  // the session. A full browser refresh recreates it and correctly requires login.
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const value = useMemo<AuthSessionValue>(() => ({
    currentUser,
    login: setCurrentUser,
    logout: () => setCurrentUser(null),
  }), [currentUser]);

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const session = useContext(AuthSessionContext);
  if (!session) throw new Error('useAuthSession must be used inside AuthSessionProvider');
  return session;
}
