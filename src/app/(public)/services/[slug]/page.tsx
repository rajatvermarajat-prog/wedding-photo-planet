import { FoundationPage } from '@/components/experience/ExperienceLayouts';

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const label = slug.split('-').filter(Boolean).join(' ') || 'service';
  return (
    <FoundationPage
      audience="public"
      eyebrow="Public Website"
      title={`${label} foundation`}
      description="Placeholder route for future service detail content. This page currently defines routing and layout only."
    />
  );
}
