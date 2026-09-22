import { ProjectDetailPage } from '@/features/freelancer-portal/components/OperationalPortalPages';

export default async function FreelancerProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <ProjectDetailPage projectId={projectId} />;
}
