'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Project, 
  TeamMember, 
  AttendanceRecord, 
  ProjectStatus, 
  TeamTask,
  Freelancer,
  FreelancerCategory,
  FreelancerAssignment,
  FreelancerPayment,
  FreelancerAttendance,
  FreelancerDataReceived,
  FreelancerActivityLog,
  FreelancerDocument,
  LeaveRequest
} from '@/types';

import { Sidebar, TopHeader, TabType } from '@/components/layout';
import { ClientsDirectoryView } from '@/features/clients/ClientsDirectoryView';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { LoginInput } from '@/lib/api/auth';
import { useProjectMutation, useProjects } from '@/hooks/useProjects';
import { useTeam, useTeamMutation } from '@/hooks/useTeam';
import { useAttendance } from '@/hooks/useAttendance';
import { useTaskMutations, useTasks } from '@/hooks/useTasks';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { useDeferredLoad } from '@/hooks/useDeferredLoad';
import { useRbac } from '@/hooks/useRbac';
import { normalizeTeamMember } from '@/features/team/teamViewModel';
import { normalizeAttendance } from '@/features/attendance/attendanceViewModel';
import { ApiError } from '@/lib/api/client';
import { rbacApi } from '@/lib/api/rbac';
import { isPersistedProjectId, normalizeProject } from '@/features/projects/projectViewModel';
import { persistStudioProject } from '@/features/projects/persistProject';
import { attachShoots, persistProjectShoots, persistShootDataHandover } from '@/features/shoots/persistShoots';
import { shootsApi } from '@/lib/api/shoots';
import { paymentMethodLabel, paymentsApi } from '@/lib/api/payments';
import { normalizeTask, taskCreateInput, taskStatusInput } from '@/features/tasks/taskViewModel';
import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import { AISuggestionsModal } from '@/components/ai/AISuggestionsModal';
import { OwnerDashboard } from '@/features/dashboard';
import { OwnerWorkspace } from '@/features/owner';
import { EquipmentInventory } from '@/features/equipment';
import { LeadsManagement } from '@/features/leads';
import { RoleWorkspaceHub, canAccessProject, isStudioAdmin, visibleProjects } from '@/features/workspaces';
import {
  ProjectsManager,
  ProjectFormModal,
  ProjectDetailModal,
  InvoiceModal,
  AllPaymentsModal,
} from '@/features/projects';
import { ScheduleShootModal, ShootManagement } from '@/features/shoots';
import { DataManagement } from '@/features/data-management';
import { TeamAttendance, MemberDashboardModal } from '@/features/team';
import { EmployeeDashboardTasks } from '@/features/tasks/EmployeeDashboardTasks';
import { DeliveriesManager } from '@/features/deliveries';
import { FreelancerTeamManager } from '@/features/freelancers';
import { BACKEND_MODULE_META, BACKEND_MODULE_ORDER, FINANCE_PERMISSION_ORDER, hasAnyPermission, hasPermission, PermissionProvider, ROLE_UI_HIDDEN_KEYS, ROLE_UI_MODULE_OVERRIDE, RolesPermissionsManager, TAB_PERMISSIONS, TEAM_PERMISSION_ORDER } from '@/features/access';
import { ExpenseManagement } from '@/features/expenses';
import { expenseService } from '@/features/expenses/services/expenseService';
import type { Expense } from '@/features/expenses/types';
import { ShieldAlert, ShieldCheck, ArrowRight } from 'lucide-react';
import { ToastProvider } from '@/components/common';

const TAB_ROUTES: Record<TabType, string> = {
  dashboard: '/dashboard',
  owner_workspace: '/owner-workspace',
  equipment: '/equipment',
  roles: '/workspaces',
  leads: '/leads',
  projects: '/projects',
  shoots: '/shoots',
  expenses: '/expenses',
  data: '/data-management',
  team: '/team',
  freelancers: '/freelancers',
  clients: '/clients',
  deliveries: '/deliveries',
  access: '/roles-permissions',
};

const ROUTE_TABS = Object.fromEntries(
  Object.entries(TAB_ROUTES).map(([tab, route]) => [route, tab])
) as Record<string, TabType>;

function AccessDenied() {
  return (
    <div className="mx-auto my-12 max-w-xl rounded-3xl border border-[#eee7e2] bg-white p-8 text-center shadow-xl sm:p-12">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-rose-50 text-[#8f3655]">
        <ShieldAlert className="size-8" />
      </div>
      <h3 className="mt-5 text-2xl font-black text-slate-900">You don&apos;t have permission to access this section.</h3>
      <p className="mt-2 text-sm font-medium text-slate-500">Ask an Admin to update your role in Roles &amp; Permissions.</p>
    </div>
  );
}

function apiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) return fallback;
  const details = error.details
    ?.filter((detail): detail is { field?: string; message?: string } => typeof detail === 'object' && detail !== null)
    .map((detail) => `${detail.field ? `${detail.field}: ` : ''}${detail.message ?? ''}`.trim())
    .filter(Boolean);
  return details?.length ? `${error.message}\n${details.join('\n')}` : error.message;
}

function isEmployeeAttendanceUser(user: { role?: string; roles?: string[] } | null): boolean {
  if (!user) return false;
  const roleNames = user.roles?.length ? user.roles : [user.role ?? ''];
  return !roleNames.some((role) => /(^|\W)(admin|owner)(\W|$)/i.test(role));
}

