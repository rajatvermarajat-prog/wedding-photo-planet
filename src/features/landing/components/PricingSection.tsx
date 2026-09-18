import Link from 'next/link';
import { pricingPlans } from '../data/pricingData';
import { LandingSection, SectionHeader } from './SectionChrome';

export function PricingSection() {
  return (
    <LandingSection id="pricing">
      <SectionHeader
        eyebrow="Pricing"
        title="Configurable plans for the ecosystem"
        description="Pricing is structured for product clarity only. Final commercial terms should be configured with real business data before launch."
        align="center"
      />
      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <article key={plan.name} className={`rounded-[1.75rem] border p-6 shadow-sm ${plan.highlighted ? 'border-[#8D5265] bg-[#5A2F3E] text-white' : 'border-[#DFD9D2] bg-white text-[#302C2E]'}`}>
            <p className={`text-[11px] font-extrabold uppercase tracking-[.16em] ${plan.highlighted ? 'text-[#DDC89C]' : 'text-[#8D5265]'}`}>{plan.label}</p>
            <h3 className="mt-4 text-2xl font-black">{plan.name}</h3>
            <p className={`mt-2 text-3xl font-black ${plan.highlighted ? 'text-white' : 'text-[#5A2F3E]'}`}>{plan.price}</p>
            <p className={`mt-4 text-sm font-medium leading-6 ${plan.highlighted ? 'text-[#E8DDD7]' : 'text-[#686164]'}`}>{plan.description}</p>
            <ul className="mt-6 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className={`text-sm font-bold ${plan.highlighted ? 'text-[#F0EDE9]' : 'text-[#5B5558]'}`}>{feature}</li>
              ))}
            </ul>
            <Link href={plan.href} className={`mt-7 inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-extrabold transition ${plan.highlighted ? 'bg-white text-[#5A2F3E] hover:bg-[#F0EDE9]' : 'border border-[#DFD9D2] bg-[#F7F6F3] text-[#5A2F3E] hover:border-[#B99A5E]'}`}>
              {plan.cta}
            </Link>
          </article>
        ))}
      </div>
    </LandingSection>
  );
}
