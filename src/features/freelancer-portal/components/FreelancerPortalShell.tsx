'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, BriefcaseBusiness, CalendarDays, ClipboardList, CreditCard, Image, LayoutDashboard, LogOut, Menu, UserRound, Video, WalletCards } from 'lucide-react';
import { freelancerPortalApi } from '@/lib/api/freelancerPortal';

const nav = [
  { href: '/freelancer/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/freelancer/shoots', label: 'Shoots', icon: Video },
  { href: '/freelancer/tasks', label: 'Tasks', icon: ClipboardList },
  { href: '/freelancer/payments', label: 'Payments', icon: WalletCards },
  { href: '/freelancer/profile', label: 'Profile', icon: UserRound },
  { href: '/freelancer/projects', label: 'Projects', icon: BriefcaseBusiness },
  { href: '/freelancer/portfolio', label: 'Portfolio', icon: Image },
  { href: '/freelancer/availability', label: 'Availability', icon: CalendarDays },
  { href: '/freelancer/subscription', label: 'Plan', icon: CreditCard },
  { href: '/freelancer/connections', label: 'Connections', icon: BriefcaseBusiness },
  { href: '/freelancer/assignments', label: 'Assignments', icon: BriefcaseBusiness },
  { href: '/freelancer/notifications', label: 'Notifications', icon: Bell },
];

export function FreelancerPortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === '/freelancer/login' || pathname === '/freelancer/join') {
    return <>{children}</>;
  }
  const logout = async () => {
    await freelancerPortalApi.logout();
    router.replace('/freelancer/login');
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#302C2E]">
      <header className="sticky top-0 z-40 border-b border-[#DFD9D2] bg-[#F7F6F3]/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/freelancer/dashboard" className="font-black tracking-tight text-[#5A2F3E]">Wedding Photo Planet</Link>
          <button className="grid size-10 place-items-center rounded-xl border border-[#DFD9D2] bg-white text-[#5A2F3E] md:hidden" aria-label="Open navigation">
            <Menu className="size-4" />
          </button>
          <button onClick={logout} className="hidden items-center gap-2 rounded-xl border border-[#DFD9D2] bg-white px-3 py-2 text-xs font-extrabold text-[#5A2F3E] md:flex">
            <LogOut className="size-3.5" /> Logout
          </button>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-5 sm:px-6 md:grid-cols-[240px_1fr] lg:px-8">
        <aside className="hidden md:block">
          <nav className="sticky top-24 space-y-1 rounded-2xl border border-[#DFD9D2] bg-white p-2 shadow-sm">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${active ? 'bg-[#8D5265] text-white' : 'text-[#686164] hover:bg-[#F0EDE9] hover:text-[#5A2F3E]'}`}>
                  <Icon className="size-4" /> {label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="pb-24 md:pb-8">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[#DFD9D2] bg-white md:hidden">
        {nav.slice(0, 5).map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`grid min-h-16 place-items-center text-[10px] font-extrabold ${active ? 'text-[#8D5265]' : 'text-[#686164]'}`}>
              <Icon className="size-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function PortalCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-[#DFD9D2] bg-white p-4 shadow-sm sm:p-5 ${className}`}>{children}</section>;
}

export function PortalState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#DFD9D2] bg-white p-6 text-center">
      <h2 className="text-base font-black text-[#302C2E]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-[#686164]">{text}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
