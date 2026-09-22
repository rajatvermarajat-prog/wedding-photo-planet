import type { ElementType, ReactNode } from 'react';
import Link from 'next/link';

/* Shared layout + type primitives for the editorial marketing surface.
   Server components only — the single client primitive lives in Reveal.tsx. */

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[var(--ed-max)] px-[var(--ed-gutter)] ${className}`}>{children}</div>
  );
}

export function Section({
  id,
  tone = 'paper',
  className = '',
  children,
  bleed = false,
}: {
  id?: string;
  tone?: 'paper' | 'paper-2' | 'ink';
  className?: string;
  children: ReactNode;
  bleed?: boolean;
}) {
  const toneClass =
    tone === 'ink' ? 'ed-ink' : tone === 'paper-2' ? 'bg-[var(--ed-paper-2)]' : 'bg-[var(--ed-paper)]';
  return (
    <section id={id} className={`${toneClass} ${className}`}>
      {bleed ? children : <Container className="py-[clamp(4.5rem,9vw,9rem)]">{children}</Container>}
    </section>
  );
}

/** Section marker: an index numeral and a label sharing one hairline. */
export function SectionMark({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-baseline gap-4 border-t border-[var(--ed-rule-paper)] pt-4">
      <span className="ed-numeral text-sm text-[var(--ed-brass)]">{index}</span>
      <span className="ed-label text-[var(--ed-plum)] [.ed-ink_&]:text-[var(--ed-brass-lt)]">{label}</span>
    </div>
  );
}

export function Display({
  as: Tag = 'h2',
  step = 'ed-d2',
  className = '',
  children,
}: {
  as?: ElementType;
  step?: 'ed-d1' | 'ed-d2' | 'ed-d3' | 'ed-d4';
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={`ed-display ${step} ${className}`}>{children}</Tag>;
}

export function Lead({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`ed-lead text-[var(--ed-on-paper-dim)] [.ed-ink_&]:text-[var(--ed-on-ink-dim)] ${className}`}>
      {children}
    </p>
  );
}

export function Action({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="ed-action">
      {children}
      <Arrow />
    </Link>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="ed-textlink">
      {children}
      <Arrow />
    </Link>
  );
}

export function Arrow() {
  return (
    <svg className="ed-arrow" width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
      <path d="M0 5h14M10 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

/**
 * Hairline-divided list. Replaces the check-icon bullet lists of the previous
 * design: the rule does the separating work an icon was doing badly.
 */
export function RuleList({ items, className = '' }: { items: string[]; className?: string }) {
  return (
    <ul className={`mt-10 border-t border-[var(--ed-rule-paper)] ${className}`}>
      {items.map((item, i) => (
        <li
          key={item}
          className="flex items-baseline gap-5 border-b border-[var(--ed-rule-paper)] py-3.5 text-[0.9375rem] leading-6"
        >
          <span className="ed-numeral shrink-0 text-[0.6875rem] text-[var(--ed-brass)]">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
