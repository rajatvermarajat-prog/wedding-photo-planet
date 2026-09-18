import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Camera, CheckCircle2, FolderKanban, Heart, UserRound } from 'lucide-react';
import { clientBullets, freelancerBullets, studioBullets } from '../data/landingContent';
import { LandingSection, primaryButton, secondaryButton, SectionHeader } from './SectionChrome';

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 grid gap-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm font-semibold leading-6 text-[#5B5558]">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#527A68]" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function StudioSection() {
  const studioCards: Array<{ title: string; text: string; icon: LucideIcon }> = [
    { title: 'Leads', text: 'Inquiry follow-ups and conversion tracking', icon: Heart },
    { title: 'Projects', text: 'Wedding production, budgets and milestones', icon: FolderKanban },
    { title: 'Shoots', text: 'Schedules, crew and assignments', icon: Camera },
    { title: 'Team', text: 'Attendance, tasks and operations', icon: UserRound },
  ];
  return (
    <LandingSection id="studios">
      <div className="grid gap-10 rounded-[2rem] border border-[#DFD9D2] bg-white p-6 shadow-sm lg:grid-cols-[.95fr_1.05fr] lg:p-10">
        <div>
          <SectionHeader
            eyebrow="For Studios"
            title="Run Your Studio. Not Your Spreadsheet."
            description="Bring leads, projects, shoots, teams, freelancers and payments into one operational workspace."
          />
          <BulletList items={studioBullets} />
          <Link href="/dashboard" className={`${primaryButton} mt-7`}>Explore the CRM <ArrowRight className="ml-2 size-4" aria-hidden="true" /></Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {studioCards.map(({ title, text, icon: Icon }) => {
            return (
              <article key={title} className="rounded-2xl border border-[#ECE8E3] bg-[#F7F6F3] p-5">
                <Icon className="size-5 text-[#8D5265]" aria-hidden="true" />
                <h3 className="mt-8 text-lg font-black text-[#302C2E]">{title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-[#686164]">{text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </LandingSection>
  );
}

export function FreelancerSection() {
  return (
    <LandingSection id="freelancers" className="bg-[#F0EDE9]">
      <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
        <div className="order-2 lg:order-1">
          <div className="rounded-[2rem] border border-[#DFD9D2] bg-white p-5 shadow-sm">
            <div className="rounded-[1.5rem] bg-[#302C2E] p-5 text-white">
              <UserRound className="size-8 text-[#DDC89C]" aria-hidden="true" />
              <h3 className="mt-12 text-2xl font-black">One professional profile for future assignments.</h3>
              <p className="mt-3 text-sm font-medium leading-6 text-[#E8DDD7]">A portal direction for freelancer identity, portfolio, availability and assignment visibility.</p>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <SectionHeader
            eyebrow="For Freelancers"
            title="More Opportunities. One Professional Profile."
            description="Freelancer workflows will grow around the existing freelancer records, assignments and payouts already present in the CRM."
          />
          <BulletList items={freelancerBullets} />
          <Link href="/freelancer/join" className={`${secondaryButton} mt-7`}>Join as a Freelancer</Link>
        </div>
      </div>
    </LandingSection>
  );
}

export function ClientSection() {
  return (
    <LandingSection id="clients">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div>
          <SectionHeader
            eyebrow="For Clients"
            title="Your Wedding Memories, Beautifully Delivered."
            description="The client portal direction is emotional and photo-first: galleries, albums, favorites, downloads and sharing when enabled by the studio."
          />
          <BulletList items={clientBullets} />
          <Link href="/client/projects" className={`${primaryButton} mt-7`}>Explore Client Experience</Link>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white bg-white p-3 shadow-xl">
          <div className="relative h-full overflow-hidden rounded-[1.4rem]">
            <Image src="/images/wedding-login-hero.png" alt="Wedding portrait representing a future client gallery" fill sizes="(min-width: 1024px) 38vw, 92vw" className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(33,30,32,.62))]" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/92 p-4 backdrop-blur">
              <p className="text-[11px] font-extrabold uppercase tracking-[.14em] text-[#8D5265]">Gallery Direction</p>
              <p className="mt-1 text-sm font-black text-[#302C2E]">A quiet, elegant place for the final wedding story.</p>
            </div>
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
