import { CheckCircle2, Clock3, FileCheck2, IndianRupee, Target } from 'lucide-react';

interface LeadsKpiGridProps {
  totalLeads: number;
  activeLeads: number;
  bookedDeals: number;
  bookedRevenue: number;
  quotations: number;
  pipelineValue: number;
  isOwner: boolean;
}

export function LeadsKpiGrid(props: LeadsKpiGridProps) {
  const cards = [
    { label: 'Total Leads', value: String(props.totalLeads), detail: props.isOwner ? 'All studio inquiries' : 'Assigned or created by you', icon: Target, tone: 'bg-rose-50 text-rose-700' },
    { label: 'Active Pipeline', value: String(props.activeLeads), detail: 'In follow-up or quotation', icon: Clock3, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Booked Deals', value: String(props.bookedDeals), detail: `₹${props.bookedRevenue.toLocaleString('en-IN')} secured`, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Quotations', value: String(props.quotations), detail: 'Documents attached', icon: FileCheck2, tone: 'bg-violet-50 text-violet-700' },
    { label: 'Pipeline Value', value: `₹${props.pipelineValue.toLocaleString('en-IN')}`, detail: 'Estimated opportunity value', icon: IndianRupee, tone: 'bg-stone-100 text-stone-700' },
  ];

  return <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">{cards.map(({ label, value, detail, icon: Icon, tone }) => <article key={label} className="group rounded-2xl border border-[#e2d9d3] bg-white p-4 shadow-[0_8px_24px_rgba(48,44,46,.05)] transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-extrabold uppercase tracking-[.08em] text-slate-500">{label}</p><p className="mt-2 text-2xl font-black tracking-tight text-slate-900">{value}</p></div><span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span></div><p className="mt-1.5 text-sm font-medium text-slate-500">{detail}</p></article>)}</section>;
}
