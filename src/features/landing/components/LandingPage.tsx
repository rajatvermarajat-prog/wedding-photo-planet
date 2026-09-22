import { ClientSection, FreelancerSection, StudioSection } from './AudienceSections';
import { CapabilityIndex } from './CapabilityIndex';
import { FaqSection } from './FaqSection';
import { FinalCta } from './FinalCta';
import { HeroSection } from './HeroSection';
import { PricingSection } from './PricingSection';
import { Process } from './Process';

/**
 * Landing composition.
 *
 * The page alternates ink and paper as its structural rhythm, so the reader
 * crosses a light/dark threshold four times on the way down instead of scrolling
 * through twelve variations of the same white card grid:
 *
 *   ink    hero            — the claim, and the photograph
 *   ink    the index       — what ships today (the set piece)
 *   paper  studios         — the buyer
 *   paper² freelancers     — the supply side
 *   ink    clients         — the cinematic break, written for the couple
 *   paper  the thread      — how the three connect
 *   paper² pricing         — the rate card
 *   ink    questions       — objection handling
 *   paper  closing         — one action
 */
export function LandingPage() {
  return (
    <>
      <HeroSection />
      <CapabilityIndex />
      <StudioSection />
      <FreelancerSection />
      <ClientSection />
      <Process />
      <PricingSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}
