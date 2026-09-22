import { Display, Section, SectionMark } from './Editorial';
import { Reveal } from './Reveal';
import { process } from '../data/landingContent';

/**
 * The thread.
 *
 * Three beats, but not three cards. The numerals sit *on* a single hairline
 * that runs the width of the section, so the rule does the work of showing
 * these are one continuous process rather than three separate offerings.
 */
export function Process() {
  return (
    <Section tone="paper">
      <div className="grid gap-x-8 gap-y-8 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <SectionMark index={process.mark.index} label={process.mark.label} />
        </Reveal>
        <Reveal delay={80} className="lg:col-span-7 lg:col-start-6">
          <Display step="ed-d2" className="text-[var(--ed-on-paper)]">
            Manage. Connect. <em>Deliver.</em>
          </Display>
        </Reveal>
      </div>

      <ol className="mt-[clamp(3.5rem,7vw,6rem)] grid gap-y-12 md:grid-cols-3 md:gap-x-10">
        {process.steps.map((step, i) => (
          <Reveal as="li" key={step.step} delay={i * 130} className="relative">
            {/* Each column carries its own segment of the shared rule. */}
            <div className="relative h-px w-full bg-[var(--ed-rule-paper)]">
              <span className="absolute left-0 top-0 h-px w-10 bg-[var(--ed-brass)]" aria-hidden="true" />
            </div>
            <span className="ed-numeral mt-6 block text-[clamp(2.25rem,4vw,3.25rem)] leading-none text-[var(--ed-paper-2)] [-webkit-text-stroke:1px_var(--ed-brass)]">
              {step.step}
            </span>
            <h3 className="ed-display ed-d3 mt-5 text-[var(--ed-on-paper)]">{step.title}</h3>
            <p className="mt-3 max-w-[32ch] text-[0.875rem] leading-[1.75] text-[var(--ed-on-paper-dim)]">
              {step.description}
            </p>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
