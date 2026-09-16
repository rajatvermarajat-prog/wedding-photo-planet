import { Suspense } from 'react';
import { LoginPageClient } from '@/components/auth/LoginPageClient';

export const metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageClient />
    </Suspense>
  );
}
