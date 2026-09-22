import { Section } from '@/features/landing/components/Editorial';
import { PageHeader } from '@/features/landing/components/PageHeader';
import { LegalNotice } from '@/features/landing/components/LegalNotice';

export const metadata = { title: 'Terms' };

export default function TermsPage() {
  return (
    <>
      <PageHeader
        mark="Legal · Terms"
        title={<>The terms of use.</>}
        lead="Wedding Photo Planet is provided to studios as an operational workspace, and to freelancers and couples through access a studio grants."
      />
      <Section tone="paper">
        <LegalNotice document="platform terms" />
      </Section>
    </>
  );
}
