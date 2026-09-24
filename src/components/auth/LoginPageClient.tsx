'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { LoginInput } from '@/lib/api/auth';
import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import { safeReturnPath } from '@/lib/auth/routeProtection';

export function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, isHydrated, login } = useAuthSession();
  const returnTo = safeReturnPath(searchParams.get('returnTo'));

  useEffect(() => {
    if (isHydrated && currentUser) router.replace(returnTo);
  }, [currentUser, isHydrated, returnTo, router]);

  const handleLogin = async (input: LoginInput) => {
    await login(input);
    router.replace(returnTo);
  };

  return <LoginScreen onLogin={handleLogin} />;
}