export default function App() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isHydrated, login, logout, refresh } = useAuthSession();

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // CRM entities are intentionally not restored from browser storage. They will
  // be supplied by feature API queries during the next integration phase.
  const isDashboard = pathname === '/dashboard';
  // One aggregated read for the dashboard's counts, today's attendance and the
  // next shoots, instead of deriving them from full paginated datasets.
  const summaryQuery = useDashboardSummary(Boolean(currentUser) && isDashboard);
  // On the dashboard, record-level datasets only feed panels below the fold, so
  // they wait until the summary-driven view is on screen and the browser idles.
  const secondaryReady = useDeferredLoad(Boolean(currentUser)) || !isDashboard;

  const [projects, setProjects] = useState<Project[]>([]);
  const projectQuery = useProjects(
    { page: 1, limit: 100 },
    Boolean(currentUser) && secondaryReady,
  );

  useEffect(() => {
    if (!currentUser || projectQuery.loading || projectQuery.error) return;
    const mapped = projectQuery.data.map(normalizeProject);
    setProjects(mapped);
    void shootsApi.list({ page: 1, limit: 100 })
      .then((result) => setProjects((current) => attachShoots(current, result.items)))
      .catch(() => undefined);
    // Project financial summaries must be derived from the persisted finance
    // ledger, not the legacy project-local `advanceReceived` field.
    void paymentsApi.listCompletedProjectPayments()
      .then((items) => {
        const byProject = new Map<string, Project['payments']>();
        items.forEach((payment) => {
          if (!payment.projectId) return;
          const records = byProject.get(payment.projectId) ?? [];
          records.push({
            id: payment.id,
            date: payment.paymentDate.slice(0, 10),
            amount: Number(payment.amount),
            type: 'installment',
            paymentMode: paymentMethodLabel(payment.paymentMethod) as Project['payments'][number]['paymentMode'],
            receiptNumber: payment.paymentNumber,
            notes: payment.notes || undefined,
          });
          byProject.set(payment.projectId, records);
        });
        setProjects((current) => current.map((project) => {
          const payments = byProject.get(project.id) ?? [];
          const advanceReceived = payments.reduce((sum, payment) => sum + payment.amount, 0);
          return { ...project, payments, advanceReceived, balanceDue: Math.max(0, project.totalBudget - advanceReceived) };
        }));
      })
      .catch(() => undefined);
  }, [currentUser, isDashboard, projectQuery.data, projectQuery.error, projectQuery.loading]);
  const projectMutations = useProjectMutation(projectQuery.retry);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const canManageTeamAttendance = Boolean(
    currentUser?.permissions?.includes('TEAM_VIEW') ||
    currentUser?.permissions?.includes('ATTENDANCE_VIEW') ||
    currentUser?.permissions?.includes('ATTENDANCE_MANAGE')
  );
  const shouldLoadTeam = Boolean(currentUser) && secondaryReady;
  const teamQuery = useTeam(
    { page: 1, limit: 100 },
    shouldLoadTeam,
  );
  const teamMutations = useTeamMutation(teamQuery.refresh);
  const rbacQuery = useRbac(
    Boolean(currentUser) && (pathname === '/team' || pathname === '/roles-permissions'),
  );

  useEffect(() => {
    if (!currentUser || teamQuery.loading) return;
    setTeam(teamQuery.data.map(normalizeTeamMember));
  }, [currentUser, teamQuery.data, teamQuery.error, teamQuery.loading]);

  // Dashboard: only TeamActivity and the salary modal read these records, both
  // below the fold. Today's own status comes from the summary instead.
  const attendanceQuery = useAttendance(
    { page: 1, limit: 100 },
    Boolean(currentUser) &&
      canManageTeamAttendance &&
      secondaryReady &&
      (pathname === '/dashboard' || pathname === '/team'),
  );

  useEffect(() => {
    if (!currentUser || attendanceQuery.loading || attendanceQuery.error) return;
    setAttendance(attendanceQuery.data.map(normalizeAttendance));
  }, [attendanceQuery.data, attendanceQuery.error, attendanceQuery.loading, currentUser]);

  const canViewTasks = Boolean(currentUser?.permissions?.includes('TASK_VIEW'));
  const canManageTasks = Boolean(
    currentUser?.permissions?.includes('TASK_ASSIGN') || currentUser?.permissions?.includes('TASK_CREATE'),
  );
  // Employees see their task workspace above the fold, so their tasks are
  // critical. For owners/admins tasks only feed TeamActivity further down.
  const tasksAreCritical = isEmployeeAttendanceUser(currentUser);
  const shouldLoadTasks = Boolean(currentUser) && canViewTasks &&
    (tasksAreCritical || secondaryReady) && (
      pathname === '/dashboard' || pathname === '/team' || pathname === '/workspaces'
    );
  const taskQueryInput = useMemo(() => ({
    page: 1,
    limit: 100,
    ...(canManageTasks ? {} : { assigneeId: currentUser?.id }),
  }), [canManageTasks, currentUser?.id]);
  const taskQuery = useTasks(taskQueryInput, shouldLoadTasks);
  const taskMutations = useTaskMutations(taskQuery.refresh);

  const accessRoles = [];
  const backendAccessRoles = useMemo(() => rbacQuery.roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description || '',
    type: role.type === 'SYSTEM' ? 'system' as const : 'custom' as const,
    status: role.status === 'INACTIVE' ? 'inactive' as const : 'active' as const,
    grants: Object.fromEntries(role.rolePermissions.map(({ permission }) => [permission.key, { enabled: true }])),
    createdAt: role.createdAt.slice(0, 10),
    updatedAt: role.updatedAt.slice(0, 10),
    userCount: role._count.userRoles,
    assignable: role.assignable ?? false,
    personalForUserId: role.personalForUserId ?? null,
  })), [rbacQuery.roles]);
  const canViewAudit = Boolean(currentUser?.permissions?.includes('AUDIT_VIEW'));
  /** Role-scoped audit entries, loaded only when the log is opened. */
  const loadRoleAudit = useCallback(async () => {
    const entries = await rbacApi.roleAudit();
    return entries.map((entry) => ({
      id: entry.id,
      roleId: entry.entityId ?? '',
      roleName: entry.newData?.name ?? entry.oldData?.name ?? entry.summary ?? 'Role',
      added: entry.newData?.added ?? [],
      removed: entry.newData?.removed ?? [],
      changedBy: entry.actor?.fullName ?? 'System',
      date: entry.createdAt,
    }));
  }, []);

  // Role IDs used by employee creation must always come from the backend.
  // Do not fall back to the retired browser-persisted role catalogue.
  const effectiveAccessRoles = backendAccessRoles;
  const backendPermissionModules = useMemo(() => {
    const modules = new Map<string, { id: string; label: string; description: string; permissions: Array<{ key: string; label: string; description?: string; sensitive?: boolean }> }>();
    rbacQuery.permissions.forEach((permission) => {
      if (ROLE_UI_HIDDEN_KEYS.has(permission.key)) return;
      const moduleId = ROLE_UI_MODULE_OVERRIDE[permission.key] ?? permission.module;
      const meta = BACKEND_MODULE_META[moduleId];
      const current = modules.get(moduleId) ?? {
        id: moduleId,
        label: meta?.label ?? moduleId,
        description: meta?.description ?? 'Backend permission group',
        permissions: [],
      };
      current.permissions.push({ key: permission.key, label: permission.label, description: permission.description ?? undefined, sensitive: permission.isSensitive });
      modules.set(moduleId, current);
    });
    return [...modules.values()]
      .filter((mod) => mod.permissions.length > 0)
      .map((mod) => {
        const rankList = mod.id === 'team' ? TEAM_PERMISSION_ORDER : mod.id === 'finance' ? FINANCE_PERMISSION_ORDER : null;
        if (!rankList) return mod;
        const rank = (key: string) => {
          const i = rankList.indexOf(key);
          return i === -1 ? 99 : i;
        };
        return { ...mod, permissions: [...mod.permissions].sort((a, b) => rank(a.key) - rank(b.key)) };
      })
      .sort((a, b) => {
        const ai = BACKEND_MODULE_ORDER.indexOf(a.id);
        const bi = BACKEND_MODULE_ORDER.indexOf(b.id);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
  }, [rbacQuery.permissions]);


  const [tasks, setTasks] = useState<TeamTask[]>([]);

  useEffect(() => {
    if (!currentUser || taskQuery.loading || taskQuery.error) return;
    setTasks(taskQuery.data.map(normalizeTask));
  }, [currentUser, taskQuery.data, taskQuery.error, taskQuery.loading]);

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  // Freelancer Module Persistent States
  const [freelancerCategories, setFreelancerCategories] = useState<FreelancerCategory[]>([]);

  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);

  const [freelancerAssignments, setFreelancerAssignments] = useState<FreelancerAssignment[]>([]);

  const [freelancerPayments, setFreelancerPayments] = useState<FreelancerPayment[]>([]);

  const [freelancerAttendance, setFreelancerAttendance] = useState<FreelancerAttendance[]>([]);

  const [freelancerDataReceived, setFreelancerDataReceived] = useState<FreelancerDataReceived[]>([]);

  const [freelancerActivityLogs, setFreelancerActivityLogs] = useState<FreelancerActivityLog[]>([]);

  // Tab, Sidebar & Filter States
  const [activeTab, setActiveTabState] = useState<TabType>(() => ROUTE_TABS[pathname] || (pathname.startsWith('/projects/') ? 'projects' : 'dashboard'));
  const setActiveTab = useCallback((tab: TabType) => {
    setActiveTabState(tab);
    router.push(TAB_ROUTES[tab]);
  }, [router]);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [freelancerFocus, setFreelancerFocus] = useState<{ date: string; projectId: string; shootId: string } | null>(null);

  useEffect(() => {
    const routeTab = ROUTE_TABS[pathname];
    if (routeTab) setActiveTabState(routeTab);
    else if (pathname.startsWith('/projects/')) setActiveTabState('projects');
  }, [pathname]);

  const canAccessTab = useCallback(
    (tab: TabType) => {
      if (tab === 'owner_workspace') return true;
      const key = TAB_PERMISSIONS[tab];
      if (!key) return true;
      return hasAnyPermission(currentUser, accessRoles, key);
    },
    [currentUser, accessRoles]
  );

  const scopedWeddings = useMemo(
    () => visibleProjects(projects, currentUser, accessRoles, 'weddings.view'),
    [projects, currentUser, accessRoles]
  );
  const scopedClients = useMemo(
    () => visibleProjects(projects, currentUser, accessRoles, 'clients.view'),
    [projects, currentUser, accessRoles]
  );
  const scopedShoots = useMemo(
    () => visibleProjects(projects, currentUser, accessRoles, 'shoots.view'),
    [projects, currentUser, accessRoles]
  );

  useEffect(() => {
    if (!currentUser) return;
    if (!canAccessTab(activeTab)) {
      const fallback = (['owner_workspace', 'dashboard', 'roles', 'leads', 'projects', 'shoots'] as TabType[]).find((tab) => canAccessTab(tab));
      if (fallback) setActiveTab(fallback);
    }
  }, [currentUser, activeTab, canAccessTab, setActiveTab]);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectRole, setSelectedProjectRole] = useState<string | undefined>(undefined);
  const [selectedProjectForInvoice, setSelectedProjectForInvoice] = useState<Project | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAllPaymentsModalOpen, setIsAllPaymentsModalOpen] = useState(false);
  const [selectedMemberForModal, setSelectedMemberForModal] = useState<TeamMember | null>(null);

  const handleSelectProject = (project: Project, roleContext?: string) => {
    setSelectedProjectRole(roleContext || currentUser?.role);
    router.push(`/projects/${encodeURIComponent(project.id)}`);
  };

  const routedProjectId = pathname.startsWith('/projects/')
    ? decodeURIComponent(pathname.slice('/projects/'.length))
    : null;
  const routedProject = routedProjectId
    ? projects.find((project) => project.id === routedProjectId) || null
    : null;
  const canOpenRoutedProject = !!(routedProject && canAccessProject(currentUser, accessRoles, routedProject));
  const isNewProjectPage = pathname === '/projects/new';
  const isScheduleShootPage = pathname === '/shoots/schedule';
  const isRecordPaymentPage = pathname === '/payments/new';

  // Status counts for Header & Filters
  const counts = {
    total: scopedWeddings.length,
    running: scopedWeddings.filter((p) => p.status === 'running').length,
    completed: scopedWeddings.filter((p) => p.status === 'completed').length,
    readyToDeliver: scopedWeddings.filter((p) => p.status === 'ready_to_deliver').length,
    pending: scopedWeddings.filter((p) => p.status === 'pending').length,
    urgent: scopedWeddings.filter((p) => p.status === 'urgent').length,
  };

  // Authentication Handlers
  const handleLogin = async (input: LoginInput) => {
    const user = await login(input);
    setShowLoginModal(false);
    
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    void logout();
    setShowLoginModal(false);
  };

  // Handlers
  const canMutateShoots =
    hasPermission(currentUser, accessRoles, 'shoots.create') ||
    hasPermission(currentUser, accessRoles, 'shoots.edit') ||
    hasPermission(currentUser, accessRoles, 'shoots.delete') ||
    hasPermission(currentUser, accessRoles, 'shoots.manage_status') ||
    hasPermission(currentUser, accessRoles, 'shoots.assign_photographer') ||
    hasPermission(currentUser, accessRoles, 'shoots.assign_cinematographer') ||
    hasPermission(currentUser, accessRoles, 'shoots.assign_freelancer');

  const handleSaveProject = async (savedProject: Project) => {
    const exists = projects.some((project) => project.id === savedProject.id);
    if (exists) {
      if (!hasPermission(currentUser, accessRoles, 'weddings.edit') && !hasPermission(currentUser, accessRoles, 'clients.edit')) return;
    } else if (!hasPermission(currentUser, accessRoles, 'weddings.create') && !hasPermission(currentUser, accessRoles, 'clients.create')) {
      return;
    }
    const persisted = await persistStudioProject(savedProject, team);
    setProjects((prev) => {
      const next = prev.filter((project) => project.id !== savedProject.id && project.id !== persisted.id);
      return [persisted, ...next];
    });
    return persisted;
  };

  const handleSaveProjectFromWorkspace = (project: Project) => {
    void handleSaveProject(project).catch((error: unknown) => {
      window.alert(apiErrorMessage(error, 'Unable to save project.'));
    });
  };

  const handleUpdateProject = (updatedProject: Project) => {
    const previous = projects.find((row) => row.id === updatedProject.id);
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    if (!isPersistedProjectId(updatedProject.id)) return;
    const canWriteProject = hasPermission(currentUser, accessRoles, 'weddings.edit');
    if (!canWriteProject && !canMutateShoots) return;
    void (async () => {
      let next = updatedProject;
      if (canWriteProject) next = await persistStudioProject(next, team);
      if (canMutateShoots) next = await persistProjectShoots(next, previous, team);
      setProjects((prev) => prev.map((p) => (p.id === next.id ? next : p)));
    })().catch((error: unknown) => {
      window.alert(apiErrorMessage(error, 'Unable to update shoot.'));
    });
  };

  const dataHandoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleUpdateDataHandover = (updatedProject: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    if (!isPersistedProjectId(updatedProject.id)) return;
    if (!hasAnyPermission(currentUser, accessRoles, ['data.view', 'DATA_MANAGEMENT_VIEW'])) return;
    clearTimeout(dataHandoverTimer.current);
    dataHandoverTimer.current = setTimeout(() => {
      void persistShootDataHandover(updatedProject)
        .then((next) => setProjects((prev) => prev.map((p) => (p.id === next.id ? next : p))))
        .catch((error: unknown) => {
          window.alert(apiErrorMessage(error, 'Unable to save data handover.'));
        });
    }, 400);
  };

  const handleDeleteProject = (projectId: string) => {
    if (!hasPermission(currentUser, accessRoles, 'weddings.delete')) return;
    void projectMutations.remove(projectId)
      .then(() => setProjects((prev) => prev.filter((p) => p.id !== projectId)))
      .catch((error: unknown) => {
        window.alert(apiErrorMessage(error, 'Unable to delete project.'));
      });
  };

  const handleAddTeamMember = async (member: TeamMember, password?: string) => {
    if (!hasPermission(currentUser, accessRoles, 'employees.create')) throw new Error('You do not have permission to create employees.');
    const roleId = member.accessRoleId;
    if (!roleId || !password) throw new Error('Choose an access role and set a temporary password.');
    try {
      const phone = member.phone?.trim();
      const employeeCode = member.employeeId?.trim();
      const profile = {
        employmentType: member.employmentType === 'Part Time' ? 'PART_TIME' as const
          : member.employmentType === 'Contract' ? 'CONTRACT' as const
          : member.employmentType === 'Intern' ? 'INTERN' as const
          : 'FULL_TIME' as const,
        joiningDate: member.joiningDate || undefined,
        monthlySalary: member.monthlySalary ?? 0,
        dailyRate: member.dailyRate ?? 0,
        workLocation: member.attendanceMode === 'WFH' ? 'WFH' as const
          : member.attendanceMode === 'Hybrid' ? 'HYBRID' as const
          : member.attendanceMode === 'Field' ? 'ON_SHOOT' as const
          : 'OFFICE' as const,
        skills: member.skills || [],
        reportingManagerId: member.reportingManagerId || undefined,
      };
      await teamMutations.create({
        fullName: member.name,
        email: member.email?.trim() || '',
        password,
        phone: phone || undefined,
        employeeCode: employeeCode || undefined,
        roleIds: [roleId],
        profile,
      });
    } catch (error) {
      window.alert(apiErrorMessage(error, 'Unable to create employee.'));
      throw error;
    }
  };

  const handleUpdateTeamMember = async (updatedMember: TeamMember) => {
    if (!hasPermission(currentUser, accessRoles, 'employees.edit')) throw new Error('You do not have permission to edit employees.');
    try {
      await teamMutations.update(updatedMember.id, {
        fullName: updatedMember.name, phone: updatedMember.phone, employeeCode: updatedMember.employeeId,
        status: updatedMember.status === 'active' ? 'ACTIVE' : updatedMember.status === 'suspended' ? 'SUSPENDED' : 'INACTIVE',
        profile: {
          employmentType: updatedMember.employmentType === 'Part Time' ? 'PART_TIME'
            : updatedMember.employmentType === 'Contract' ? 'CONTRACT'
            : updatedMember.employmentType === 'Intern' ? 'INTERN'
            : 'FULL_TIME',
          joiningDate: updatedMember.joiningDate || undefined,
          monthlySalary: updatedMember.monthlySalary ?? 0,
          dailyRate: updatedMember.dailyRate ?? 0,
          workLocation: updatedMember.attendanceMode === 'WFH' ? 'WFH'
            : updatedMember.attendanceMode === 'Hybrid' ? 'HYBRID'
            : updatedMember.attendanceMode === 'Field' ? 'ON_SHOOT'
            : 'OFFICE',
          skills: updatedMember.skills || [],
          reportingManagerId: updatedMember.reportingManagerId || undefined,
        },
      });
      if (updatedMember.accessRoleId) await teamMutations.setRoles(updatedMember.id, [updatedMember.accessRoleId]);
    } catch (error) {
      window.alert(apiErrorMessage(error, 'Unable to update employee.'));
      throw error;
    }
  };

  const handleDeleteTeamMember = (memberId: string) => {
    if (!hasPermission(currentUser, accessRoles, 'employees.delete')) return;
    void teamMutations.remove(memberId).catch((error: unknown) => window.alert(error instanceof ApiError ? error.message : 'Unable to remove employee.'));
  };

  const handleRecordAttendance = (record: AttendanceRecord) => {
    setAttendance([record, ...attendance]);
  };

  const handleUpdateAttendance = (records: AttendanceRecord[]) => {
    setAttendance(records);
  };

  const handleAddTask = (task: TeamTask) => {
    void taskMutations.create(taskCreateInput(task)).catch((error: unknown) => {
      window.alert(apiErrorMessage(error, 'Unable to assign task.'));
    });
  };

  const handleUpdateTask = (updatedTask: TeamTask) => {
    void taskMutations.updateStatus(updatedTask.id, taskStatusInput(updatedTask)).catch((error: unknown) => {
      window.alert(apiErrorMessage(error, 'Unable to update task status.'));
    });
  };

  const handleDeleteTask = (taskId: string) => {
    void taskMutations.remove(taskId).catch((error: unknown) => {
      window.alert(apiErrorMessage(error, 'Unable to archive task.'));
    });
  };

  /** Upsert a leave request — new applications and approve/reject reviews. */
  const handleSaveLeave = (leave: LeaveRequest) => {
    setLeaves((prev) => {
      const exists = prev.some((l) => l.id === leave.id);
      return exists ? prev.map((l) => (l.id === leave.id ? leave : l)) : [leave, ...prev];
    });
  };

  // Freelancer Handlers
  const handleSaveFreelancer = (freelancer: Freelancer) => {
    const existing = freelancers.find((f) => f.id === freelancer.id);
    if (existing ? !hasPermission(currentUser, accessRoles, 'freelancers.edit') : !hasPermission(currentUser, accessRoles, 'freelancers.create')) return;
    const merged: Freelancer = existing ? { ...existing, ...freelancer } : freelancer;
    if (existing) {
      setFreelancers(freelancers.map((f) => (f.id === freelancer.id ? merged : f)));
    } else {
      setFreelancers([merged, ...freelancers]);
    }
  };

  const handleDeleteFreelancer = (freelancerId: string) => {
    if (!hasPermission(currentUser, accessRoles, 'freelancers.delete')) return;
    setFreelancers(freelancers.filter((f) => f.id !== freelancerId));
    setFreelancerAssignments(freelancerAssignments.filter((a) => a.freelancerId !== freelancerId));
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    if (!hasAnyPermission(currentUser, accessRoles, ['freelancers.edit', 'freelancers.assign', 'shoots.assign_freelancer'])) return;
    setFreelancerAssignments(freelancerAssignments.filter((a) => a.id !== assignmentId));
  };

  const handleSaveFreelancerAssignments = (newAssignments: FreelancerAssignment[]) => {
    if (!hasAnyPermission(currentUser, accessRoles, ['freelancers.edit', 'freelancers.assign', 'shoots.assign_freelancer'])) return;
    setFreelancerAssignments((prev) => {
      let updated = [...prev];
      newAssignments.forEach((item) => {
        const idx = updated.findIndex((a) => a.id === item.id);
        if (idx >= 0) {
          updated[idx] = item;
        } else {
          updated = [item, ...updated];
        }
      });
      return updated;
    });
  };

  const handleUpdateAssignmentStatus = (
    assignmentId: string,
    status: FreelancerAssignment['assignmentStatus']
  ) => {
    if (!hasAnyPermission(currentUser, accessRoles, ['freelancers.edit', 'freelancers.assign', 'shoots.assign_freelancer'])) return;
    setFreelancerAssignments(
      freelancerAssignments.map((a) => (a.id === assignmentId ? { ...a, assignmentStatus: status } : a))
    );
  };

  const handleSaveFreelancerPayment = (payment: FreelancerPayment) => {
    if (!hasPermission(currentUser, accessRoles, 'freelancers.manage_payments')) return;
    setFreelancerPayments([payment, ...freelancerPayments]);

    if (payment.assignmentId) {
      setFreelancerAssignments(
        freelancerAssignments.map((a) => {
          if (a.id === payment.assignmentId) {
            const newPaid = (a.advancePaid || 0) + payment.amountPaid;
            const newPending = Math.max(0, a.totalAgreedAmount - newPaid);
            const newStatus =
              newPaid >= a.totalAgreedAmount ? 'paid' : newPaid > 0 ? 'partially_paid' : 'unpaid';
            return {
              ...a,
              advancePaid: newPaid,
              pendingAmount: newPending,
              paymentStatus: newStatus,
            };
          }
          return a;
        })
      );
    }

    try {
      const assignment = freelancerAssignments.find((a) => a.id === payment.assignmentId);
      const expenses = expenseService.list();
      if (expenses.some((e) => e.freelancerPaymentId === payment.id)) return;
      const agreed = assignment?.totalAgreedAmount || payment.agreedAmount || payment.amountPaid;
      const now = new Date().toISOString();
      const expense: Expense = {
        id: `EXP-FL-${payment.id}`,
        date: payment.paymentDate,
        category: 'Freelancer',
        subcategory: assignment?.category || 'Freelancer payment',
        description: `${payment.freelancerName} — ${assignment?.projectName || payment.projectName || 'Freelancer production cost'}`,
        amount: agreed,
        paidAmount: payment.amountPaid,
        projectId: assignment?.projectId,
        payee: payment.freelancerName,
        freelancerId: payment.freelancerId,
        freelancerPaymentId: payment.id,
        role: assignment?.role || assignment?.subCategory,
        workDate: assignment?.shootDate || payment.shootDate,
        paymentMethod: (['Cash', 'UPI', 'Bank Transfer'].includes(payment.paymentMethod)
          ? payment.paymentMethod
          : 'Other') as Expense['paymentMethod'],
        paymentStatus: payment.amountPaid >= agreed ? 'Paid' : payment.amountPaid > 0 ? 'Partially Paid' : 'Unpaid',
        approvalStatus: 'Approved',
        addedBy: payment.createdBy || 'Accounts Admin',
        createdAt: now,
        updatedAt: now,
        notes: payment.notes,
        payments: [{ id: `PAY-${payment.id}`, amount: payment.amountPaid, date: payment.paymentDate, method: (['Cash', 'UPI', 'Bank Transfer'].includes(payment.paymentMethod) ? payment.paymentMethod : 'Other') as Expense['paymentMethod'] }],
      };
      expenseService.save([expense, ...expenses]);
    } catch {
      /* expense module unavailable — freelancer ledger still saved */
    }
  };

  const handleSaveFreelancerAttendance = (record: FreelancerAttendance) => {
    setFreelancerAttendance([record, ...freelancerAttendance]);
  };

  const handleUpdateFreelancerAvailability = (
    freelancerId: string,
    status: Freelancer['availabilityStatus']
  ) => {
    if (!hasPermission(currentUser, accessRoles, 'freelancers.edit')) return;
    setFreelancers(
      freelancers.map((f) => (f.id === freelancerId ? { ...f, availabilityStatus: status } : f))
    );
  };

  const handleSaveFreelancerDataReceived = (record: FreelancerDataReceived) => {
    setFreelancerDataReceived([record, ...freelancerDataReceived]);
  };

  const handleUpdateFreelancerDataStatus = (
    dataId: string,
    status: FreelancerDataReceived['dataStatus']
  ) => {
    setFreelancerDataReceived(
      freelancerDataReceived.map((d) => (d.id === dataId ? { ...d, dataStatus: status } : d))
    );
  };

  const handleUpdateFreelancerDocument = (freelancerId: string, doc: FreelancerDocument) => {
    if (!hasPermission(currentUser, accessRoles, 'freelancers.edit')) return;
    setFreelancers(
      freelancers.map((f) => {
        if (f.id === freelancerId) {
          return {
            ...f,
            documents: [...(f.documents || []), doc],
          };
        }
        return f;
      })
    );
  };

  const handleExportData = () => {
    const data = {
      projects,
      team,
      attendance,
      tasks,
      leaves,
      version: '1.0',
      exportedAt: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WPP_CRM_Data_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.projects && Array.isArray(parsed.projects)) {
          setProjects(parsed.projects);
        }
        if (parsed.team && Array.isArray(parsed.team)) {
          setTeam(parsed.team);
        }
        if (parsed.attendance && Array.isArray(parsed.attendance)) {
          setAttendance(parsed.attendance);
        }
        if (parsed.tasks && Array.isArray(parsed.tasks)) {
          setTasks(parsed.tasks);
        }
        if (parsed.leaves && Array.isArray(parsed.leaves)) {
          setLeaves(parsed.leaves);
        }
        alert('✓ CRM Data restored successfully!');
      } catch (err) {
        alert('Invalid JSON file format. Please select a valid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Wait for the persisted browser session before deciding whether login is needed.
  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#2b1b21] text-[#f8e9df]">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#b64b70] border-t-transparent" />
          Restoring your studio session…
        </div>
      </div>
    );
  }

  // Do not mount or expose any admin UI until credentials are validated.
  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onAddTeamMember={handleAddTeamMember}
      />
    );
  }

  return (
    <ToastProvider>
    <PermissionProvider user={currentUser} roles={accessRoles}>
    <div className="h-screen w-full bg-slate-100 flex overflow-hidden font-sans text-slate-800">

      {/* Sidebar Component */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenOnMobile={isMobileSidebarOpen}
        setIsOpenOnMobile={setIsMobileSidebarOpen}
        currentUser={currentUser}
        onLogout={handleLogout}
        canAccessTab={canAccessTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-100">
        
        {/* Top Horizontal Header Bar */}
        <TopHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onOpenAIModal={() => setIsAIModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onExportData={handleExportData}
          onImportData={handleImportData}
          currentUser={currentUser}
          onLogout={handleLogout}
          counts={counts}
        />

        {/* Scrollable Canvas Area */}
        <div className="crm-canvas min-h-0 flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
          {isNewProjectPage ? (
            hasPermission(currentUser, accessRoles, 'weddings.create') ? (
            <ProjectFormModal
              isOpen
              variant="page"
              onClose={() => router.push('/projects')}
              onSave={handleSaveProject}
              existingProject={null}
              team={team}
            />
            ) : (
              <AccessDenied />
            )
          ) : isScheduleShootPage ? (
            hasPermission(currentUser, accessRoles, 'shoots.create') ? (
            <ScheduleShootModal
              isOpen
              variant="page"
              onClose={() => router.push('/dashboard')}
              projects={scopedShoots}
              onUpdateProject={handleUpdateProject}
              team={team}
            />
            ) : (
              <AccessDenied />
            )
          ) : isRecordPaymentPage ? (
            hasPermission(currentUser, accessRoles, 'finance.record_payment') || hasPermission(currentUser, accessRoles, 'finance.view_payments') ? (
            <AllPaymentsModal
              isOpen
              variant="page"
              onClose={() => router.push('/dashboard')}
              projects={scopedWeddings}
              onUpdateProject={handleUpdateProject}
              onSelectProject={handleSelectProject}
            />
            ) : (
              <AccessDenied />
            )
          ) : routedProject ? (
            canOpenRoutedProject ? (
            <ProjectDetailModal
              variant="page"
              project={routedProject}
              onClose={() => {
                setSelectedProjectRole(undefined);
                router.push('/projects');
              }}
              onUpdateProject={hasPermission(currentUser, accessRoles, 'weddings.edit') || canMutateShoots ? handleUpdateProject : () => undefined}
              onGenerateInvoice={(project) => {
                if (hasPermission(currentUser, accessRoles, 'finance.view_invoices')) setSelectedProjectForInvoice(project);
              }}
              onDeleteProject={hasPermission(currentUser, accessRoles, 'weddings.delete') ? handleDeleteProject : undefined}
              team={team}
              currentUser={currentUser}
              userRole={selectedProjectRole || currentUser?.role}
            />
            ) : (
              <AccessDenied />
            )
          ) : (
          <>
          
          {/* Tab 1: Main Dashboard */}
          {activeTab === 'dashboard' && (
              <OwnerDashboard
                projects={scopedWeddings}
                onSelectProject={(project) => handleSelectProject(project)}
                onOpenNewProjectModal={() => {
                  if (hasPermission(currentUser, accessRoles, 'weddings.create')) router.push('/projects/new');
                }}
                onUpdateProject={hasPermission(currentUser, accessRoles, 'weddings.edit') || canMutateShoots ? handleUpdateProject : () => undefined}
                onOpenAllPaymentsModal={() => {
                  if (hasPermission(currentUser, accessRoles, 'finance.view_payments') || hasPermission(currentUser, accessRoles, 'finance.record_payment')) {
                    router.push('/payments/new');
                  }
                }}
                setActiveTab={setActiveTab}
                onProjectStatusNavigate={(status) => {
                  setStatusFilter(status);
                  setActiveTab('projects');
                }}
                team={team}
                attendance={attendance}
                tasks={tasks}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onAddTask={handleAddTask}
                onOpenMemberModal={(member) => setSelectedMemberForModal(member)}
                currentUser={currentUser}
                summary={summaryQuery.data}
                projectsPending={!secondaryReady || projectQuery.loading}
                teamPending={!secondaryReady || teamQuery.loading}
                attendanceSlot={currentUser && isEmployeeAttendanceUser(currentUser) ? (
                  <EmployeeDashboardTasks
                    userId={currentUser.id}
                    tasks={tasks}
                    canUpdate={hasPermission(currentUser, accessRoles, 'tasks.change_status')}
                    onUpdate={handleUpdateTask}
                    showAttendance={hasPermission(currentUser, accessRoles, 'attendance.mark')}
                    canViewAttendance={hasPermission(currentUser, accessRoles, 'attendance.view')}
                  />
                ) : undefined}
              />
          )}

          {activeTab === 'owner_workspace' && (
            <OwnerWorkspace
              projects={projects}
              activeTeamMembers={team}
            />
          )}

          {activeTab === 'equipment' && currentUser?.role === 'Owner' && (
            <EquipmentInventory />
          )}

          {/* Leads & Inquiries Management (Visible ONLY to Owner, Manager, and Sales) */}
          {activeTab === 'leads' && (
            hasPermission(currentUser, accessRoles, 'leads.view') ? (
              <LeadsManagement currentUser={currentUser} />
            ) : (
              <AccessDenied />
            )
          )}

          {/* Tab 2: Role Workspaces & Distinct Dashboards */}
          {activeTab === 'roles' && (
            <RoleWorkspaceHub
              team={team}
              projects={projects}
              attendance={attendance}
              tasks={tasks}
              payments={freelancerPayments}
              onUpdateTeamMember={handleUpdateTeamMember}
              onRecordAttendance={handleRecordAttendance}
              onUpdateAttendance={handleUpdateAttendance}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onSelectProject={(project, role) => handleSelectProject(project, role)}
              onOpenNewProjectModal={() => {
                if (!hasPermission(currentUser, accessRoles, 'weddings.create')) return;
                setEditingProject(null);
                setIsFormModalOpen(true);
              }}
              onSaveProject={handleSaveProjectFromWorkspace}
              onOpenAllPaymentsModal={() => {
                if (hasPermission(currentUser, accessRoles, 'finance.view_payments')) setIsAllPaymentsModalOpen(true);
              }}
              setActiveTab={setActiveTab}
              currentUser={currentUser}
            />
          )}

          {/* Tab 2: Projects / Client Project Management */}
          {activeTab === 'projects' && (
            <ProjectsManager projects={scopedWeddings} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onSelectProject={(project) => handleSelectProject(project, currentUser?.role)} onUpdateProject={handleUpdateProject} onEditProject={(project) => { if (!hasPermission(currentUser, accessRoles, 'weddings.edit')) return; setEditingProject(project); setIsFormModalOpen(true); }} onDeleteProject={hasPermission(currentUser, accessRoles, 'weddings.delete') ? handleDeleteProject : undefined} onOpenNewProjectModal={() => { if (!hasPermission(currentUser, accessRoles, 'weddings.create')) return; setEditingProject(null); setIsFormModalOpen(true); }} onOpenAllPaymentsModal={() => { if (hasPermission(currentUser, accessRoles, 'finance.view_payments')) setIsAllPaymentsModalOpen(true); }} onGenerateInvoice={(project) => { if (hasPermission(currentUser, accessRoles, 'finance.view_invoices')) setSelectedProjectForInvoice(project); }} currentUser={currentUser} userRole={currentUser?.role} />
          )}

          {/* Tab 3: Shoot Management */}
          {activeTab === 'shoots' && (
            hasPermission(currentUser, accessRoles, 'shoots.view') ? (
            <ShootManagement
              projects={scopedShoots}
              onUpdateProject={handleUpdateProject}
              onSelectProject={(project) => handleSelectProject(project)}
              team={team}
            />
            ) : (
              <AccessDenied />
            )
          )}

          {activeTab === 'expenses' && (
            hasAnyPermission(currentUser, accessRoles, TAB_PERMISSIONS.expenses || 'EXPENSE_VIEW') ? (
            <ExpenseManagement
              projects={scopedWeddings}
              freelancers={freelancers.map((freelancer) => ({ id: freelancer.id, name: freelancer.name, role: freelancer.mainCategory }))}
              currentUser={currentUser}
            />
            ) : (
              <AccessDenied />
            )
          )}

          {/* Tab 4: Data Management */}
          {activeTab === 'data' && (
            hasAnyPermission(currentUser, accessRoles, ['data.view', 'DATA_MANAGEMENT_VIEW']) ? (
              <DataManagement
                projects={projects}
                onUpdateProject={handleUpdateDataHandover}
                onSelectProject={(project) => handleSelectProject(project)}
              />
            ) : (
              <AccessDenied />
            )
          )}

          {/* Tab 5: Team & Attendance */}
          {activeTab === 'team' && (
            hasAnyPermission(currentUser, accessRoles, TAB_PERMISSIONS.team || 'employees.view') ? (
              <TeamAttendance
                team={team}
                attendance={attendance}
                projects={scopedWeddings}
                tasks={tasks}
                onAddTeamMember={handleAddTeamMember}
                onUpdateTeamMember={handleUpdateTeamMember}
                onDeleteTeamMember={handleDeleteTeamMember}
                onReorderTeam={(newTeam) => setTeam(newTeam)}
                onRecordAttendance={handleRecordAttendance}
                onUpdateAttendance={handleUpdateAttendance}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                leaves={leaves}
                onSaveLeave={handleSaveLeave}
                onUpdateProject={handleUpdateProject}
                freelancers={freelancers}
                freelancerAssignments={freelancerAssignments}
                freelancerPayments={freelancerPayments}
                currentUser={currentUser}
                onNavigateToFreelancers={() => setActiveTab('freelancers')}
                accessRoles={effectiveAccessRoles}
                accessPermissions={backendPermissionModules}
              />
            ) : (
              <AccessDenied />
            )
          )}

          {/* Tab 6: Deliveries */}
          {activeTab === 'deliveries' && (
            <DeliveriesManager
              projects={scopedWeddings}
              onUpdateProject={handleUpdateProject}
              onSelectProject={(project) => handleSelectProject(project)}
            />
          )}

          {/* Tab 7: Freelancer Team Module */}
          {activeTab === 'freelancers' && (
            <FreelancerTeamManager
              freelancers={freelancers}
              categories={freelancerCategories}
              assignments={freelancerAssignments}
              payments={freelancerPayments}
              attendanceRecords={freelancerAttendance}
              dataReceivedList={freelancerDataReceived}
              activityLogs={freelancerActivityLogs}
              projects={projects}
              focusDate={freelancerFocus?.date}
              focusProjectId={freelancerFocus?.projectId}
              focusShootId={freelancerFocus?.shootId}
              onSaveFreelancer={handleSaveFreelancer}
              onSaveCategories={(next) => {
                if (!hasPermission(currentUser, accessRoles, 'freelancers.edit')) return;
                setFreelancerCategories(next);
              }}
              onSaveAssignments={handleSaveFreelancerAssignments}
              onUpdateAssignmentStatus={handleUpdateAssignmentStatus}
              onSavePayment={handleSaveFreelancerPayment}
              onSaveAttendance={handleSaveFreelancerAttendance}
              onUpdateAvailability={handleUpdateFreelancerAvailability}
              onSaveDataReceived={handleSaveFreelancerDataReceived}
              onUpdateDataStatus={handleUpdateFreelancerDataStatus}
              onUpdateDocument={handleUpdateFreelancerDocument}
              onDeleteFreelancer={handleDeleteFreelancer}
              onDeleteAssignment={handleDeleteAssignment}
            />
          )}

          {activeTab === 'access' && (
            hasPermission(currentUser, accessRoles, 'ROLE_VIEW') ? (
              <RolesPermissionsManager
                roles={effectiveAccessRoles}
                team={team}
                currentUserName={currentUser?.name || 'Admin'}
                permissions={backendPermissionModules}
                onCreateRole={async (input) => {
                  await rbacApi.createRole({
                    name: input.name,
                    description: input.description,
                    status: input.status === 'inactive' ? 'INACTIVE' : 'ACTIVE',
                    permissionKeys: input.permissionKeys,
                  });
                  await rbacQuery.refresh();
                }}
                onUpdateRole={async (input) => {
                  const status = input.status === 'inactive' ? 'INACTIVE' : 'ACTIVE';
                  const before = rbacQuery.roles.find((role) => role.id === input.id);
                  // Most saves only touch checkboxes, so skip the metadata write
                  // unless the name, description or status actually moved.
                  const metaChanged =
                    !before ||
                    before.name !== input.name ||
                    (before.description ?? '') !== (input.description ?? '') ||
                    before.status !== status;
                  if (metaChanged) {
                    await rbacApi.updateRole(input.id, {
                      name: input.name,
                      description: input.description,
                      status,
                    });
                  }
                  await rbacApi.setRolePermissions(input.id, input.permissionKeys);
                  // The editor may have changed the actor's own permissions, so
                  // reload both, in parallel.
                  await Promise.all([rbacQuery.refresh(), refresh(true)]);
                }}
                onDeleteRole={async (id) => { await rbacApi.removeRole(id); await rbacQuery.refresh(); }}
                onLoadAudit={canViewAudit ? loadRoleAudit : undefined}
                onLoadRoleUsers={(roleId) => rbacApi.roleUsers(roleId)}
                onAssignUserRole={async (userId, roleId) => {
                  await teamMutations.setRoles(userId, [roleId]);
                  await rbacQuery.refresh();
                }}
                onCreatePersonalRole={async ({ source, userId, userName }) => {
                  // Clone the source role's permissions into a personal role so
                  // this employee can diverge without affecting colleagues.
                  const created = await rbacApi.createRole({
                    name: `${userName} — ${source.name}`.slice(0, 64),
                    description: `Personal access for ${userName}, based on ${source.name}.`,
                    status: 'ACTIVE',
                    // Pins the role to this employee, which keeps it out of
                    // everyone else's role list.
                    personalForUserId: userId,
                    permissionKeys: Object.entries(source.grants)
                      .filter(([, grant]) => grant.enabled)
                      .map(([key]) => key),
                  });
                  await teamMutations.setRoles(userId, [created.id]);
                  await rbacQuery.refresh();
                  return created.id;
                }}
                capabilities={{
                  create: hasPermission(currentUser, accessRoles, 'ROLE_CREATE'),
                  update: hasPermission(currentUser, accessRoles, 'ROLE_UPDATE'),
                  assignPermissions: hasPermission(currentUser, accessRoles, 'PERMISSION_ASSIGN'),
                  remove: hasPermission(currentUser, accessRoles, 'ROLE_DELETE'),
                }}
              />
            ) : (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto border border-slate-200 shadow-xl space-y-5 my-12">
                <h3 className="text-2xl font-black text-slate-900">Roles Restricted</h3>
                <p className="text-sm text-slate-500 font-medium">Only users with Manage Roles permission can open this desk.</p>
              </div>
            )
          )}

          {activeTab === 'clients' && (
            hasPermission(currentUser, accessRoles, 'clients.view') ? (
            <ClientsDirectoryView projects={scopedClients} onOpenClient={(project) => handleSelectProject(project, currentUser?.role)} onAddClient={() => { if (!hasPermission(currentUser, accessRoles, 'clients.create')) return; setEditingProject(null); setIsFormModalOpen(true); }} />
            ) : (
              <AccessDenied />
            )
          )}

          </>
          )}

        </div>

        {/* High Density Status Bar Footer */}
        <footer className="h-8 bg-slate-800 text-slate-400 flex items-center px-4 text-[10px] justify-between uppercase font-mono tracking-wider flex-shrink-0 z-10 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <span>STUDIO LOGGED IN: {currentUser?.name.toUpperCase()} ({currentUser?.role.toUpperCase()})</span>
            <span className="text-slate-600">|</span>
            <span>WPP CRM v2.5</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-indigo-300 font-bold">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              SYSTEM LIVE
            </span>
          </div>
        </footer>

      </main>

      {/* Modals */}
      
      {/* Switch Account / Role Login Modal */}
      {showLoginModal && (
        <LoginScreen
          onLogin={handleLogin}
          onAddTeamMember={handleAddTeamMember}
          onClose={() => setShowLoginModal(false)}
        />
      )}
      
      {/* Add / Edit Project Form Modal */}
      {isFormModalOpen && (hasPermission(currentUser, accessRoles, editingProject ? 'weddings.edit' : 'weddings.create') || hasPermission(currentUser, accessRoles, 'clients.create')) && (
        <ProjectFormModal
          isOpen
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingProject(null);
          }}
          onSave={handleSaveProject}
          existingProject={editingProject}
          team={team}
        />
      )}

      {/* Invoice / Quotation Receipt Modal */}
      {selectedProjectForInvoice && hasPermission(currentUser, accessRoles, 'finance.view_invoices') && (
        <InvoiceModal
          project={selectedProjectForInvoice}
          onClose={() => setSelectedProjectForInvoice(null)}
        />
      )}

      {/* AI Suggestions Modal */}
      {isAIModalOpen && (
        <AISuggestionsModal isOpen onClose={() => setIsAIModalOpen(false)} />
      )}

      {/* All Client Payments & Revenue Audit Modal */}
      {isAllPaymentsModalOpen && hasPermission(currentUser, accessRoles, 'finance.view_payments') && (
        <AllPaymentsModal
          isOpen
          onClose={() => setIsAllPaymentsModalOpen(false)}
          projects={scopedWeddings}
          onUpdateProject={handleUpdateProject}
          onSelectProject={(project) => {
            setIsAllPaymentsModalOpen(false);
            handleSelectProject(project);
          }}
        />
      )}

      {/* Individual Team Member Dashboard (opened from the Dashboard's Team Activity widget) */}
      {selectedMemberForModal && (
        <MemberDashboardModal
          member={selectedMemberForModal}
          attendance={attendance}
          tasks={tasks}
          projects={projects}
          onClose={() => setSelectedMemberForModal(null)}
          onUpdateTeamMember={(updated) => {
            handleUpdateTeamMember(updated);
            setSelectedMemberForModal(updated);
          }}
          onRecordAttendance={handleRecordAttendance}
          onUpdateAttendance={handleUpdateAttendance}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

    </div>
    </PermissionProvider>
    </ToastProvider>
  );
}
