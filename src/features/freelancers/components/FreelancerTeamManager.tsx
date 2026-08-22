'use client';

import React, { useState } from 'react';
import {
  Freelancer,
  FreelancerAssignment,
  FreelancerPayment,
  FreelancerAttendance,
  FreelancerDataReceived,
  FreelancerCategory,
  FreelancerActivityLog,
  Project,
  FreelancerDocument,
} from '@/types';
import { FreelancerDashboardView } from './FreelancerDashboardView';
import { AllFreelancersView } from './AllFreelancersView';
import { FreelancerApplicationsView } from './FreelancerApplicationsView';
import { ShootAssignmentsView } from './ShootAssignmentsView';
import { ShootCalendarView } from './ShootCalendarView';
import { FreelancerPaymentsView } from './FreelancerPaymentsView';
import { FreelancerAttendanceView } from './FreelancerAttendanceView';
import { FreelancerDataReceivedView } from './FreelancerDataReceivedView';
import { FreelancerReportsView } from './FreelancerReportsView';
import { CategoriesManagerModal } from './CategoriesManagerModal';
import { FreelancerFormModal } from './FreelancerFormModal';
import { FreelancerProfileModal } from './FreelancerProfileModal';
import {
  BarChart3,
  Calendar,
  ClipboardList,
  CreditCard,
  Film,
  HardDrive,
  LayoutDashboard,
  Tag,
  Timer,
  UserPlus,
  Users,
} from 'lucide-react';
import { BTN_CREAM, BTN_GHOST, CARD, TOGGLE_ACTIVE, TOGGLE_IDLE } from '@/features/team/components/TeamUiKit';
import { isPendingApplication } from '../freelancerDomain';

type FreelancerTab =
  | 'dashboard'
  | 'all_freelancers'
  | 'applications'
  | 'assignments'
  | 'calendar'
  | 'payments'
  | 'attendance'
  | 'data_received'
  | 'reports';

interface FreelancerTeamManagerProps {
  freelancers: Freelancer[];
  categories: FreelancerCategory[];
  assignments: FreelancerAssignment[];
  payments: FreelancerPayment[];
  attendanceRecords: FreelancerAttendance[];
  dataReceivedList: FreelancerDataReceived[];
  activityLogs: FreelancerActivityLog[];
  projects: Project[];
  onSaveFreelancer: (freelancer: Freelancer) => void;
  onSaveCategories: (categories: FreelancerCategory[]) => void;
  onSaveAssignments: (assignments: FreelancerAssignment[]) => void;
  onUpdateAssignmentStatus: (assignmentId: string, status: FreelancerAssignment['assignmentStatus']) => void;
  onSavePayment: (payment: FreelancerPayment) => void;
  onSaveAttendance: (record: FreelancerAttendance) => void;
  onUpdateAvailability: (freelancerId: string, status: Freelancer['availabilityStatus']) => void;
  onSaveDataReceived: (record: FreelancerDataReceived) => void;
  onUpdateDataStatus: (dataId: string, status: FreelancerDataReceived['dataStatus']) => void;
  onUpdateDocument?: (freelancerId: string, doc: FreelancerDocument) => void;
  onDeleteFreelancer?: (freelancerId: string) => void;
  onDeleteAssignment?: (assignmentId: string) => void;
}

