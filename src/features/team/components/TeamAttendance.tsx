'use client';

/**
 * Team & Attendance — the studio's workforce management module.
 *
 * This component is the shell: KPI header, quick actions, tab routing and the
 * shared modals. Every tab reads through `../teamDomain`, which derives its
 * answers from the CRM's existing records — the roster (`TeamMember[]`), the
 * attendance ledger (`AttendanceRecord[]`), shoots and crew inside
 * `Project.shoots[]`, leave requests, and the freelancer assignment/payment
 * records. No parallel employee, attendance or assignment store is created.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  Camera,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Home,
  IndianRupee,
  Plane,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  AttendanceRecord,
  Freelancer,
  FreelancerAssignment,
  FreelancerPayment,
  LeaveRequest,
  Project,
  TeamMember,
  TeamTask,
} from '@/types';
import { useToast } from '@/components/common';
import { MemberDashboardModal } from './MemberDashboardModal';
import { TeamDailyReportingWidget } from './TeamDailyReportingWidget';
import { TeamMonitoringPanel } from './TeamMonitoringPanel';
import { TeamDirectory } from './TeamDirectory';
import { TeamMemberFormModal } from './TeamMemberFormModal';
import { TeamMemberProfileDrawer } from './TeamMemberProfileDrawer';
import { MarkAttendanceModal } from './MarkAttendanceModal';
import { AttendanceDashboard } from './AttendanceDashboard';
import { TeamScheduleView } from './TeamScheduleView';
import { TeamAvailabilityView } from './TeamAvailabilityView';
import { LeaveManagementView } from './LeaveManagementView';
import { ShootAssignmentView } from './ShootAssignmentView';
import { TeamFreelancersView } from './TeamFreelancersView';
import { TeamPerformanceView } from './TeamPerformanceView';
import { AttendanceReportsView } from './AttendanceReportsView';
import {
  BTN_CREAM,
  BTN_GHOST,
  Badge,
  CARD,
  EmptyState,
  KpiCard,
  ScrollArea,
  TD,
  TH,
  TOGGLE_ACTIVE,
  TOGGLE_IDLE,
} from './TeamUiKit';
import {
  formatCurrency,
  formatDayLabel,
  getTeamKpis,
  getTodayDateString,
} from '../teamDomain';

/** Studio-approved editing software presets (also used by MemberDashboardModal). */
export const SOFTWARE_OPTIONS = [
  'Adobe Premiere Pro CC (Video Editing)',
  'DaVinci Resolve Studio (Color Grading)',
  'Adobe Photoshop CC (Photo Retouching)',
  'Adobe Lightroom Classic (Coloring & Culling)',
  'Final Cut Pro X (Mac Video Editing)',
  'After Effects CC (VFX & Motion Graphics)',
  'Canvera Album Design Software',
];

export { UNAUTHORIZED_APPS_SIMULATION } from './TeamMonitoringPanel';

type TeamTabId =
  | 'team'
  | 'attendance'
  | 'schedule'
  | 'availability'
  | 'leave'
  | 'assignments'
  | 'freelancers'
  | 'performance'
  | 'reports';

