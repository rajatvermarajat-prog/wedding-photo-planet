import { Action, Display, Section, TextLink } from './Editorial';
import { Reveal } from './Reveal';
import { finalCta } from '../data/landingContent';

/**
 * Closing statement.
 *
 * One idea, set as large as the hero, on empty paper. The previous version put
 * this inside a gradient-filled rounded panel with two equally-weighted
 * buttons; the hierarchy is now unambiguous — one action, one quiet link.
 */
export function FinalCta() {
  return (
    <Section id="contact" tone="paper">
      <div className="grid gap-x-8 gap-y-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-8">
          <span className="ed-label text-[var(--ed-brass)]">Bring it together</span>
          <Display as="h2" step="ed-d1" className="mt-8 max-w-[20ch] text-[var(--ed-on-paper)]">
            {finalCta.heading[0]}{' '}
            <em>{finalCta.heading[1]}</em>
          </Display>
        </Reveal>

        <Reveal delay={140} className="lg:col-span-4 lg:col-start-9 lg:self-end">
          <p className="max-w-[32ch] text-[0.9375rem] leading-[1.75] text-[var(--ed-on-paper-dim)]">
            {finalCta.lead}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Action href={finalCta.primary.href}>{finalCta.primary.label}</Action>
            <TextLink href={finalCta.secondary.href}>{finalCta.secondary.label}</TextLink>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
