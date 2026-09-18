import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LandingSection, primaryButton, secondaryButton } from './SectionChrome';

export function FinalCta() {
  return (
    <LandingSection id="contact">
      <div className="overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_85%_15%,rgba(221,200,156,.25),transparent_26rem),linear-gradient(135deg,#5A2F3E,#302C2E)] p-7 text-white sm:p-10 lg:p-14">
        <div className="max-w-3xl">
          <p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-[#DDC89C]">Bring it together</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Your Work Deserves a Better Workspace.</h2>
          <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-[#E8DDD7] sm:text-base">
            Bring your studio, team, freelancers and client experience together.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className={primaryButton}>Get Started <ArrowRight className="ml-2 size-4" aria-hidden="true" /></Link>
            <Link href="/contact" className={secondaryButton}>Talk to Us</Link>
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
