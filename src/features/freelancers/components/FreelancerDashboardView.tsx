import React from 'react';
import { Freelancer, FreelancerAssignment, FreelancerPayment, FreelancerDataReceived, FreelancerCategory, Project } from '@/types';
import {
  Users,
  Camera,
  Video,
  Navigation,
  UserCheck,
  Layers,
  Film,
  HardDrive,
  CalendarDays,
  Clock,
  CreditCard,
  ClipboardList,
  IndianRupee,
  UserPlus,
} from 'lucide-react';
import { Badge, BTN_GHOST, BTN_PRIMARY, CARD, EmptyState, KpiCard } from '@/features/team/components/TeamUiKit';
import { formatInr, getFreelancerKpis, todayKey } from '../freelancerDomain';

interface FreelancerDashboardViewProps {
  freelancers: Freelancer[];
  assignments: FreelancerAssignment[];
  payments: FreelancerPayment[];
  dataReceivedList: FreelancerDataReceived[];
  categories: FreelancerCategory[];
  projects?: Project[];
  onTabChange: (subTab: string) => void;
  onAddFreelancerClick: () => void;
  onAssignShootClick: () => void;
  onRecordPaymentClick: () => void;
  onManageCategoriesClick: () => void;
  onOpenProfile: (freelancer: Freelancer) => void;
}

