import { BarChart3, FileText, LockKeyhole, Plus, ShieldCheck, Sparkles, Target } from 'lucide-react';

interface LeadsHeaderProps {
  userName: string;
  userRole: string;
  isOwner: boolean;
  activeView: 'list' | 'analytics';
  onViewChange: (view: 'list' | 'analytics') => void;
  onAddLead: () => void;
}

export function LeadsHeader({ userName, userRole, isOwner, activeView, onViewChange, onAddLead }: LeadsHeaderProps) {
  return <section className="relative overflow-hidden rounded-3xl border border-[#ddc89c]/35 bg-[radial-gradient(circle_at_88%_8%,rgba(221,200,156,.2),transparent_30%),linear-gradient(125deg,#704758,#55333f_50%,#38262d)] p-5 text-white shadow-xl sm:p-7">
    <div className="absolute -bottom-20 -right-10 size-64 rounded-full border-[34px] border-white/[.04]" />
    <div className="relative flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
      <div className="max-w-3xl"><div className="flex flex-wrap items-center gap-2"><span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[.14em] text-[#f0dce3]"><ShieldCheck className="size-4 text-emerald-300" />Studio Lead CRM</span><span className="rounded-lg border border-white/15 bg-black/10 px-3 py-1 text-sm font-semibold text-[#eadfe2]">{userName} · {userRole}</span>{!isOwner && <span className="flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-100"><LockKeyhole className="size-4" />My leads only</span>}</div><h1 className="mt-3 flex items-center gap-3 text-2xl font-black tracking-tight sm:text-3xl"><span className="grid size-11 place-items-center rounded-2xl bg-white/10"><Target className="size-6 text-[#f1c8d5]" /></span>Leads & Inquiry Management</h1><p className="mt-2 text-sm font-medium leading-relaxed text-[#eadfe2] sm:text-base">Track every couple from first inquiry to confirmed booking, with quotations, ownership and follow-up history in one place.</p></div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{isOwner && <div className="flex rounded-2xl border border-white/15 bg-black/15 p-1"><button onClick={() => onViewChange('list')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition sm:flex-none ${activeView === 'list' ? 'bg-white text-[#6d2f45] shadow-sm' : 'text-[#eadfe2] hover:bg-white/10 hover:text-white'}`}><FileText className="size-4" />All Leads</button><button onClick={() => onViewChange('analytics')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition sm:flex-none ${activeView === 'analytics' ? 'bg-white text-[#6d2f45] shadow-sm' : 'text-[#eadfe2] hover:bg-white/10 hover:text-white'}`}><BarChart3 className="size-4" />Analytics</button></div>}<button onClick={onAddLead} className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-r from-[#f9eee7] to-[#edcfc3] px-5 py-3 text-sm font-extrabold text-[#6d2f45] shadow-[0_10px_24px_rgba(28,13,19,.22)] transition hover:-translate-y-0.5 hover:shadow-xl"><span className="grid size-8 place-items-center rounded-xl bg-[#7d3650] text-white transition group-hover:rotate-6"><Plus className="size-5" /></span><span>Add Lead</span><Sparkles className="size-4 text-[#aa7251]" /></button></div>
    </div>
  </section>;
}