const TEAM_TABS: Array<{ id: TeamTabId; label: string; icon: typeof Users }> = [
  { id: 'team', label: 'Team', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'schedule', label: 'Schedule', icon: CalendarClock },
  { id: 'availability', label: 'Availability', icon: UserCheck },
  { id: 'leave', label: 'Leave', icon: Plane },
  { id: 'assignments', label: 'Shoot Assignments', icon: Camera },
  { id: 'freelancers', label: 'Freelancers', icon: CircleDollarSign },
  { id: 'performance', label: 'Performance', icon: TrendingUp },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

interface TeamAttendanceProps {
  team: TeamMember[];
  attendance: AttendanceRecord[];
  projects: Project[];
  tasks?: TeamTask[];
  onAddTeamMember: (member: TeamMember, password?: string) => Promise<void>;
  onUpdateTeamMember: (member: TeamMember) => Promise<void>;
  onDeleteTeamMember?: (memberId: string) => void;
  onReorderTeam?: (newTeam: TeamMember[]) => void;
  onRecordAttendance: (record: AttendanceRecord) => void;
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
  onAddTask?: (task: TeamTask) => void;
  onUpdateTask?: (task: TeamTask) => void;
  onDeleteTask?: (taskId: string) => void;

  // ---- Wired in by CrmApplication; each degrades gracefully when absent ----
  leaves?: LeaveRequest[];
  onSaveLeave?: (leave: LeaveRequest) => void;
  onUpdateProject?: (project: Project) => void;
  freelancers?: Freelancer[];
  freelancerAssignments?: FreelancerAssignment[];
  freelancerPayments?: FreelancerPayment[];
  currentUser?: { id: string; name: string; role: string } | null;
  onNavigateToFreelancers?: () => void;
  accessRoles?: import('@/features/access').AccessRole[];
}

export const TeamAttendance: React.FC<TeamAttendanceProps> = ({
  team,
  attendance,
  projects,
  tasks = [],
  onAddTeamMember,
  onUpdateTeamMember,
  onDeleteTeamMember,
  onReorderTeam,
  onRecordAttendance,
  onUpdateAttendance,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  leaves = [],
  onSaveLeave,
  onUpdateProject,
  freelancers = [],
  freelancerAssignments = [],
  freelancerPayments = [],
  currentUser,
  onNavigateToFreelancers,
  accessRoles = [],
}) => {
  const { showToast } = useToast();
  const today = getTodayDateString();
  const [activeTab, setActiveTab] = useState<TeamTabId>('team');

  // Modal / drawer state
  const [profileMember, setProfileMember] = useState<TeamMember | null>(null);
  const [formMember, setFormMember] = useState<TeamMember | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formDefaultType, setFormDefaultType] = useState<'Freelancer' | undefined>(undefined);
  const [attendanceTarget, setAttendanceTarget] = useState<{ member: TeamMember; date: string } | null>(null);
  const [leaveTarget, setLeaveTarget] = useState<TeamMember | null>(null);
  const [assignFocusMember, setAssignFocusMember] = useState<TeamMember | null>(null);
  const [dashboardMember, setDashboardMember] = useState<TeamMember | null>(null);

  /** Keep an open profile in sync when its member record changes elsewhere. */
  useEffect(() => {
    if (!profileMember) return;
    const fresh = team.find((m) => m.id === profileMember.id);
    if (fresh && fresh !== profileMember) setProfileMember(fresh);
    if (!fresh) setProfileMember(null);
  }, [team, profileMember]);

  const kpis = useMemo(
    () => getTeamKpis(team, attendance, projects, leaves, freelancers.length, today),
    [team, attendance, projects, leaves, freelancers.length, today]
  );

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------

  const openAddMember = (asFreelancer = false) => {
    setFormMember(null);
    setFormDefaultType(asFreelancer ? 'Freelancer' : undefined);
    setIsFormOpen(true);
  };

  const openEditMember = (member: TeamMember) => {
    setFormMember(member);
    setFormDefaultType(undefined);
    setIsFormOpen(true);
  };

  const handleSaveMember = async (member: TeamMember, mode: 'create' | 'update', password?: string) => {
    if (mode === 'create') {
      await onAddTeamMember(member, password);
      showToast(`${member.name} was added to the team and can now sign in with the temporary password you set.`);
    } else {
      await onUpdateTeamMember(member);
      showToast(`${member.name}'s profile updated.`);
      if (profileMember?.id === member.id) setProfileMember(member);
    }
    setIsFormOpen(false);
    setFormMember(null);
  };

  /**
   * Deactivate rather than delete: attendance history and past shoot
   * assignments must stay readable for a member who has left.
   */
  const handleToggleActive = (member: TeamMember) => {
    const isActive = (member.status || 'active') === 'active';
    const updated: TeamMember = {
      ...member,
      status: isActive ? 'inactive' : 'active',
      workStatus: isActive ? 'CLOCKED_OUT' : member.workStatus,
    };
    void onUpdateTeamMember(updated);
    if (profileMember?.id === member.id) setProfileMember(updated);
    showToast(
      isActive
        ? `${member.name} deactivated — their attendance and shoot history is preserved.`
        : `${member.name} reactivated.`
    );
  };

  /** Upsert one attendance row without disturbing the rest of the ledger. */
  const handleSaveAttendance = (record: AttendanceRecord) => {
    const exists = attendance.some((a) => a.id === record.id);
    if (exists) {
      onUpdateAttendance(attendance.map((a) => (a.id === record.id ? record : a)));
    } else {
      onRecordAttendance(record);
    }
  };

  const handleSaveLeave = (leave: LeaveRequest) => {
    if (onSaveLeave) {
      onSaveLeave(leave);
      return;
    }
    showToast('Leave storage is not wired up in this workspace yet.', { variant: 'error' });
  };

  const openMarkAttendance = (member: TeamMember, date: string = today) => {
    setAttendanceTarget({ member, date });
  };

  const openAssignShoot = (member: TeamMember) => {
    setAssignFocusMember(member);
    setActiveTab('assignments');
    setProfileMember(null);
  };

  const openApplyLeave = (member?: TeamMember) => {
    setLeaveTarget(member || ({ id: '__any__' } as TeamMember));
    setActiveTab('leave');
    // The apply-leave form renders inside the Leave tab, so the drawer has to
    // step out of the way for it to be reachable.
    setProfileMember(null);
  };

  const togglePayStatus = (recordId: string) => {
    onUpdateAttendance(
      attendance.map((a) =>
        a.id === recordId ? { ...a, paidStatus: a.paidStatus === 'paid' ? ('pending' as const) : ('paid' as const) } : a
      )
    );
  };

  const totalPendingPayout = useMemo(
    () => attendance.filter((a) => a.paidStatus === 'pending').reduce((sum, a) => sum + (a.payAmount || 0), 0),
    [attendance]
  );

  // --------------------------------------------------------------------------

  const quickActions = [
    { label: 'Add Team Member', icon: UserPlus, onClick: () => openAddMember(), primary: true },
    { label: 'Mark Attendance', icon: CalendarCheck, onClick: () => setActiveTab('attendance') },
    { label: 'Assign Shoot', icon: Camera, onClick: () => setActiveTab('assignments') },
    { label: 'Apply Leave', icon: CalendarPlus, onClick: () => openApplyLeave() },
    { label: 'View Schedule', icon: CalendarClock, onClick: () => setActiveTab('schedule') },
    { label: 'Add Freelancer', icon: UserCheck, onClick: () => openAddMember(true) },
  ];

  const pendingLeaveCount = leaves.filter((l) => l.status === 'pending').length;

  return (
    <div className="space-y-6 pb-12">
      <section className="relative overflow-hidden rounded-3xl border border-[#ddc89c]/35 bg-[radial-gradient(circle_at_88%_8%,rgba(221,200,156,.2),transparent_30%),linear-gradient(125deg,#704758,#55333f_50%,#38262d)] p-5 text-white shadow-xl sm:p-7">
        <div className="absolute -bottom-20 -right-10 size-64 rounded-full border-[34px] border-white/[.04]" />
        <div className="relative flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[.14em] text-[#f0dce3]">
                <ShieldCheck className="size-4 text-emerald-300" />
                Studio Team CRM
              </span>
              {currentUser && (
                <span className="rounded-lg border border-white/15 bg-black/10 px-3 py-1 text-sm font-semibold text-[#eadfe2]">
                  {currentUser.name} · {currentUser.role}
                </span>
              )}
            </div>
            <h1 className="mt-3 flex items-center gap-3 text-2xl font-black tracking-tight sm:text-3xl">
              <span className="grid size-11 place-items-center rounded-2xl bg-white/10">
                <Users className="size-6 text-[#f1c8d5]" />
              </span>
              Team & Attendance
            </h1>
            <p className="mt-2 text-sm font-medium leading-relaxed text-[#eadfe2] sm:text-base">
              Who works for us, who is available, who is on a shoot, and who still needs to be paid — one workforce view for the whole studio.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" onClick={() => openAddMember()} className={BTN_CREAM}>
              <span className="grid size-8 place-items-center rounded-xl bg-[#7d3650] text-white transition group-hover:rotate-6">
                <Plus className="size-5" />
              </span>
              <span>Add Team Member</span>
              <Sparkles className="size-4 text-[#aa7251]" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Total Team" value={kpis.totalMembers} hint="All studio staff on roster" icon={Users} tone="rose" onClick={() => setActiveTab('team')} />
        <KpiCard label="Active" value={kpis.activeMembers} hint={`${kpis.inactiveMembers} inactive`} icon={ShieldCheck} tone="emerald" />
        <KpiCard label="Available Today" value={kpis.availableToday} hint="Ready for assignment" icon={UserCheck} tone="emerald" onClick={() => setActiveTab('availability')} />
        <KpiCard label="On Shoot Today" value={kpis.onShootToday} hint="Booked on a wedding / event" icon={Camera} tone="violet" onClick={() => setActiveTab('assignments')} />
        <KpiCard label="On Leave Today" value={kpis.onLeaveToday} hint="Approved leave" icon={Plane} tone="amber" onClick={() => setActiveTab('leave')} />
        <KpiCard label="Present Today" value={kpis.presentToday} hint="Office, WFH or shoot" icon={CalendarCheck} tone="emerald" onClick={() => setActiveTab('attendance')} />
        <KpiCard label="Absent Today" value={kpis.absentToday} hint="Not marked present" icon={FileText} tone="red" onClick={() => setActiveTab('attendance')} />
        <KpiCard label="WFH Today" value={kpis.wfhToday} hint="Working from home" icon={Home} tone="blue" />
        <KpiCard label="Freelancers" value={kpis.freelancers} hint="External crew on file" icon={CircleDollarSign} tone="rose" onClick={() => setActiveTab('freelancers')} />
        <KpiCard label="Pending Attendance" value={kpis.pendingAttendance} hint="Still unmarked today" icon={FileText} tone="amber" onClick={() => setActiveTab('attendance')} />
      </section>

      <section className={`${CARD} p-3 sm:p-4`}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {quickActions.filter((a) => !a.primary).map(({ label, icon: Icon, onClick }) => (
            <button key={label} type="button" onClick={onClick} className={BTN_GHOST}>
              <Icon className="size-3.5" /> {label}
            </button>
          ))}
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-[#e2d9d3] bg-[#f6f1ee] p-1.5" aria-label="Team sections">
          {TEAM_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`relative flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-2.5 text-xs font-extrabold transition sm:flex-none ${
                activeTab === id ? TOGGLE_ACTIVE : TOGGLE_IDLE
              }`}
              aria-current={activeTab === id ? 'page' : undefined}
            >
              <Icon className="size-3.5" />
              {label}
              {id === 'team' && <span className="text-[10px] font-black opacity-60">({team.length})</span>}
              {id === 'leave' && pendingLeaveCount > 0 && (
                <span className="rounded-full bg-amber-500 px-1.5 text-[10px] font-black text-white">{pendingLeaveCount}</span>
              )}
              {activeTab === id && <CheckCircle2 className="size-3.5 text-emerald-700" />}
            </button>
          ))}
        </nav>
      </section>

      {/* Software-guard alert banners stay visible across the module */}
      <TeamMonitoringPanel
        team={team}
        softwareOptions={SOFTWARE_OPTIONS}
        onUpdateTeamMember={onUpdateTeamMember}
        onOpenMember={setDashboardMember}
        onEditMember={openEditMember}
        bannersOnly
      />

      {/* ---------------- Tabs ---------------- */}
      {activeTab === 'team' && (
        <TeamDirectory
          team={team}
          attendance={attendance}
          projects={projects}
          leaves={leaves}
          today={today}
          onOpenProfile={setProfileMember}
          onEditMember={openEditMember}
          onToggleActive={handleToggleActive}
          onMarkAttendance={(member) => openMarkAttendance(member)}
          onAssignShoot={openAssignShoot}
          onApplyLeave={openApplyLeave}
          onAddMember={() => openAddMember()}
          monitoringSlot={
            <details className={`${CARD} group`}>
              <summary className="flex items-center justify-between gap-2 px-5 py-3 cursor-pointer list-none">
                <span className="text-xs font-extrabold uppercase tracking-tight text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#8f3655]" /> Software guard &amp; workstation monitoring
                </span>
                <Badge className="bg-slate-100 text-slate-600 border-slate-200 group-open:hidden">Show</Badge>
                <Badge className="bg-slate-100 text-slate-600 border-slate-200 hidden group-open:inline-flex">Hide</Badge>
              </summary>
              <div className="px-5 pb-5 space-y-4">
                <TeamMonitoringPanel
                  team={team}
                  softwareOptions={SOFTWARE_OPTIONS}
                  onUpdateTeamMember={onUpdateTeamMember}
                  onOpenMember={setDashboardMember}
                  onEditMember={openEditMember}
                />
                {/* The original reorderable workstation cards */}
                <TeamMonitoringPanel
                  team={team}
                  softwareOptions={SOFTWARE_OPTIONS}
                  onUpdateTeamMember={onUpdateTeamMember}
                  onReorderTeam={onReorderTeam}
                  onDeleteTeamMember={onDeleteTeamMember}
                  onOpenMember={setDashboardMember}
                  onEditMember={openEditMember}
                  cardsOnly
                />
              </div>
            </details>
          }
        />
      )}

      {activeTab === 'attendance' && (
        <AttendanceDashboard
          team={team}
          attendance={attendance}
          projects={projects}
          leaves={leaves}
          onSaveAttendance={handleSaveAttendance}
          onOpenMarkAttendance={openMarkAttendance}
          onOpenProfile={setProfileMember}
        />
      )}

      {activeTab === 'schedule' && (
        <TeamScheduleView
          team={team}
          attendance={attendance}
          projects={projects}
          leaves={leaves}
          onOpenProfile={setProfileMember}
        />
      )}

      {activeTab === 'availability' && (
        <TeamAvailabilityView
          team={team}
          attendance={attendance}
          projects={projects}
          leaves={leaves}
          onUpdateMember={onUpdateTeamMember}
          onAssignShoot={openAssignShoot}
          onOpenProfile={setProfileMember}
        />
      )}

      {activeTab === 'leave' && (
        <LeaveManagementView
          team={team}
          leaves={leaves}
          projects={projects}
          currentUserName={currentUser?.name}
          onSaveLeave={handleSaveLeave}
          applyForMember={leaveTarget}
          onCloseApplyForm={() => setLeaveTarget(null)}
          onOpenApplyForm={(member) => openApplyLeave(member)}
        />
      )}

      {activeTab === 'assignments' && (
        onUpdateProject ? (
          <ShootAssignmentView
            team={team}
            projects={projects}
            attendance={attendance}
            leaves={leaves}
            onUpdateProject={onUpdateProject}
            focusMember={assignFocusMember}
            onClearFocusMember={() => setAssignFocusMember(null)}
            onOpenProfile={setProfileMember}
          />
        ) : (
          <div className={CARD}>
            <EmptyState
              icon={Camera}
              title="Shoot assignment is unavailable here"
              message="This workspace was opened without project write access — open Team & Attendance from the main CRM to assign crew."
            />
          </div>
        )
      )}

      {activeTab === 'freelancers' && (
        <TeamFreelancersView
          team={team}
          attendance={attendance}
          projects={projects}
          leaves={leaves}
          freelancers={freelancers}
          freelancerAssignments={freelancerAssignments}
          freelancerPayments={freelancerPayments}
          onOpenProfile={setProfileMember}
          onAddFreelancer={() => openAddMember(true)}
          onGoToFreelancerModule={onNavigateToFreelancers}
        />
      )}

      {activeTab === 'performance' && (
        <TeamPerformanceView
          team={team}
          attendance={attendance}
          projects={projects}
          leaves={leaves}
          onOpenProfile={setProfileMember}
        />
      )}

      {activeTab === 'reports' && (
        <div className="space-y-5">
          <AttendanceReportsView
            team={team}
            attendance={attendance}
            projects={projects}
            leaves={leaves}
            dailyWidgetSlot={
              <TeamDailyReportingWidget
                team={team}
                attendance={attendance}
                tasks={tasks}
                projects={projects}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                onAddTask={onAddTask}
                onOpenMemberModal={setDashboardMember}
              />
            }
          />

          {/* Payout ledger — preserved from the original module */}
          <section className={`${CARD} p-5 space-y-3`}>
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-[#8f3655]" /> Team payout ledger
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Pending payouts: <strong className="text-slate-800">{formatCurrency(totalPendingPayout)}</strong>
                </p>
              </div>
            </header>

            {attendance.length === 0 ? (
              <EmptyState
                icon={IndianRupee}
                title="No payout entries yet"
                message="Mark attendance to start building the payout ledger — each duty day carries its own pay amount."
              />
            ) : (
              <ScrollArea>
                <table className="w-full min-w-[860px] border-collapse">
                  <thead className="border-b border-slate-200">
                    <tr>
                      <TH>Crew member</TH>
                      <TH>Role</TH>
                      <TH>Duty date</TH>
                      <TH>In</TH>
                      <TH>Out</TH>
                      <TH>Project</TH>
                      <TH>Pay</TH>
                      <TH className="text-right">Status</TH>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendance
                      .slice()
                      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
                      .slice(0, 200)
                      .map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50 transition">
                          <TD className="font-extrabold text-slate-900">{a.teamMemberName}</TD>
                          <TD className="text-slate-500">{a.role}</TD>
                          <TD className="font-mono text-[11px]">{formatDayLabel(a.date)}</TD>
                          <TD className="font-mono text-emerald-700 font-semibold">{a.inTime || '--'}</TD>
                          <TD className="font-mono text-red-700 font-semibold">{a.outTime || '--'}</TD>
                          <TD className="text-slate-600 max-w-[190px] truncate">{a.projectTitle || 'Studio duty'}</TD>
                          <TD className="font-mono font-bold text-[#6d2f45]">{formatCurrency(a.payAmount)}</TD>
                          <TD className="text-right">
                            <button
                              type="button"
                              onClick={() => togglePayStatus(a.id)}
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                                a.paidStatus === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-gradient-to-r from-[#8f3655] to-[#6d2f45] text-white hover:opacity-90'
                              }`}
                            >
                              {a.paidStatus === 'paid' ? 'Mark unpaid' : 'Clear payout'}
                            </button>
                          </TD>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </ScrollArea>
            )}
          </section>
        </div>
      )}

      {/* ---------------- Shared modals ---------------- */}

      <TeamMemberFormModal
        isOpen={isFormOpen}
        member={formMember}
        team={team}
        softwareOptions={SOFTWARE_OPTIONS}
        defaultEmploymentType={formDefaultType}
        accessRoles={accessRoles}
        onSave={handleSaveMember}
        onClose={() => {
          setIsFormOpen(false);
          setFormMember(null);
        }}
      />

      <TeamMemberProfileDrawer
        member={profileMember}
        team={team}
        attendance={attendance}
        projects={projects}
        leaves={leaves}
        onClose={() => setProfileMember(null)}
        onEdit={openEditMember}
        onUpdateMember={(updated) => {
          onUpdateTeamMember(updated);
          setProfileMember(updated);
        }}
        onMarkAttendance={(member) => openMarkAttendance(member)}
        onAssignShoot={openAssignShoot}
        onApplyLeave={(member) => openApplyLeave(member)}
        onToggleActive={handleToggleActive}
        onOpenFullDashboard={(member) => {
          setProfileMember(null);
          setDashboardMember(member);
        }}
      />

      <MarkAttendanceModal
        isOpen={!!attendanceTarget}
        member={attendanceTarget?.member || null}
        defaultDate={attendanceTarget?.date || today}
        team={team}
        attendance={attendance}
        projects={projects}
        leaves={leaves}
        onSave={handleSaveAttendance}
        onClose={() => setAttendanceTarget(null)}
        onChangeMember={(member) => setAttendanceTarget((prev) => (prev ? { ...prev, member } : { member, date: today }))}
      />

      {/* The original per-member dashboard (tasks, salary slip, software) */}
      {dashboardMember && (
        <MemberDashboardModal
          member={dashboardMember}
          attendance={attendance}
          tasks={tasks}
          projects={projects}
          onClose={() => setDashboardMember(null)}
          onUpdateTeamMember={(updated) => {
            onUpdateTeamMember(updated);
            setDashboardMember(updated);
          }}
          onRecordAttendance={onRecordAttendance}
          onUpdateAttendance={onUpdateAttendance}
          onAddTask={(task) => onAddTask?.(task)}
          onUpdateTask={(task) => onUpdateTask?.(task)}
          onDeleteTask={onDeleteTask}
        />
      )}
    </div>
  );
};
