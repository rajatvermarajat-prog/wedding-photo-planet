import { Display, Section, SectionMark } from './Editorial';
import { Reveal } from './Reveal';
import { faqs } from '../data/faqData';
import { faqSection } from '../data/landingContent';

/**
 * FAQ on native <details>/<summary>.
 *
 * The previous version was a client component holding one open index in React
 * state inside a rounded white card. Native disclosure gets keyboard support,
 * screen-reader semantics and in-page find-on-page expansion for free, needs no
 * JavaScript at all, and lets the section ship as a server component. The only
 * chrome is a hairline per row and a rule that rotates into a cross.
 */
export function FaqSection() {
  return (
    <Section id="faq" tone="ink">
      <div className="grid gap-x-8 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Reveal>
            <SectionMark index={faqSection.mark.index} label={faqSection.mark.label} />
          </Reveal>
          <Reveal delay={80}>
            <Display step="ed-d2" className="mt-10 text-[var(--ed-on-ink)]">
              <em>{faqSection.heading[0]}</em>
            </Display>
          </Reveal>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <div className="border-t border-[var(--ed-rule-ink)]">
            {faqs.map((faq, i) => (
              <Reveal key={faq.question} delay={i * 50} className="border-b border-[var(--ed-rule-ink)]">
                <details className="ed-disclosure group">
                  <summary className="flex items-start justify-between gap-6 py-5">
                    <h3 className="ed-display ed-d4 text-[var(--ed-on-ink)] transition-colors duration-300 group-hover:text-[var(--ed-brass-lt)]">
                      {faq.question}
                    </h3>
                    <span className="ed-plus relative mt-2 block h-3 w-3 shrink-0" aria-hidden="true">
                      <span className="absolute left-0 top-1/2 h-px w-3 bg-[var(--ed-brass)]" />
                      <span className="ed-plus-bar absolute left-1/2 top-0 h-3 w-px bg-[var(--ed-brass)]" />
                    </span>
                  </summary>
                  <p className="max-w-[54ch] pb-6 pr-10 text-[0.875rem] leading-[1.78] text-[var(--ed-on-ink-dim)]">
                    {faq.answer}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
