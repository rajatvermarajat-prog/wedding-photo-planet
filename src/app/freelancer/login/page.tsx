import { redirect } from 'next/navigation';
import { safeReturnPath } from '@/lib/auth/routeProtection';

export default async function FreelancerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const params = await searchParams;
  const returnTo = safeReturnPath(params.returnTo ?? '/freelancer/dashboard');
  redirect(`/login?returnTo=${encodeURIComponent(returnTo.startsWith('/freelancer/') ? returnTo : '/freelancer/dashboard')}`);
}
