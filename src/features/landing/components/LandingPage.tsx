import { ClientSection, FreelancerSection, StudioSection } from './AudienceSections';
import { FaqSection } from './FaqSection';
import { FeatureShowcase } from './FeatureShowcase';
import { FinalCta } from './FinalCta';
import { GalleryShowcase } from './GalleryShowcase';
import { HeroSection } from './HeroSection';
import { HowItWorks } from './HowItWorks';
import { PricingSection } from './PricingSection';
import { ProductIntro } from './ProductIntro';
import { TrustSection } from './TrustSection';

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <TrustSection />
      <ProductIntro />
      <FeatureShowcase />
      <StudioSection />
      <FreelancerSection />
      <ClientSection />
      <HowItWorks />
      <GalleryShowcase />
      <PricingSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}
