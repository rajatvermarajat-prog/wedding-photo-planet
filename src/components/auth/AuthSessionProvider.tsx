'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ApiError, getAccessTokenExpiryMs, hasStoredSession, refreshSession } from '@/lib/api/client';
import { authEvent, authTimer } from '@/lib/auth/authDebug';
import { isFreelancerRoute, isPublicRoute } from '@/lib/auth/routeProtection';
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
const REFRESH_SAFETY_WINDOW_MS = 90_000;
const MIN_REFRESH_DELAY_MS = 5_000;
const STARTUP_SESSION_TIMEOUT_MS = 20_000;

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const refreshTimer = useRef<number | null>(null);
  const authState = useRef<'initializing' | 'authenticated' | 'unauthenticated'>('initializing');

  const transitionAuthState = useCallback((
    next: 'authenticated' | 'unauthenticated',
    reason: string,
    user: AuthenticatedUser | null,
  ) => {
    const previous = authState.current;
    authState.current = next;
    authEvent('AUTH_STATE', {
      source: 'AuthSessionProvider',
      from: previous,
      to: next,
      reason,
      userId: user?.id ?? null,
      email: user?.email ?? null,
    });
    setCurrentUser(user);
  }, []);

  const clearRefreshTimer = useCallback(() => {
    if (!refreshTimer.current) return;
    window.clearTimeout(refreshTimer.current);
    refreshTimer.current = null;
    authTimer('cancelled', { source: 'AuthSessionProvider' });
  }, []);

  const scheduleRefresh = useCallback(() => {
    clearRefreshTimer();
    const expiresAt = getAccessTokenExpiryMs();
    if (!expiresAt) return;
    const delay = Math.max(expiresAt - Date.now() - REFRESH_SAFETY_WINDOW_MS, MIN_REFRESH_DELAY_MS);
    authTimer('scheduled', {
      source: 'AuthSessionProvider',
      expiresAt: new Date(expiresAt).toISOString(),
      scheduledFor: new Date(Date.now() + delay).toISOString(),
      delayMs: delay,
    });
    refreshTimer.current = window.setTimeout(async () => {
      authTimer('fired', { source: 'AuthSessionProvider' });
      const refreshed = await refreshSession();
      if ('reason' in refreshed) {
        authEvent('REFRESH_TIMER_FAILED', {
          source: 'AuthSessionProvider',
          reason: refreshed.reason,
          status: refreshed.status,
        });
        if (refreshed.reason === 'invalid') {
          transitionAuthState('unauthenticated', 'refresh_timer_invalid', null);
        }
        clearRefreshTimer();
        return;
      }
      if (refreshed.data.user) {
        const authenticatedUser = toAuthenticatedUser(refreshed.data.user as SessionUser);
        transitionAuthState('authenticated', 'refresh_timer_success', authenticatedUser);
        lastMeAt = Date.now();
      }
      scheduleRefresh();
    }, delay);
  }, [clearRefreshTimer, transitionAuthState]);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, STARTUP_SESSION_TIMEOUT_MS);
    const restore = async () => {
      if (isFreelancerRoute(pathname)) {
        authEvent('STARTUP_ME_SKIPPED', {
          source: 'AuthSessionProvider',
          reason: 'freelancer_route',
        });
        transitionAuthState('unauthenticated', 'startup_freelancer_route', null);
        setIsHydrated(true);
        return;
      }
      const hasSessionHint = hasStoredSession();
      if (!hasSessionHint && isPublicRoute(pathname)) {
        authEvent('STARTUP_ME_SKIPPED', {
          source: 'AuthSessionProvider',
          reason: 'no_session_hint',
        });
        transitionAuthState('unauthenticated', 'startup_no_session_hint', null);
        setIsHydrated(true);
        return;
      }
      try {
        // `/auth/me` is the authoritative session check. If the JS access token
        // is missing/expired but the httpOnly refresh cookie is still valid,
        // recover the access token once before declaring the browser signed out.
        const user = await authApi.me({ signal: controller.signal });
        if (controller.signal.aborted) return;
        lastMeAt = Date.now();
        transitionAuthState('authenticated', 'startup_me_success', toAuthenticatedUser(user));
        scheduleRefresh();
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          if (timedOut) {
            authEvent('STARTUP_ME_FAILED', {
              source: 'AuthSessionProvider',
              status: 408,
              reason: 'startup_timeout',
            });
            if (!hasStoredSession()) {
              transitionAuthState('unauthenticated', 'startup_timeout_no_session_hint', null);
            }
          }
          return;
        }
        if (error instanceof ApiError && error.status === 401) {
          // `apiRequest` already tried a single-flight refresh before this 401
          // surfaced. If that refresh was rejected it cleared the stored
          // session, so retrying here would only add a second doomed
          // /auth/refresh to every cold start.
          authEvent('STARTUP_ME_FAILED', {
            source: 'AuthSessionProvider',
            status: error.status,
            reason: 'try_refresh_cookie',
          });
          const refreshed = await refreshSession();
          if (refreshed.ok && refreshed.data.user) {
            lastMeAt = Date.now();
            transitionAuthState('authenticated', 'startup_refresh_success', toAuthenticatedUser(refreshed.data.user as SessionUser));
            scheduleRefresh();
          } else if ('reason' in refreshed && refreshed.reason === 'invalid') {
            transitionAuthState('unauthenticated', 'startup_refresh_invalid', null);
          } else if ('reason' in refreshed) {
            authEvent('STARTUP_REFRESH_TRANSIENT', {
              source: 'AuthSessionProvider',
              status: refreshed.status,
              message: refreshed.message,
            });
            transitionAuthState('unauthenticated', 'startup_refresh_transient_no_user', null);
          }
          return;
        }
        if (error instanceof ApiError && error.status === 429) {
          authEvent('STARTUP_ME_RATE_LIMITED', { source: 'AuthSessionProvider', status: error.status });
          return;
        }
        authEvent('STARTUP_ME_FAILED', {
          source: 'AuthSessionProvider',
          status: error instanceof ApiError ? error.status : 0,
          reason: 'non_401',
        });
      } finally {
        window.clearTimeout(timeout);
        if (!cancelled) setIsHydrated(true);
      }
    };
    void restore();
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [pathname, scheduleRefresh, transitionAuthState]);

  const login = useCallback(async (input: LoginInput) => {
    const user = await authApi.login(input);
    const authenticatedUser = toAuthenticatedUser(user);
    // The login response already carries the session user, so no /me is needed.
    lastMeAt = Date.now();
    transitionAuthState('authenticated', 'login_success', authenticatedUser);
    scheduleRefresh();
    return authenticatedUser;
  }, [scheduleRefresh, transitionAuthState]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Local session still ends if the API is briefly unreachable.
    } finally {
      transitionAuthState('unauthenticated', 'manual_logout', null);
      clearRefreshTimer();
    }
  }, [clearRefreshTimer, transitionAuthState]);

  const refresh = useCallback(async (force?: boolean) => {
    if (!force && !hasStoredSession()) return;
    const now = Date.now();
    if (!force && now - lastMeAt < 15_000) return;
    lastMeAt = now;
    try {
      const user = await authApi.me();
      transitionAuthState('authenticated', force ? 'manual_refresh_success' : 'visibility_refresh_success', toAuthenticatedUser(user));
      scheduleRefresh();
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401 && !authApi.hasSession()) {
        // Refresh already failed and the credentials were dropped.
        transitionAuthState('unauthenticated', 'refresh_me_401_no_stored_session', null);
        clearRefreshTimer();
        return;
      }
      if (error instanceof ApiError && (error.status === 401 || error.status === 429)) {
        authEvent('SESSION_REFRESH_IGNORED', {
          source: 'AuthSessionProvider',
          status: error.status,
          reason: error.status === 429 ? 'rate_limited' : 'stored_session_present',
        });
        return;
      }
    }
  }, [clearRefreshTimer, scheduleRefresh, transitionAuthState]);

  useEffect(() => {
    // Not forced: returning to the tab should not re-fetch the session when it
    // was just fetched, and `focus` + `visibilitychange` both fire on return.
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
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
