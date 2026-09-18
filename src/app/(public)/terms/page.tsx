import { FoundationPage } from '@/components/experience/ExperienceLayouts';

export const metadata = { title: 'Terms' };

export default function TermsPage() {
  return (
    <div className="pt-20">
      <FoundationPage
        audience="public"
        eyebrow="Legal"
        title="Terms foundation"
        description="Placeholder route for final platform terms. Replace with approved legal copy before launch."
      />
    </div>
  );
}
