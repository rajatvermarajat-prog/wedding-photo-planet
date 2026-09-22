import { Display, Section, SectionMark, TextLink } from './Editorial';
import { Reveal } from './Reveal';
import { pricing } from '../data/landingContent';
import { pricingPlans } from '../data/pricingData';

/**
 * Pricing as a rate card, not three boxes.
 *
 * The previous version was the canonical template pattern: three rounded cards,
 * the middle one filled in brand colour to mark it "popular". Here each tier is
 * a full-width row on a hairline grid — the way a studio's own rate card would
 * be set. The recommended tier is marked by a brass rule and a heavier numeral,
 * not by a coloured container.
 */
export function PricingSection() {
  return (
    <Section id="pricing" tone="paper-2">
      <div className="grid gap-x-8 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal>
            <SectionMark index={pricing.mark.index} label={pricing.mark.label} />
          </Reveal>
          <Reveal delay={80}>
            <Display step="ed-d2" className="mt-10 max-w-[18ch] text-[var(--ed-on-paper)]">
              {pricing.heading[0]}
              <br />
              <em>{pricing.heading[1]}</em>
            </Display>
          </Reveal>
        </div>
        <Reveal delay={160} className="lg:col-span-4 lg:col-start-9 lg:self-end">
          <p className="text-[0.875rem] leading-[1.75] text-[var(--ed-on-paper-dim)]">{pricing.note}</p>
        </Reveal>
      </div>

      <div className="mt-[clamp(3rem,6vw,5rem)] border-t border-[var(--ed-rule-paper)]">
        {pricingPlans.map((plan, i) => (
          <Reveal
            key={plan.name}
            delay={i * 110}
            className={`border-b border-[var(--ed-rule-paper)] ${
              plan.highlighted ? 'border-l-2 border-l-[var(--ed-brass)] pl-6 sm:pl-8' : ''
            }`}
          >
            <div className="grid items-start gap-x-8 gap-y-6 py-9 lg:grid-cols-12">
              {/* Tier */}
              <div className="lg:col-span-3">
                <span className="ed-label text-[var(--ed-plum)]">{plan.label}</span>
                <h3 className="ed-display ed-d3 mt-2.5 text-[var(--ed-on-paper)]">{plan.name}</h3>
              </div>

              {/* Rate */}
              <div className="lg:col-span-2">
                <p className="ed-display text-[1.5rem] leading-none text-[var(--ed-plum-deep)]">{plan.price}</p>
                <p className="mt-2 text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--ed-on-paper-dim)]">
                  {plan.priceNote}
                </p>
              </div>

              {/* What it is */}
              <div className="lg:col-span-4">
                <p className="text-[0.875rem] leading-[1.7] text-[var(--ed-on-paper-dim)]">{plan.description}</p>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="text-[0.75rem] text-[var(--ed-on-paper)] before:mr-2 before:text-[var(--ed-brass)] before:content-['—']"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action */}
              <div className="lg:col-span-3 lg:justify-self-end lg:text-right">
                <TextLink href={plan.href}>{plan.cta}</TextLink>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