export const FreelancerDashboardView: React.FC<FreelancerDashboardViewProps> = ({
  freelancers,
  assignments,
  payments,
  dataReceivedList,
  categories,
  projects = [],
  onTabChange,
  onAddFreelancerClick,
  onAssignShootClick,
  onRecordPaymentClick,
  onManageCategoriesClick,
  onOpenProfile,
}) => {
  const kpis = getFreelancerKpis(freelancers, assignments, payments, todayKey());
  const totalAgreedCost = (assignments || []).reduce((sum, a) => sum + (a?.totalAgreedAmount || 0), 0);
  const totalPaidSum = (payments || []).reduce((sum, p) => sum + (p?.amountPaid || 0), 0);

  const photographersCount = freelancers.filter((f) => /photo/i.test(`${f.mainCategory} ${f.subCategory}`)).length;
  const videographersCount = freelancers.filter((f) => /cinema|video/i.test(`${f.mainCategory} ${f.subCategory}`)).length;
  const droneOperatorsCount = freelancers.filter((f) => /drone|fpv|pilot/i.test(`${f.mainCategory} ${f.subCategory}`)).length;
  const assistantsCount = freelancers.filter((f) => /assist|support|helper|lighting|gimbal/i.test(`${f.mainCategory} ${f.subCategory}`)).length;
  const othersCount = Math.max(0, freelancers.length - photographersCount - videographersCount - droneOperatorsCount - assistantsCount);

  const safeLower = (str: string | undefined | null) => (str || '').toLowerCase().trim();
  let totalEventsCount = 0;
  let teamFinalizedEventsCount = 0;
  let teamPendingEventsCount = 0;

  if (projects.length > 0) {
    projects.forEach((proj) => {
      (proj.shoots || []).forEach((s) => {
        totalEventsCount++;
        const sTitleLower = safeLower(s.title);
        const matchedAssignments = (assignments || []).filter((a) => {
          if (!a) return false;
          if (a.projectId && a.projectId === proj.id) return safeLower(a.eventName) === sTitleLower || a.shootDate === s.date;
          return safeLower(a.projectName) === safeLower(proj.clientWeddingTitle) && (safeLower(a.eventName) === sTitleLower || a.shootDate === s.date);
        });
        const hasCrew =
          matchedAssignments.length > 0 ||
          (s.crewAssignments && s.crewAssignments.length > 0) ||
          !!s.leadPhotographer ||
          !!s.cinematographer ||
          !!s.droneOperator;
        if (hasCrew) teamFinalizedEventsCount++;
        else teamPendingEventsCount++;
      });
    });
  } else {
    const eventGroupMap = new Set<string>();
    (assignments || []).forEach((a) => {
      if (!a) return;
      eventGroupMap.add(`${a.projectId || a.projectName || 'proj'}_${safeLower(a.eventName)}_${a.shootDate || 'date'}`);
    });
    totalEventsCount = eventGroupMap.size;
    teamFinalizedEventsCount = eventGroupMap.size;
  }

  const receivedDataLogCount = (dataReceivedList || []).filter((d) =>
    ['received', 'verified', 'backed_up', 'backup_completed'].includes(d?.dataStatus)
  ).length;
  const pendingDataLogCount = (dataReceivedList || []).filter((d) =>
    ['pending', 'partial', 'partially_received'].includes(d?.dataStatus)
  ).length;

  const today = todayKey();
  const upcomingAssignments = assignments
    .filter((a) => a.shootDate >= today && a.assignmentStatus !== 'cancelled')
    .sort((a, b) => a.shootDate.localeCompare(b.shootDate))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={onAddFreelancerClick} className={BTN_PRIMARY}>
          <UserPlus className="size-3.5" /> Add Freelancer
        </button>
        <button type="button" onClick={onAssignShootClick} className={BTN_GHOST}>
          <Film className="size-3.5" /> Assign Shoot
        </button>
        <button type="button" onClick={onRecordPaymentClick} className={BTN_GHOST}>
          <CreditCard className="size-3.5" /> Record Payment
        </button>
        <button type="button" onClick={onManageCategoriesClick} className={BTN_GHOST}>
          Categories
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Total Freelancers" value={kpis.total} hint="Registered talent" icon={Users} tone="rose" onClick={() => onTabChange('all_freelancers')} />
        <KpiCard label="Active Freelancers" value={kpis.active} hint="Approved and working" icon={UserCheck} tone="emerald" onClick={() => onTabChange('all_freelancers')} />
        <KpiCard label="Available Today" value={kpis.availableToday} hint="Ready to assign" icon={Clock} tone="blue" onClick={() => onTabChange('all_freelancers')} />
        <KpiCard label="On Shoot Today" value={kpis.onShootToday} hint="Assigned today" icon={Film} tone="amber" onClick={() => onTabChange('assignments')} />
        <KpiCard label="Pending Applications" value={kpis.pendingApplications} hint="Waiting for review" icon={ClipboardList} tone="violet" onClick={() => onTabChange('applications')} />
        <KpiCard label="Upcoming Shoots" value={kpis.upcomingShoots} hint="Confirmed assignments" icon={CalendarDays} tone="stone" onClick={() => onTabChange('calendar')} />
        <KpiCard label="Pending Payments" value={formatInr(kpis.pendingPayments)} hint={`Paid ${formatInr(totalPaidSum)} of ${formatInr(totalAgreedCost)}`} icon={CreditCard} tone="red" onClick={() => onTabChange('payments')} />
        <KpiCard label="This Month's Cost" value={formatInr(kpis.monthCost)} hint="Freelancer spend this month" icon={IndianRupee} tone="purple" onClick={() => onTabChange('reports')} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: 'Photographers', value: photographersCount, icon: Camera },
          { label: 'Videographers', value: videographersCount, icon: Video },
          { label: 'Drone', value: droneOperatorsCount, icon: Navigation },
          { label: 'Assistants', value: assistantsCount, icon: UserCheck },
          { label: 'Editors & Other', value: othersCount, icon: Layers },
        ].map((item) => (
          <button key={item.label} type="button" onClick={() => onTabChange('all_freelancers')} className={`${CARD} p-4 text-left transition hover:border-rose-200`}>
            <item.icon className="mb-2 size-4 text-[#8f3655]" />
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{item.label}</p>
            <p className="mt-1 text-xl font-black text-slate-900">{item.value}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className={`${CARD} p-5 lg:col-span-1`}>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Category mix</h3>
          <div className="mt-4 space-y-3">
            {categories.length === 0 ? (
              <p className="text-xs text-slate-500">No categories yet.</p>
            ) : (
              categories.map((cat) => {
                const count = freelancers.filter((f) => f.mainCategory === cat.name).length;
                const percentage = freelancers.length > 0 ? Math.round((count / freelancers.length) * 100) : 0;
                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-800">{cat.name}</span>
                      <span className="font-extrabold text-[#8f3655]">{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#f6f1ee]">
                      <div className="h-full rounded-full bg-[#8f3655]" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl border border-[#eee7e2] bg-[#fbfaf8] p-2">
              <p className="font-bold text-slate-500">Events</p>
              <p className="font-black text-slate-900">{totalEventsCount}</p>
            </div>
            <div className="rounded-xl border border-[#eee7e2] bg-[#fbfaf8] p-2">
              <p className="font-bold text-slate-500">Crew pending</p>
              <p className="font-black text-slate-900">{teamPendingEventsCount}</p>
            </div>
          </div>
        </section>

        <section className={`${CARD} p-5 lg:col-span-2`}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Upcoming assignments</h3>
            <button type="button" onClick={() => onTabChange('calendar')} className="text-xs font-bold text-[#8f3655]">
              Open calendar
            </button>
          </div>
          {upcomingAssignments.length === 0 ? (
            <EmptyState
              icon={Film}
              title="No upcoming freelancer shoots"
              message="Assign photographers and cinematographers to booked weddings."
              action={
                <button type="button" onClick={onAssignShootClick} className={BTN_PRIMARY}>
                  <Film className="size-3.5" /> Assign Shoot
                </button>
              }
            />
          ) : (
            <ul className="mt-3 divide-y divide-[#eee7e2]">
              {upcomingAssignments.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">{a.projectName}</p>
                    <p className="text-xs font-medium text-slate-500">
                      {a.freelancerName} · {a.role || a.subCategory} · {a.shootLocation || a.venue}
                    </p>
                  </div>
                  <Badge>{a.shootDate} · {a.startTime}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <button type="button" onClick={() => onTabChange('data_received')} className={`${CARD} p-5 text-left`}>
          <HardDrive className="mb-2 size-4 text-[#8f3655]" />
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Footage status</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{pendingDataLogCount} pending</p>
          <p className="mt-1 text-xs font-medium text-slate-500">{receivedDataLogCount} received · {teamFinalizedEventsCount} events crewed</p>
        </button>
        <section className={`${CARD} p-5`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Roster</h3>
            <button type="button" onClick={() => onTabChange('all_freelancers')} className="text-xs font-bold text-[#8f3655]">
              View all
            </button>
          </div>
          {freelancers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No freelancers yet"
              message="Build your freelance production network by adding photographers, cinematographers, drone operators and editors."
              action={
                <button type="button" onClick={onAddFreelancerClick} className={BTN_PRIMARY}>
                  <UserPlus className="size-3.5" /> Add Freelancer
                </button>
              }
            />
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {freelancers.slice(0, 4).map((f) => (
                <button key={f.id} type="button" onClick={() => onOpenProfile(f)} className="flex items-center gap-3 rounded-xl border border-[#eee7e2] bg-[#fbfaf8] p-3 text-left hover:border-rose-200">
                  <span className="grid size-10 place-items-center overflow-hidden rounded-full bg-[#f0dce3] text-xs font-black text-[#6d2f45]">
                    {f.profilePhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.profilePhoto} alt="" className="size-10 object-cover" />
                    ) : (
                      f.name.slice(0, 2).toUpperCase()
                    )}
                  </span>
                  <span>
                    <span className="block text-xs font-extrabold text-slate-900">{f.name}</span>
                    <span className="block text-[11px] font-medium text-slate-500">
                      {f.subCategory} · {formatInr(f.perDayCharges)}/day
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
