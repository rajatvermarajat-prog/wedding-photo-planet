import { howItWorks } from '../data/landingContent';
import { LandingSection, SectionHeader } from './SectionChrome';

export function HowItWorks() {
  return (
    <LandingSection>
      <SectionHeader
        eyebrow="How It Works"
        title="Manage. Connect. Deliver."
        description="A simple ecosystem model for wedding photography teams, production partners and clients."
        align="center"
      />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {howItWorks.map((step, index) => (
          <article key={step.step} className="rounded-[1.75rem] border border-[#DFD9D2] bg-white p-6 shadow-sm motion-safe:animate-[wpp-fade-up_420ms_ease-out_both]" style={{ animationDelay: `${index * 90}ms` }}>
            <p className="text-4xl font-black tracking-tight text-[#DDC89C]">{step.step}</p>
            <h3 className="mt-8 text-2xl font-black text-[#302C2E]">{step.title}</h3>
            <p className="mt-3 text-sm font-medium leading-6 text-[#686164]">{step.description}</p>
          </article>
        ))}
      </div>
    </LandingSection>
  );
}
