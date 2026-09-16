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

  if (!isHydrated) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#2b1b21] text-[#f8e9df]">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#b64b70] border-t-transparent" />
          Restoring your studio session…
        </div>
      </main>
    );
  }

  return <LoginScreen onLogin={handleLogin} />;
}
