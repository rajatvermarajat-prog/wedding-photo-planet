'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { LoginInput } from '@/lib/api/auth';
import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import type { AuthenticatedUser } from '@/components/auth/AuthSessionProvider';
import { safeReturnPath } from '@/lib/auth/routeProtection';

const ADMIN_ROLE_KEYS = new Set(['admin', 'super_admin', 'owner', 'studio_owner']);
const ADMIN_PERMISSION_KEYS = new Set(['USER_MANAGE', 'PERMISSION_ASSIGN', 'ORG_UPDATE']);

function roleKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function isAdminCrmAccount(user: AuthenticatedUser): boolean {
  const roles = [user.role, ...(user.roles ?? [])].filter(Boolean).map((role) => roleKey(String(role)));
  if (roles.some((role) => ADMIN_ROLE_KEYS.has(role))) return true;
  return (user.permissions ?? []).some((permission) => ADMIN_PERMISSION_KEYS.has(permission));
}

function destinationFor(user: AuthenticatedUser, returnTo: string): string {
  if (isAdminCrmAccount(user)) return returnTo.startsWith('/freelancer/') ? '/dashboard' : returnTo;
  if (user.freelancerProfile) return returnTo.startsWith('/freelancer/') ? returnTo : '/freelancer/dashboard';
  return returnTo.startsWith('/freelancer/') ? '/dashboard' : returnTo;
}

export function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, isHydrated, login } = useAuthSession();
  const returnTo = safeReturnPath(searchParams.get('returnTo'));
  const loginRedirectingRef = useRef(false);

  useEffect(() => {
    router.prefetch(returnTo);
    router.prefetch('/freelancer/dashboard');
    if (returnTo !== '/dashboard') router.prefetch('/dashboard');
    void import('@/components/app/CrmApplication');
  }, [returnTo, router]);

  useEffect(() => {
    if (isHydrated && currentUser && !loginRedirectingRef.current) router.replace(destinationFor(currentUser, returnTo));
  }, [currentUser, isHydrated, returnTo, router]);

  const handleLogin = async (input: LoginInput) => {
    loginRedirectingRef.current = true;
    try {
      const user = await login(input);
      router.replace(destinationFor(user, returnTo));
    } catch (error) {
      loginRedirectingRef.current = false;
      throw error;
    }
  };

  return <LoginScreen onLogin={handleLogin} />;
}
