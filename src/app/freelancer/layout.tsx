import { FreelancerPortalShell } from '@/features/freelancer-portal/components/FreelancerPortalShell';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <FreelancerPortalShell>{children}</FreelancerPortalShell>;
}
