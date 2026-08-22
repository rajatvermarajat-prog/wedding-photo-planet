import Link from 'next/link';
import { Camera, CreditCard, FolderPlus, Receipt } from 'lucide-react';

export function QuickActionsPanel() {
  const actions = [
    { label: 'New Project', icon: FolderPlus, href: '/projects/new', accent: 'bg-rose-50 text-rose-700' },
    { label: 'Schedule Shoot', icon: Camera, href: '/shoots', accent: 'text-rose-700 bg-rose-50' },
    { label: 'Record Payment', icon: CreditCard, href: '/payments/new', accent: 'text-emerald-700 bg-emerald-50' },
    { label: 'Add Expense', icon: Receipt, href: '/expenses', accent: 'text-amber-700 bg-amber-50' },
  ] as const;

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map(({ label, icon: Icon, href, accent }) => (
        <Link
          key={label}
          href={href}
          prefetch
          className="group flex items-center gap-3 rounded-2xl border border-[#dfd9d2] bg-white p-3.5 text-left shadow-[0_10px_30px_rgba(48,44,46,.07)] transition hover:-translate-y-0.5 hover:border-rose-300"
        >
          <span className={`grid size-9 shrink-0 place-items-center rounded-xl transition group-hover:scale-105 ${accent}`}>
            <Icon className="size-4" />
          </span>
          <span className="text-xs font-extrabold uppercase tracking-wide text-slate-800">{label}</span>
        </Link>
      ))}
    </section>
  );
}
