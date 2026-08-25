'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { useProjects } from '@/hooks/useProjects';
import { useTeam, useTeamMutation } from '@/hooks/useTeam';
import { useAttendance } from '@/hooks/useAttendance';
import { useTaskMutations, useTasks } from '@/hooks/useTasks';
import { useRbac } from '@/hooks/useRbac';
import { normalizeTeamMember } from '@/features/team/teamViewModel';
import { normalizeAttendance } from '@/features/attendance/attendanceViewModel';
import { ApiError } from '@/lib/api/client';
import { rbacApi } from '@/lib/api/rbac';
import { normalizeProject } from '@/features/projects/projectViewModel';
import { normalizeTask, taskCreateInput, taskStatusInput } from '@/features/tasks/taskViewModel';
import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import { AISuggestionsModal } from '@/components/ai/AISuggestionsModal';
import { OwnerDashboard } from '@/features/dashboard';
import { OwnerWorkspace } from '@/features/owner';
import { EquipmentInventory } from '@/features/equipment';
import { LeadsManagement } from '@/features/leads';
import { RoleWorkspaceHub, canAccessProject, visibleProjects } from '@/features/workspaces';
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
import {
  hasAnyPermission,
  hasPermission,
  PermissionProvider,
  RolesPermissionsManager,
  TAB_PERMISSIONS,
} from '@/features/access';
import { ExpenseManagement } from '@/features/expenses';
import { expenseService } from '@/features/expenses/services/expenseService';
import type { Expense } from '@/features/expenses/types';
import { Lock, ShieldAlert, ShieldCheck, ArrowRight } from 'lucide-react';
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
  const { currentUser, isHydrated, login, logout } = useAuthSession();

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // CRM entities are intentionally not restored from browser storage. They will
  // be supplied by feature API queries during the next integration phase.
  const [projects, setProjects] = useState<Project[]>([]);
  const projectQuery = useProjects(
    { page: 1, limit: 50 },
    Boolean(currentUser) && (pathname === '/projects' || pathname.startsWith('/projects/')),
  );

  useEffect(() => {
    if (!currentUser || projectQuery.loading || projectQuery.error) return;
    setProjects(projectQuery.data.map(normalizeProject));
  }, [currentUser, projectQuery.data, projectQuery.error, projectQuery.loading]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const canManageTeamAttendance = Boolean(currentUser?.permissions?.includes('TEAM_VIEW') || currentUser?.permissions?.includes('ATTENDANCE_MANAGE'));
  const shouldLoadTeam = Boolean(currentUser) && (
    pathname === '/team' || pathname.startsWith('/team/') || (pathname === '/dashboard' && canManageTeamAttendance)
  );
  const teamQuery = useTeam(
    { page: 1, limit: 100 },
    shouldLoadTeam,
  );
  const teamMutations = useTeamMutation(teamQuery.refresh);
  const rbacQuery = useRbac(
    Boolean(currentUser) && (pathname === '/team' || pathname === '/roles-permissions'),
  );

  useEffect(() => {
    if (!currentUser || teamQuery.loading || teamQuery.error) return;
    setTeam(teamQuery.data.map(normalizeTeamMember));
  }, [currentUser, teamQuery.data, teamQuery.error, teamQuery.loading]);

  const attendanceQuery = useAttendance(
    { page: 1, limit: 100 },
    Boolean(currentUser) && canManageTeamAttendance && (pathname === '/dashboard' || pathname === '/team'),
  );

  useEffect(() => {
    if (!currentUser || attendanceQuery.loading || attendanceQuery.error) return;
    setAttendance(attendanceQuery.data.map(normalizeAttendance));
  }, [attendanceQuery.data, attendanceQuery.error, attendanceQuery.loading, currentUser]);

  const canViewTasks = Boolean(currentUser?.permissions?.includes('TASK_VIEW'));
  const canManageTasks = Boolean(
    currentUser?.permissions?.includes('TASK_ASSIGN') || currentUser?.permissions?.includes('TASK_CREATE'),
  );
  const shouldLoadTasks = Boolean(currentUser) && canViewTasks && (
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
    status: 'active' as const,
    grants: Object.fromEntries(role.rolePermissions.map(({ permission }) => [permission.key, { enabled: true }])),
    createdAt: role.createdAt.slice(0, 10),
    updatedAt: role.updatedAt.slice(0, 10),
  })), [rbacQuery.roles]);
  // Role IDs used by employee creation must always come from the backend.
  // Do not fall back to the retired browser-persisted role catalogue.
  const effectiveAccessRoles = backendAccessRoles;
  const backendPermissionModules = useMemo(() => {
    const modules = new Map<string, { id: string; label: string; description: string; permissions: Array<{ key: string; label: string; description?: string; sensitive?: boolean }> }>();
    rbacQuery.permissions.forEach((permission) => {
      const current = modules.get(permission.module) ?? { id: permission.module, label: permission.module, description: 'Backend permission group', permissions: [] };
      current.permissions.push({ key: permission.key, label: permission.label, description: permission.description ?? undefined, sensitive: permission.isSensitive });
      modules.set(permission.module, current);
    });
    return [...modules.values()];
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
      if (tab === 'owner_workspace' || tab === 'equipment') {
        return currentUser?.role === 'Owner';
      }
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
    if (currentUser.role === 'Owner' && activeTab === 'roles') {
      setActiveTab('owner_workspace');
      return;
    }
    if (!canAccessTab(activeTab)) {
      const fallback = (['roles', 'dashboard', 'leads', 'projects', 'shoots'] as TabType[]).find((tab) => canAccessTab(tab));
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
    
    if (user.role === 'Owner') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('roles');
    }
  };

  const handleLogout = () => {
    void logout();
    setShowLoginModal(false);
  };

  // Handlers
  const handleSaveProject = (savedProject: Project) => {
    const exists = projects.some((p) => p.id === savedProject.id);
    if (exists) {
      setProjects(projects.map((p) => (p.id === savedProject.id ? savedProject : p)));
    } else {
      setProjects([savedProject, ...projects]);
    }
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter((p) => p.id !== projectId));
  };

  const handleAddTeamMember = async (member: TeamMember, password?: string) => {
    const roleId = member.accessRoleId;
    if (!roleId || !password) throw new Error('Choose an access role and set a temporary password.');
    try {
      const phone = member.phone?.trim();
      const employeeCode = member.employeeId?.trim();
      await teamMutations.create({
        fullName: member.name,
        email: member.email?.trim() || '',
        password,
        phone: phone || undefined,
        employeeCode: employeeCode || undefined,
        roleIds: [roleId],
      });
    } catch (error) {
      window.alert(apiErrorMessage(error, 'Unable to create employee.'));
      throw error;
    }
  };

  const handleUpdateTeamMember = async (updatedMember: TeamMember) => {
    try {
      await teamMutations.update(updatedMember.id, {
        fullName: updatedMember.name, phone: updatedMember.phone, employeeCode: updatedMember.employeeId,
        status: updatedMember.status === 'active' ? 'ACTIVE' : updatedMember.status === 'suspended' ? 'SUSPENDED' : 'INACTIVE',
      });
      if (updatedMember.accessRoleId) await teamMutations.setRoles(updatedMember.id, [updatedMember.accessRoleId]);
    } catch (error) {
      window.alert(apiErrorMessage(error, 'Unable to update employee.'));
      throw error;
    }
  };

  const handleDeleteTeamMember = (memberId: string) => {
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
    const merged: Freelancer = existing ? { ...existing, ...freelancer } : freelancer;
    if (existing) {
      setFreelancers(freelancers.map((f) => (f.id === freelancer.id ? merged : f)));
    } else {
      setFreelancers([merged, ...freelancers]);
    }
  };

  const handleDeleteFreelancer = (freelancerId: string) => {
    setFreelancers(freelancers.filter((f) => f.id !== freelancerId));
    setFreelancerAssignments(freelancerAssignments.filter((a) => a.freelancerId !== freelancerId));
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    setFreelancerAssignments(freelancerAssignments.filter((a) => a.id !== assignmentId));
  };

  const handleSaveFreelancerAssignments = (newAssignments: FreelancerAssignment[]) => {
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
    setFreelancerAssignments(
      freelancerAssignments.map((a) => (a.id === assignmentId ? { ...a, assignmentStatus: status } : a))
    );
  };

  const handleSaveFreelancerPayment = (payment: FreelancerPayment) => {
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
              onUpdateProject={hasPermission(currentUser, accessRoles, 'weddings.edit') ? handleUpdateProject : () => undefined}
              onGenerateInvoice={(project) => {
                if (hasPermission(currentUser, accessRoles, 'finance.view_invoices')) setSelectedProjectForInvoice(project);
              }}
              onDeleteProject={hasPermission(currentUser, accessRoles, 'weddings.delete') ? handleDeleteProject : () => undefined}
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
                onUpdateProject={hasPermission(currentUser, accessRoles, 'weddings.edit') ? handleUpdateProject : () => undefined}
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
                attendanceSlot={currentUser && isEmployeeAttendanceUser(currentUser) && hasPermission(currentUser, accessRoles, 'tasks.view') ? (
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

          {/* Exclusive Owner Workspace (Visible ONLY to Owner) */}
          {activeTab === 'owner_workspace' && currentUser?.role === 'Owner' && (
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
            <LeadsManagement currentUser={currentUser} />
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
              onSaveProject={handleSaveProject}
              onOpenAllPaymentsModal={() => {
                if (hasPermission(currentUser, accessRoles, 'finance.view_payments')) setIsAllPaymentsModalOpen(true);
              }}
              setActiveTab={setActiveTab}
              currentUser={currentUser}
            />
          )}

          {/* Tab 2: Projects / Client Project Management */}
          {activeTab === 'projects' && (
            <ProjectsManager projects={scopedWeddings} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onSelectProject={(project) => handleSelectProject(project, currentUser?.role)} onUpdateProject={handleUpdateProject} onEditProject={(project) => { if (!hasPermission(currentUser, accessRoles, 'weddings.edit')) return; setEditingProject(project); setIsFormModalOpen(true); }} onDeleteProject={hasPermission(currentUser, accessRoles, 'weddings.delete') ? handleDeleteProject : () => undefined} onOpenNewProjectModal={() => { if (!hasPermission(currentUser, accessRoles, 'weddings.create')) return; setEditingProject(null); setIsFormModalOpen(true); }} onOpenAllPaymentsModal={() => { if (hasPermission(currentUser, accessRoles, 'finance.view_payments')) setIsAllPaymentsModalOpen(true); }} onGenerateInvoice={(project) => { if (hasPermission(currentUser, accessRoles, 'finance.view_invoices')) setSelectedProjectForInvoice(project); }} currentUser={currentUser} userRole={currentUser?.role} />
          )}

          {/* Tab 3: Shoot Management */}
          {activeTab === 'shoots' && (
            <ShootManagement
              projects={scopedShoots}
              onUpdateProject={handleUpdateProject}
              onSelectProject={(project) => handleSelectProject(project)}
              team={team}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseManagement
              projects={scopedWeddings}
              freelancers={freelancers.map((freelancer) => ({ id: freelancer.id, name: freelancer.name, role: freelancer.mainCategory }))}
              currentUser={currentUser}
            />
          )}

          {/* Tab 4: Data Management */}
          {activeTab === 'data' && (
            hasPermission(currentUser, accessRoles, 'settings.view') ? (
              <DataManagement
                projects={scopedWeddings}
                onUpdateProject={handleUpdateProject}
                onSelectProject={(project) => handleSelectProject(project)}
              />
            ) : (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto border border-slate-200 shadow-xl space-y-5 my-12">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Data Management Restricted</h3>
                  <p className="text-sm text-slate-500 mt-2 font-medium">
                    Hard Drive vault backups, RAW offloading logs, and client data deletion are reserved for <strong>Owner</strong> & <strong>Studio Manager</strong>.
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setActiveTab('roles')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider"
                  >
                    Return to My Workspace
                  </button>
                </div>
              </div>
            )
          )}

          {/* Tab 5: Team & Attendance */}
          {activeTab === 'team' && (
            hasPermission(currentUser, accessRoles, 'employees.view') ? (
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
              />
            ) : (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto border border-slate-200 shadow-xl space-y-5 my-12">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Payroll & Roster Restricted</h3>
                  <p className="text-sm text-slate-500 mt-2 font-medium">
                    Team member salaries, payroll slips, and studio roster configurations are accessible to <strong>Owner</strong> & <strong>Studio Manager</strong> only.
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setActiveTab('roles')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider"
                  >
                    Return to My Workspace
                  </button>
                </div>
              </div>
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
              onSaveCategories={setFreelancerCategories}
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
            hasPermission(currentUser, accessRoles, 'settings.manage_roles') ? (
              <RolesPermissionsManager
                roles={effectiveAccessRoles}
                audit={[]}
                team={team}
                currentUserName={currentUser?.name || 'Admin'}
                permissions={backendPermissionModules}
                onCreateRole={async (input) => { await rbacApi.createRole(input); await rbacQuery.refresh(); }}
                onUpdateRole={async (input) => { await rbacApi.updateRole(input.id, { name: input.name, description: input.description }); await rbacApi.setRolePermissions(input.id, input.permissionKeys); await rbacQuery.refresh(); }}
                onDeleteRole={async (id) => { await rbacApi.removeRole(id); await rbacQuery.refresh(); }}
              />
            ) : (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto border border-slate-200 shadow-xl space-y-5 my-12">
                <h3 className="text-2xl font-black text-slate-900">Roles Restricted</h3>
                <p className="text-sm text-slate-500 font-medium">Only users with Manage Roles permission can open this desk.</p>
              </div>
            )
          )}

          {activeTab === 'clients' && (
            <ClientsDirectoryView projects={scopedClients} onOpenClient={(project) => handleSelectProject(project, currentUser?.role)} onAddClient={() => { if (!hasPermission(currentUser, accessRoles, 'clients.create') && !hasPermission(currentUser, accessRoles, 'weddings.create')) return; setEditingProject(null); setIsFormModalOpen(true); }} />
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
