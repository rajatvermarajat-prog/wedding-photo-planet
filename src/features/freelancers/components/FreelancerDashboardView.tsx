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
  DollarSign, 
  HardDrive, 
  Plus, 
  Tag, 
  Calendar, 
  ChevronRight, 
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  PieChart
} from 'lucide-react';

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
  // KPI Metrics
  const totalFreelancers = freelancers.length;
  const activeFreelancers = freelancers.filter((f) => f.status === 'active').length;

  const photographersCount = freelancers.filter((f) => {
    const main = (f.mainCategory || '').toLowerCase();
    const sub = (f.subCategory || '').toLowerCase();
    return main.includes('photo') || sub.includes('photo');
  }).length;

  const videographersCount = freelancers.filter((f) => {
    const main = (f.mainCategory || '').toLowerCase();
    const sub = (f.subCategory || '').toLowerCase();
    return main.includes('cinema') || main.includes('video') || sub.includes('video') || sub.includes('cinema');
  }).length;

  const droneOperatorsCount = freelancers.filter((f) => {
    const main = (f.mainCategory || '').toLowerCase();
    const sub = (f.subCategory || '').toLowerCase();
    return main.includes('drone') || sub.includes('drone') || sub.includes('fpv') || main.includes('pilot') || sub.includes('pilot');
  }).length;

  const assistantsCount = freelancers.filter((f) => {
    const main = (f.mainCategory || '').toLowerCase();
    const sub = (f.subCategory || '').toLowerCase();
    return (
      main.includes('assist') ||
      main.includes('support') ||
      sub.includes('assist') ||
      sub.includes('helper') ||
      sub.includes('lighting') ||
      sub.includes('gimbal')
    );
  }).length;

  const othersCount = freelancers.filter((f) => {
    const main = (f.mainCategory || '').toLowerCase();
    const sub = (f.subCategory || '').toLowerCase();
    const isPhoto = main.includes('photo') || sub.includes('photo');
    const isVideo = main.includes('cinema') || main.includes('video') || sub.includes('video') || sub.includes('cinema');
    const isDrone = main.includes('drone') || sub.includes('drone') || sub.includes('fpv') || main.includes('pilot') || sub.includes('pilot');
    const isAssist = main.includes('assist') || main.includes('support') || sub.includes('assist') || sub.includes('helper') || sub.includes('lighting') || sub.includes('gimbal');
    return !isPhoto && !isVideo && !isDrone && !isAssist;
  }).length;

  const totalShootsAssigned = (assignments || []).length;
  const totalAgreedCost = (assignments || []).reduce((sum, a) => sum + (a?.totalAgreedAmount || 0), 0);
  const totalPaidSum = (payments || []).reduce((sum, p) => sum + (p?.amountPaid || 0), 0);
  const totalPendingSum = Math.max(0, totalAgreedCost - totalPaidSum);

  const pendingDataCount = (dataReceivedList || []).filter((d) => d?.dataStatus === 'pending' || d?.dataStatus === 'partial').length;

  // Calculate shoot events stats: Total Events, Team Finalized, Team Pending
  let totalEventsCount = 0;
  let teamFinalizedEventsCount = 0;
  let teamPendingEventsCount = 0;

  const safeLower = (str: string | undefined | null) => (str || '').toLowerCase().trim();

  if (projects && projects.length > 0) {
    projects.forEach((proj) => {
      const projShoots = proj.shoots || [];
      projShoots.forEach((s) => {
        totalEventsCount++;
        const sTitleLower = safeLower(s.title);
        const matchedAssignments = (assignments || []).filter((a) => {
          if (!a) return false;
          if (a.projectId && a.projectId === proj.id) {
            return safeLower(a.eventName) === sTitleLower || a.shootDate === s.date;
          }
          return (
            safeLower(a.projectName) === safeLower(proj.clientWeddingTitle) &&
            (safeLower(a.eventName) === sTitleLower || a.shootDate === s.date)
          );
        });

        const hasCrew =
          matchedAssignments.length > 0 ||
          (s.crewAssignments && s.crewAssignments.length > 0) ||
          !!s.leadPhotographer ||
          !!s.cinematographer ||
          !!s.droneOperator;

        if (hasCrew) {
          teamFinalizedEventsCount++;
        } else {
          teamPendingEventsCount++;
        }
      });
    });

    // Check orphan assignments not in any project shoot
    const orphanKeys = new Set<string>();
    (assignments || []).forEach((a) => {
      if (!a) return;
      let isCovered = false;
      const aEventLower = safeLower(a.eventName);
      const aProjLower = safeLower(a.projectName);

      projects.forEach((proj) => {
        const projWeddingLower = safeLower(proj.clientWeddingTitle);
        (proj.shoots || []).forEach((s) => {
          const sTitleLower = safeLower(s.title);
          if (
            (a.projectId && a.projectId === proj.id && (aEventLower === sTitleLower || a.shootDate === s.date)) ||
            (aProjLower === projWeddingLower && (aEventLower === sTitleLower || a.shootDate === s.date))
          ) {
            isCovered = true;
          }
        });
      });

      if (!isCovered) {
        const key = `${a.projectId || a.projectName || 'proj'}_${aEventLower}_${a.shootDate || 'date'}`;
        orphanKeys.add(key);
      }
    });

    totalEventsCount += orphanKeys.size;
    teamFinalizedEventsCount += orphanKeys.size;
  } else {
    // If projects not passed or empty, group assignments into shoot events
    const eventGroupMap = new Set<string>();
    (assignments || []).forEach((a) => {
      if (!a) return;
      const key = `${a.projectId || a.projectName || 'proj'}_${safeLower(a.eventName)}_${a.shootDate || 'date'}`;
      eventGroupMap.add(key);
    });

    totalEventsCount = eventGroupMap.size;
    teamFinalizedEventsCount = eventGroupMap.size;
    teamPendingEventsCount = 0;
  }

  // Data Received & Pending calculations across shoot events and logs
  const receivedDataLogCount = (dataReceivedList || []).filter(
    (d) => d && (d.dataStatus === 'received' || d.dataStatus === 'verified' || d.dataStatus === 'backed_up' || d.dataStatus === 'backup_completed')
  ).length;

  const pendingDataLogCount = (dataReceivedList || []).filter(
    (d) => d && (d.dataStatus === 'pending' || d.dataStatus === 'partial' || d.dataStatus === 'partially_received')
  ).length;

  let eventsDataReceivedCount = 0;
  let eventsDataPendingCount = 0;

  if (projects && projects.length > 0) {
    projects.forEach((proj) => {
      const weddingLower = safeLower(proj.clientWeddingTitle);
      const projNameLower = safeLower(proj.projectName);

      (proj.shoots || []).forEach((s) => {
        const crewList = s.crewAssignments || [];
        const hasReceivedInList = (dataReceivedList || []).some((d) => {
          if (!d) return false;
          const dProjLower = safeLower(d.projectName);
          const isMatchProj = dProjLower === weddingLower || dProjLower === projNameLower;
          const isRecdStatus = d.dataStatus === 'received' || d.dataStatus === 'verified' || d.dataStatus === 'backed_up' || d.dataStatus === 'backup_completed';
          return isMatchProj && isRecdStatus;
        });

        const crewDataReceived = crewList.length > 0 && crewList.every((c) => !!c?.dataReceived);

        if (crewDataReceived || hasReceivedInList) {
          eventsDataReceivedCount++;
        } else {
          eventsDataPendingCount++;
        }
      });
    });
  } else {
    eventsDataReceivedCount = receivedDataLogCount;
    eventsDataPendingCount = pendingDataLogCount;
  }

  const dataReceivedEvents = totalEventsCount > 0 ? eventsDataReceivedCount : receivedDataLogCount;
  const dataPendingEvents = totalEventsCount > 0 ? eventsDataPendingCount : pendingDataLogCount;

  // Upcoming shoots (next 7 days or assigned)
  const upcomingAssignments = assignments.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-extrabold text-white">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight">Freelancer Team Command Center</h2>
            <p className="text-xs text-indigo-200">Production staff management, shoots, attendance & payroll hub</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onAddFreelancerClick}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add Freelancer</span>
          </button>

          <button
            onClick={onAssignShootClick}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
          >
            <Film className="w-4 h-4 text-indigo-400" />
            <span>Assign Shoot</span>
          </button>

          <button
            onClick={onRecordPaymentClick}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <DollarSign className="w-4 h-4" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={onManageCategoriesClick}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
          >
            <Tag className="w-4 h-4 text-indigo-400" />
            <span>Categories</span>
          </button>
        </div>
      </div>

      {/* KPI Role Breakdown Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Freelancer Staff Overview
          </h3>
          <button
            onClick={() => onTabChange('all_freelancers')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
          >
            <span>View All ({totalFreelancers})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Total Freelancers */}
          <div
            onClick={() => onTabChange('all_freelancers')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 transition cursor-pointer space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Total Freelance
              </span>
              <Users className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <h3 className="text-2xl font-black text-slate-900">{totalFreelancers}</h3>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60">
                {activeFreelancers} Active
              </span>
            </div>
          </div>

          {/* Photographers */}
          <div
            onClick={() => onTabChange('all_freelancers')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 transition cursor-pointer space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Photographers
              </span>
              <Camera className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-black text-purple-700 pt-1">{photographersCount}</h3>
            <span className="text-[10px] font-medium text-slate-500 block truncate">Candid & Traditional</span>
          </div>

          {/* Videographers */}
          <div
            onClick={() => onTabChange('all_freelancers')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 transition cursor-pointer space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Videographers
              </span>
              <Video className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-black text-blue-700 pt-1">{videographersCount}</h3>
            <span className="text-[10px] font-medium text-slate-500 block truncate">Cinematographers</span>
          </div>

          {/* Drone Operators */}
          <div
            onClick={() => onTabChange('all_freelancers')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 transition cursor-pointer space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Drone Operators
              </span>
              <Navigation className="w-4 h-4 text-teal-500 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-black text-teal-700 pt-1">{droneOperatorsCount}</h3>
            <span className="text-[10px] font-medium text-slate-500 block truncate">4K & FPV Pilots</span>
          </div>

          {/* Assistants */}
          <div
            onClick={() => onTabChange('all_freelancers')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 transition cursor-pointer space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Assistants
              </span>
              <UserCheck className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-black text-emerald-700 pt-1">{assistantsCount}</h3>
            <span className="text-[10px] font-medium text-slate-500 block truncate">Lighting & Support</span>
          </div>

          {/* Others */}
          <div
            onClick={() => onTabChange('all_freelancers')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 transition cursor-pointer space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Others
              </span>
              <Layers className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-black text-amber-700 pt-1">{othersCount}</h3>
            <span className="text-[10px] font-medium text-slate-500 block truncate">Editors & Misc</span>
          </div>
        </div>
      </div>

      {/* Production & Financial Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Payments, Paid & Outstanding Balance Card */}
        <div
          onClick={() => onTabChange('payments')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-red-400 transition cursor-pointer space-y-3 group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Total Payment & Balance
              </span>
              <div className="flex items-baseline gap-1.5 pt-0.5">
                <h3 className="text-2xl font-black text-red-600 font-mono">₹{totalPendingSum.toLocaleString('en-IN')}</h3>
                <span className="text-xs font-bold text-red-500">Pending Balance</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          {/* Breakdown Badges: Paid vs Total */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-emerald-50 border border-emerald-200/70 p-2 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-bold text-[11px] text-emerald-900">Paid</span>
              </div>
              <span className="font-extrabold text-xs text-emerald-700 font-mono">₹{totalPaidSum.toLocaleString('en-IN')}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/70 p-2 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span className="font-bold text-[11px] text-slate-700">Total</span>
              </div>
              <span className="font-extrabold text-xs text-slate-900 font-mono">₹{totalAgreedCost.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-0.5">
            <span>Outstanding Balance: <strong className="text-red-600 font-mono">₹{totalPendingSum.toLocaleString('en-IN')}</strong></span>
            <span className="text-red-600 font-bold group-hover:underline flex items-center gap-0.5">
              Payments <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Raw Data & Footage Logs Card */}
        <div
          onClick={() => onTabChange('data_received')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 transition cursor-pointer space-y-3 group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Raw Data & Footage Status
              </span>
              <div className="flex items-baseline gap-1.5 pt-0.5">
                <h3 className="text-2xl font-black text-amber-600">{dataPendingEvents}</h3>
                <span className="text-xs font-bold text-amber-600">Events Pending</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>

          {/* Breakdown Badges: Received vs Pending */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-emerald-50 border border-emerald-200/70 p-2 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-bold text-[11px] text-emerald-900">Received</span>
              </div>
              <span className="font-extrabold text-xs text-emerald-700 font-mono">{dataReceivedEvents}</span>
            </div>

            <div className="bg-amber-50 border border-amber-200/70 p-2 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="font-bold text-[11px] text-amber-900">Pending</span>
              </div>
              <span className="font-extrabold text-xs text-amber-700 font-mono">{dataPendingEvents}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-0.5">
            <span>Footage Logs: <strong className="text-slate-800">{dataReceivedList.length} Records</strong></span>
            <span className="text-amber-600 font-bold group-hover:underline flex items-center gap-0.5">
              Data Logs <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Category Distribution & Upcoming Shoots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown & Payment Overview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Category Distribution Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-indigo-600" />
              <span>Category Breakdown</span>
            </h3>

            <div className="space-y-3">
              {categories.map((cat) => {
                const count = freelancers.filter((f) => f.mainCategory === cat.name).length;
                const percentage = totalFreelancers > 0 ? Math.round((count / totalFreelancers) * 100) : 0;

                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-800">{cat.name}</span>
                      <span className="font-extrabold text-indigo-600">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


        </div>

        {/* Upcoming Shoots & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Freelancers Directory Highlights */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Top Freelancer Roster</h3>
              <button
                onClick={() => onTabChange('all_freelancers')}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                View Full Roster ({freelancers.length})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {freelancers.slice(0, 4).map((f) => (
                <div
                  key={f.id}
                  onClick={() => onOpenProfile(f)}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 transition cursor-pointer flex items-center gap-3"
                >
                  <img src={f.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'} alt={f.name} className="w-10 h-10 rounded-full object-cover border border-indigo-500" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{f.name}</h4>
                    <p className="text-[10px] text-slate-500">{f.subCategory} • ₹{f.perDayCharges}/day</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
