import { FoundationPage } from '@/components/experience/ExperienceLayouts';

export const metadata = { title: 'Client Login' };

export default function ClientLoginPage() {
  return (
    <FoundationPage
      audience="client"
      eyebrow="Client Portal"
      title="Client login foundation"
      description="Authentication for clients will be implemented later after client identity and project access rules are designed."
    />
  );
}
