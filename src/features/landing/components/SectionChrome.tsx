import type { ReactNode } from 'react';

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'light',
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
}) {
  const dark = tone === 'dark';
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className={`text-[11px] font-extrabold uppercase tracking-[.16em] ${dark ? 'text-[#DDC89C]' : 'text-[#8D5265]'}`}>{eyebrow}</p>
      <h2 className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${dark ? 'text-white' : 'text-[#302C2E]'}`}>{title}</h2>
      {description && <p className={`mt-4 text-sm font-medium leading-7 sm:text-base ${dark ? 'text-[#E8DDD7]' : 'text-[#686164]'}`}>{description}</p>}
    </div>
  );
}

export function LandingSection({ id, children, className = '' }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24 ${className}`}>
      {children}
    </section>
  );
}

export const primaryButton = 'inline-flex min-h-11 items-center justify-center rounded-xl bg-[#8D5265] px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_26px_rgba(90,47,62,.20)] transition hover:-translate-y-0.5 hover:bg-[#774255] focus-visible:outline-[#8D5265] motion-reduce:hover:translate-y-0';
export const secondaryButton = 'inline-flex min-h-11 items-center justify-center rounded-xl border border-[#DFD9D2] bg-white px-5 py-3 text-sm font-extrabold text-[#5A2F3E] transition hover:-translate-y-0.5 hover:border-[#B99A5E] hover:bg-[#FFFCF7] motion-reduce:hover:translate-y-0';
