import { FoundationPage } from '@/components/experience/ExperienceLayouts';

export default async function ClientGalleryPage({ params }: { params: Promise<{ galleryId: string }> }) {
  const { galleryId } = await params;
  return (
    <FoundationPage
      audience="client"
      eyebrow="Client Portal"
      title="Gallery foundation"
      description={`Placeholder for a future photo-first gallery experience. Gallery route parameter is ${galleryId}.`}
    />
  );
}
