import { Action, Container } from '@/features/landing/components/Editorial';
import { PageHeader } from '@/features/landing/components/PageHeader';
import { PricingSection } from '@/features/landing/components/PricingSection';
import { FaqSection } from '@/features/landing/components/FaqSection';

export const metadata = {
  title: 'Pricing',
  description:
    'Wedding Photo Planet is structured around three access tiers — studio, freelancer and client. Commercial terms are quoted per studio.',
};

/**
 * Pricing.
 *
 * Reuses the landing rate card rather than maintaining a second pricing
 * layout, then answers the objections that follow it. Honest about the fact
 * that no number is published yet.
 */
export default function PricingPage() {
  return (
    <>
      <PageHeader
        mark="Pricing"
        title={
          <>
            Three tiers, because a studio, a freelancer and a couple are{' '}
            <em>not the same customer.</em>
          </>
        }
        lead="Commercial terms are still being set, so we publish the structure rather than a number we would have to walk back. Tell us your season volume and we will quote against it."
      >
        <Action href="/contact">Ask for a quote</Action>
      </PageHeader>

      <PricingSection />
      <FaqSection />

      <section className="bg-[var(--ed-paper)]">
        <Container className="py-12">
          <p className="text-[0.8125rem] leading-[1.7] text-[var(--ed-on-paper-dim)]">
            Nothing on this page is a contract. Final pricing, billing terms and any trial period will be
            confirmed in writing before a studio is onboarded.
          </p>
        </Container>
      </section>
    </>
  );
}
