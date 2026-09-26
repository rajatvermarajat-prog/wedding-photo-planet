'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { LoginInput } from '@/lib/api/auth';
import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import { safeReturnPath } from '@/lib/auth/routeProtection';
import { loginMockFreelancer } from '@/features/freelancer-growth/mockFreelancerStore';

export function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, isHydrated, login } = useAuthSession();
  const returnTo = safeReturnPath(searchParams.get('returnTo'));
  const loginRedirectingRef = useRef(false);

  useEffect(() => {
    router.prefetch(returnTo);
    if (returnTo !== '/dashboard') router.prefetch('/dashboard');
    void import('@/components/app/CrmApplication');
  }, [returnTo, router]);

  useEffect(() => {
    if (isHydrated && currentUser && !loginRedirectingRef.current) router.replace(returnTo);
  }, [currentUser, isHydrated, returnTo, router]);

  const handleLogin = async (input: LoginInput) => {
    loginRedirectingRef.current = true;
    const go = (path: string) => {
      router.replace(path);
      window.setTimeout(() => {
        if (window.location.pathname + window.location.search !== path) window.location.assign(path);
      }, 100);
    };
    try {
      if (loginMockFreelancer(input.email, input.password)) {
        go('/panel/profile');
        return;
      }
      await login(input);
      go(returnTo);
    } catch (error) {
      loginRedirectingRef.current = false;
      throw error;
    }
  };

  return <LoginScreen onLogin={handleLogin} />;
}
