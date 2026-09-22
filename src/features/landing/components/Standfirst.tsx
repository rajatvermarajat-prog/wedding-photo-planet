import { Display, Section, SectionMark } from './Editorial';
import { Reveal } from './Reveal';
import { standfirst } from '../data/landingContent';

/**
 * The premise.
 *
 * Replaces the old TrustSection — three rounded pills carrying unfalsifiable
 * claims ("Built for modern wedding photography teams"). This says something
 * instead, and says it as an editorial standfirst: a large statement against a
 * deliberately empty left field, with the argument set in a narrow measure to
 * its right and dropped below the baseline.
 */
export function Standfirst() {
  return (
    <Section tone="paper">
      <div className="grid gap-x-8 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <SectionMark index={standfirst.mark.index} label={standfirst.mark.label} />
          </Reveal>
          <Reveal delay={80}>
            <Display step="ed-d2" className="mt-10 max-w-[22ch] text-[var(--ed-on-paper)]">
              {standfirst.lines[0]}{' '}
              <em>{standfirst.lines[1]}</em>
            </Display>
          </Reveal>
        </div>

        <Reveal delay={200} className="lg:col-span-4 lg:col-start-9 lg:pt-[7.5rem]">
          <div className="border-l border-[var(--ed-rule-paper)] pl-6">
            {standfirst.body.map((paragraph) => (
              <p
                key={paragraph}
                className="mb-5 text-[0.9375rem] leading-[1.78] text-[var(--ed-on-paper-dim)] last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
