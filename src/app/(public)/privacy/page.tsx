import { FoundationPage } from '@/components/experience/ExperienceLayouts';

export const metadata = { title: 'Privacy' };

export default function PrivacyPage() {
  return (
    <div className="pt-20">
      <FoundationPage
        audience="public"
        eyebrow="Legal"
        title="Privacy foundation"
        description="Placeholder route for the final Wedding Photo Planet privacy policy. Replace with approved legal copy before launch."
      />
    </div>
  );
}
