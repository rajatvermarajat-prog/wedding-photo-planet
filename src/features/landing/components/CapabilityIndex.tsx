import { Display, Section, SectionMark } from './Editorial';
import { Reveal } from './Reveal';
import { capabilities, shippedModules } from '../data/landingContent';

/**
 * The capability index — the page's one deliberate set-piece.
 *
 * The previous design rendered these nine modules as nine identical rounded
 * cards with nine lucide icons, which flattened them into decoration. Here they
 * are typeset as a printed index: tabular numerals, hairline rules, titles in
 * the display face, descriptions in a narrow measure. Each row wipes in from
 * the left on a stagger, so scrolling the section reads like film credits.
 *
 * No cards, no icons, no borders other than the rules that separate the rows.
 */
export function CapabilityIndex() {
  return (
    <Section id="capabilities" tone="ink">
      <div className="grid gap-x-8 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <SectionMark index={capabilities.mark.index} label={capabilities.mark.label} />
          </Reveal>
          <Reveal delay={80}>
            <Display step="ed-d2" className="mt-10 max-w-[16ch] text-[var(--ed-on-ink)]">
              {capabilities.heading[0]}
              <br />
              <em>{capabilities.heading[1]}</em>
            </Display>
          </Reveal>
        </div>

        <Reveal delay={160} className="lg:col-span-4 lg:col-start-9 lg:self-end">
          <p className="text-[0.9375rem] leading-[1.78] text-[var(--ed-on-ink-dim)]">{capabilities.note}</p>
        </Reveal>
      </div>

      {/* The index itself. Two columns on desktop, one on mobile — the rules
          carry across the gutter so it still reads as a single list. */}
      <ol className="mt-[clamp(3rem,6vw,5rem)] grid border-t border-[var(--ed-rule-ink)] md:grid-cols-2 md:gap-x-12">
        {shippedModules.map((module, i) => (
          <Reveal
            key={module.title}
            as="li"
            variant="wipe"
            delay={i * 70}
            className="group border-b border-[var(--ed-rule-ink)] last:md:col-span-2"
          >
            <div className="flex items-baseline gap-5 py-5 sm:gap-7">
              <span className="ed-numeral shrink-0 text-[0.75rem] text-[var(--ed-brass)] transition-colors duration-500 group-hover:text-[var(--ed-brass-lt)]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <h3 className="ed-display ed-d3 text-[var(--ed-on-ink)] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0">
                  {module.title}
                </h3>
                <p className="mt-2 max-w-[38ch] text-[0.8125rem] leading-[1.7] text-[var(--ed-on-ink-dim)]">
                  {module.description}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
