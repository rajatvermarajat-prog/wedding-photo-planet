import { ecosystemCards } from '../data/landingContent';
import { LandingSection, SectionHeader } from './SectionChrome';

export function ProductIntro() {
  return (
    <LandingSection>
      <SectionHeader
        eyebrow="One Ecosystem"
        title="Everything Your Wedding Business Needs"
        description="Wedding Photo Planet connects operations, freelancers, clients and memories in one warm, focused product direction."
        align="center"
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ecosystemCards.map(({ icon: Icon, title, description }) => (
          <article key={title} className="group rounded-2xl border border-[#DFD9D2] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#B99A5E] hover:shadow-lg motion-reduce:hover:translate-y-0">
            <span className="grid size-11 place-items-center rounded-xl bg-[#F7F0F2] text-[#8D5265] transition group-hover:bg-[#5A2F3E] group-hover:text-[#DDC89C]">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-lg font-black text-[#302C2E]">{title}</h3>
            <p className="mt-3 text-sm font-medium leading-6 text-[#686164]">{description}</p>
          </article>
        ))}
      </div>
    </LandingSection>
  );
}
