import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, Heart, UsersRound } from 'lucide-react';
import { primaryButton, secondaryButton } from './SectionChrome';

const entryPoints = [
  { href: '#studios', label: 'For Studios', icon: BriefcaseBusiness },
  { href: '#freelancers', label: 'For Freelancers', icon: UsersRound },
  { href: '#clients', label: 'For Clients', icon: Heart },
];

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#F7F6F3] pt-24">
      <div className="absolute inset-x-0 top-0 -z-10 h-[42rem] bg-[radial-gradient(circle_at_78%_12%,rgba(221,200,156,.34),transparent_27rem),radial-gradient(circle_at_12%_4%,rgba(141,82,101,.16),transparent_24rem)]" />
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[.95fr_1.05fr] lg:px-8">
        <div className="max-w-2xl">
          <p className="motion-safe:animate-[wpp-fade-up_520ms_ease-out_both] text-[11px] font-extrabold uppercase tracking-[.18em] text-[#8D5265]">
            Wedding Photo Planet
          </p>
          <h1 className="mt-4 text-4xl font-black leading-[1.02] tracking-tight text-[#302C2E] motion-safe:animate-[wpp-fade-up_620ms_ease-out_80ms_both] sm:text-6xl xl:text-7xl">
            Every Wedding. Every Memory. One Beautiful Workspace.
          </h1>
          <p className="mt-6 max-w-xl text-base font-medium leading-8 text-[#686164] motion-safe:animate-[wpp-fade-up_620ms_ease-out_160ms_both] sm:text-lg">
            Wedding Photo Planet helps photography businesses manage operations, connect with professional freelancers, and deliver beautiful wedding galleries to clients.
          </p>
          <div className="mt-8 flex flex-col gap-3 motion-safe:animate-[wpp-fade-up_620ms_ease-out_240ms_both] sm:flex-row">
            <Link href="/contact" className={primaryButton}>Get Started <ArrowRight className="ml-2 size-4" aria-hidden="true" /></Link>
            <Link href="#features" className={secondaryButton}>Explore Platform</Link>
          </div>
          <div className="mt-8 grid gap-2 motion-safe:animate-[wpp-fade-up_620ms_ease-out_320ms_both] sm:grid-cols-3">
            {entryPoints.map(({ href, label, icon: Icon }) => (
              <Link key={label} href={href} className="group flex min-h-12 items-center gap-2 rounded-2xl border border-[#DFD9D2] bg-white/72 px-3 py-2 text-xs font-extrabold text-[#5A2F3E] backdrop-blur-sm transition hover:border-[#B99A5E] hover:bg-white">
                <Icon className="size-4 text-[#8D5265]" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="motion-safe:animate-[wpp-soft-reveal_900ms_ease-out_220ms_both]">
          <div className="relative mx-auto aspect-[4/5] max-h-[44rem] max-w-[38rem] overflow-hidden rounded-[2rem] border border-white/70 bg-white p-3 shadow-[0_26px_70px_rgba(48,44,46,.18)] sm:rounded-[2.4rem]">
            <div className="relative h-full overflow-hidden rounded-[1.45rem]">
              <Image
                src="/images/wedding-login-hero.png"
                alt="A cinematic wedding couple portrait used to represent the future client gallery experience"
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 92vw"
                className="object-cover motion-safe:animate-[wpp-ken-burns_16s_ease-out_both]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(33,30,32,.08),rgba(33,30,32,.42))]" />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-[#211E20]/56 p-4 text-white backdrop-blur-md">
                <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#DDC89C]">Client Gallery Direction</p>
                <p className="mt-2 text-lg font-black">A beautiful handoff for memories, albums and delivery.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
