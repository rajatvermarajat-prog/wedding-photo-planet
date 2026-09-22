import { ShootDetailPage } from '@/features/freelancer-portal/components/OperationalPortalPages';

export default async function FreelancerShootDetailPage({ params }: { params: Promise<{ shootId: string }> }) {
  const { shootId } = await params;
  return <ShootDetailPage shootId={shootId} />;
}