const TABS: Array<{ id: FreelancerTab; label: string; icon: typeof Users }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'all_freelancers', label: 'Freelancers', icon: Users },
  { id: 'applications', label: 'Applications', icon: ClipboardList },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'assignments', label: 'Assignments', icon: Film },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'attendance', label: 'Work Logs', icon: Timer },
  { id: 'data_received', label: 'Footage', icon: HardDrive },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export const FreelancerTeamManager: React.FC<FreelancerTeamManagerProps> = (props) => {
  const {
    freelancers,
    categories,
    assignments,
    payments,
    attendanceRecords,
    dataReceivedList,
    activityLogs,
    projects,
    onSaveFreelancer,
    onSaveCategories,
    onSaveAssignments,
    onUpdateAssignmentStatus,
    onSavePayment,
    onSaveAttendance,
    onUpdateAvailability,
    onSaveDataReceived,
    onUpdateDataStatus,
    onUpdateDocument,
    onDeleteFreelancer,
    onDeleteAssignment,
  } = props;

  const [activeSubTab, setActiveSubTab] = useState<FreelancerTab>('dashboard');
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showFreelancerFormModal, setShowFreelancerFormModal] = useState(false);
  const [editingFreelancer, setEditingFreelancer] = useState<Freelancer | null>(null);
  const [selectedProfileFreelancer, setSelectedProfileFreelancer] = useState<Freelancer | null>(null);
  const pendingApps = freelancers.filter(isPendingApplication).length;

  const handleOpenAddForm = () => {
    setEditingFreelancer(null);
    setShowFreelancerFormModal(true);
  };

  const handleOpenEditForm = (freelancer: Freelancer) => {
    setEditingFreelancer(freelancer);
    setShowFreelancerFormModal(true);
  };

  const handleSaveFreelancerHandler = (saved: Freelancer) => {
    onSaveFreelancer(saved);
    setShowFreelancerFormModal(false);
    setEditingFreelancer(null);
  };

  return (
    <div className="space-y-6 pb-12">
      <section className="relative overflow-hidden rounded-3xl border border-[#ddc89c]/35 bg-[radial-gradient(circle_at_88%_8%,rgba(221,200,156,.2),transparent_30%),linear-gradient(125deg,#704758,#55333f_50%,#38262d)] p-5 text-white shadow-xl sm:p-7">
        <div className="absolute -bottom-20 -right-10 size-64 rounded-full border-[34px] border-white/[.04]" />
        <div className="relative flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[.14em] text-[#f0dce3]">
              Studio Production Network
            </span>
            <h1 className="mt-3 flex items-center gap-3 text-2xl font-black tracking-tight sm:text-3xl">
              <span className="grid size-11 place-items-center rounded-2xl bg-white/10">
                <UserPlus className="size-6 text-[#f1c8d5]" />
              </span>
              Freelancer Team
            </h1>
            <p className="mt-2 text-sm font-medium leading-relaxed text-[#eadfe2] sm:text-base">
              Talent directory, shoot invitations, availability and freelancer payouts — one production desk for Wedding Photo Planet.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setShowCategoriesModal(true)} className={BTN_GHOST + ' !border-white/20 !bg-white/10 !text-white hover:!bg-white/15'}>
              <Tag className="size-3.5" /> Categories
            </button>
            <button type="button" onClick={handleOpenAddForm} className={BTN_CREAM}>
              <UserPlus className="size-4" />
              Add Freelancer
            </button>
          </div>
        </div>
      </section>

      <section className={`${CARD} p-3 sm:p-4`}>
        <nav className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-[#e2d9d3] bg-[#f6f1ee] p-1.5" aria-label="Freelancer sections">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSubTab(id)}
              className={`relative flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-2.5 text-xs font-extrabold transition sm:flex-none ${
                activeSubTab === id ? TOGGLE_ACTIVE : TOGGLE_IDLE
              }`}
              aria-current={activeSubTab === id ? 'page' : undefined}
            >
              <Icon className="size-3.5" />
              {label}
              {id === 'all_freelancers' && <span className="text-[10px] font-black opacity-60">({freelancers.length})</span>}
              {id === 'applications' && pendingApps > 0 && (
                <span className="rounded-full bg-amber-500 px-1.5 text-[10px] font-black text-white">{pendingApps}</span>
              )}
            </button>
          ))}
        </nav>
      </section>

      {activeSubTab === 'dashboard' && (
        <FreelancerDashboardView
          freelancers={freelancers}
          assignments={assignments}
          payments={payments}
          dataReceivedList={dataReceivedList}
          categories={categories}
          projects={projects}
          onTabChange={(tab) => setActiveSubTab(tab as FreelancerTab)}
          onAddFreelancerClick={handleOpenAddForm}
          onAssignShootClick={() => setActiveSubTab('assignments')}
          onRecordPaymentClick={() => setActiveSubTab('payments')}
          onManageCategoriesClick={() => setShowCategoriesModal(true)}
          onOpenProfile={(f) => setSelectedProfileFreelancer(f)}
        />
      )}

      {activeSubTab === 'all_freelancers' && (
        <AllFreelancersView
          freelancers={freelancers}
          categories={categories}
          assignments={assignments}
          payments={payments}
          onOpenProfile={(f) => setSelectedProfileFreelancer(f)}
          onEditFreelancer={handleOpenEditForm}
          onAddFreelancerClick={handleOpenAddForm}
          onAssignShootClick={() => setActiveSubTab('assignments')}
          onRecordPaymentClick={() => setActiveSubTab('payments')}
          onDeleteFreelancer={onDeleteFreelancer}
        />
      )}

      {activeSubTab === 'applications' && (
        <FreelancerApplicationsView
          freelancers={freelancers}
          onOpenProfile={(f) => setSelectedProfileFreelancer(f)}
          onSaveFreelancer={onSaveFreelancer}
          onAddFreelancerClick={handleOpenAddForm}
        />
      )}

      {activeSubTab === 'assignments' && (
        <ShootAssignmentsView
          assignments={assignments}
          freelancers={freelancers}
          projects={projects}
          onSaveAssignment={onSaveAssignments}
          onUpdateAssignmentStatus={onUpdateAssignmentStatus}
          onDeleteAssignment={onDeleteAssignment}
        />
      )}

      {activeSubTab === 'calendar' && <ShootCalendarView assignments={assignments} freelancers={freelancers} />}

      {activeSubTab === 'payments' && (
        <FreelancerPaymentsView payments={payments} assignments={assignments} freelancers={freelancers} onSavePayment={onSavePayment} />
      )}

      {activeSubTab === 'attendance' && (
        <FreelancerAttendanceView
          attendanceRecords={attendanceRecords}
          freelancers={freelancers}
          onSaveAttendance={onSaveAttendance}
          onUpdateAvailability={onUpdateAvailability}
        />
      )}

      {activeSubTab === 'data_received' && (
        <FreelancerDataReceivedView
          dataReceivedList={dataReceivedList}
          freelancers={freelancers}
          assignments={assignments}
          onSaveDataReceived={onSaveDataReceived}
          onUpdateDataStatus={onUpdateDataStatus}
        />
      )}

      {activeSubTab === 'reports' && (
        <FreelancerReportsView
          freelancers={freelancers}
          assignments={assignments}
          payments={payments}
          dataReceivedList={dataReceivedList}
          categories={categories}
        />
      )}

      {showCategoriesModal && (
        <CategoriesManagerModal
          categories={categories}
          onSaveCategories={onSaveCategories}
          onClose={() => setShowCategoriesModal(false)}
        />
      )}

      {showFreelancerFormModal && (
        <FreelancerFormModal
          existingFreelancer={editingFreelancer}
          categories={categories}
          onSave={handleSaveFreelancerHandler}
          onClose={() => {
            setShowFreelancerFormModal(false);
            setEditingFreelancer(null);
          }}
        />
      )}

      {selectedProfileFreelancer && (
        <FreelancerProfileModal
          freelancer={freelancers.find((f) => f.id === selectedProfileFreelancer.id) || selectedProfileFreelancer}
          assignments={assignments}
          payments={payments}
          attendanceRecords={attendanceRecords}
          dataReceivedList={dataReceivedList}
          activityLogs={activityLogs}
          onEdit={(f) => {
            setSelectedProfileFreelancer(null);
            handleOpenEditForm(f);
          }}
          onClose={() => setSelectedProfileFreelancer(null)}
          onAddPaymentClick={() => {
            setSelectedProfileFreelancer(null);
            setActiveSubTab('payments');
          }}
          onAssignShootClick={() => {
            setSelectedProfileFreelancer(null);
            setActiveSubTab('assignments');
          }}
          onUpdateDocument={onUpdateDocument}
          onDeleteFreelancer={onDeleteFreelancer}
        />
      )}
    </div>
  );
};
