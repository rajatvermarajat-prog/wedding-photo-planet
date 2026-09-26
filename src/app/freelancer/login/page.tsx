import { Suspense } from 'react';
import { FreelancerLoginPageClient } from '@/features/freelancer-portal/components/FreelancerLoginPageClient';

export default function FreelancerLoginPage() {
  return (
    <Suspense fallback={null}>
      <FreelancerLoginPageClient />
    </Suspense>
  );
}
