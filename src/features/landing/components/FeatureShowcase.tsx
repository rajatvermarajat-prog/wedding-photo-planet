import { futureDirections, implementedFeatures } from '../data/landingContent';
import { LandingSection, SectionHeader } from './SectionChrome';

export function FeatureShowcase() {
  return (
    <LandingSection id="features" className="bg-[#FBFAF8]">
      <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
        <SectionHeader
          eyebrow="Platform Capabilities"
          title="Built around the real wedding production workflow"
          description="The current CRM already supports the operational heart of a wedding photography business. Future portal and gallery work can build on this foundation without duplicating systems."
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {implementedFeatures.map(({ icon: Icon, title, description }, index) => (
            <article key={title} className="rounded-2xl border border-[#DFD9D2] bg-white p-4 shadow-sm motion-safe:animate-[wpp-fade-up_420ms_ease-out_both]" style={{ animationDelay: `${index * 35}ms` }}>
              <div className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#F0EDE9] text-[#8D5265]">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-[#302C2E]">{title}</h3>
                  <p className="mt-1 text-xs font-medium leading-5 text-[#686164]">{description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="mt-8 rounded-3xl border border-[#DFD9D2] bg-[#302C2E] p-5 text-white sm:p-7">
        <p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-[#DDC89C]">Product direction</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {futureDirections.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/7 p-4 text-sm font-bold text-[#F0EDE9]">
              {item}
            </div>
          ))}
        </div>
      </div>
    </LandingSection>
  );
}
