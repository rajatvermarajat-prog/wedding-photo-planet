import { FoundationPage } from '@/components/experience/ExperienceLayouts';

export default async function ClientProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return (
    <FoundationPage
      audience="client"
      eyebrow="Client Portal"
      title="Client project foundation"
      description={`Placeholder for client project access. Project route parameter is ${projectId}.`}
    />
  );
}
