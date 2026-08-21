'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  FreelancerDocument
} from '@/types';
import { INITIAL_PROJECTS, INITIAL_TEAM, INITIAL_ATTENDANCE, INITIAL_TASKS } from '@/data/mockData';
import { 
  INITIAL_FREELANCER_CATEGORIES, 
  INITIAL_FREELANCERS, 
  INITIAL_FREELANCER_ASSIGNMENTS, 
  INITIAL_FREELANCER_PAYMENTS, 
  INITIAL_FREELANCER_ATTENDANCE, 
  INITIAL_FREELANCER_DATA_RECEIVED, 
  INITIAL_FREELANCER_LOGS 
} from '@/data/mockFreelancers';

import { Sidebar, TopHeader, TabType } from '@/components/layout';
import { LoginScreen, OWNER_USER } from '@/components/auth/LoginScreen';
import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import { AISuggestionsModal } from '@/components/ai/AISuggestionsModal';
import { OwnerDashboard } from '@/features/dashboard';
import { OwnerWorkspace } from '@/features/owner';
import { LeadsManagement } from '@/features/leads';
import { RoleDashboards } from '@/features/workspaces';
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
import { DeliveriesManager } from '@/features/deliveries';
import { FreelancerTeamManager } from '@/features/freelancers';
import { Lock, ShieldAlert, ShieldCheck, ArrowRight } from 'lucide-react';
import { ToastProvider } from '@/components/common';

const TAB_ROUTES: Record<TabType, string> = {
  dashboard: '/dashboard',
  owner_workspace: '/owner-workspace',
  roles: '/workspaces',
  leads: '/leads',
  projects: '/projects',
  shoots: '/shoots',
  data: '/data-management',
  team: '/team',
  freelancers: '/freelancers',
  deliveries: '/deliveries',
};

const ROUTE_TABS = Object.fromEntries(
  Object.entries(TAB_ROUTES).map(([tab, route]) => [route, tab])
) as Record<string, TabType>;

export default function App() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isHydrated, login, logout } = useAuthSession();

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  const isFullAdmin = currentUser?.role === 'Owner' || currentUser?.role === 'Studio Manager' || currentUser?.role === 'Manager' || currentUser?.role === 'Account Manager';

  // Load initial state with localStorage persistence
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('wpp_crm_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [team, setTeam] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('wpp_crm_team');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_TEAM;
      }
    }
    return INITIAL_TEAM;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('wpp_crm_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [tasks, setTasks] = useState<TeamTask[]>(() => {
    const saved = localStorage.getItem('wpp_crm_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_TASKS;
      }
    }
    return INITIAL_TASKS;
  });

  // Freelancer Module Persistent States
  const [freelancerCategories, setFreelancerCategories] = useState<FreelancerCategory[]>(() => {
    const saved = localStorage.getItem('wpp_crm_freelancer_categories');
    if (saved) {
      try {
        const parsed: FreelancerCategory[] = JSON.parse(saved);
        const names = parsed.map((c) => c.name);
        if (!names.includes('Videographer') || !names.includes('Assistant') || !names.includes('Other')) {
          return INITIAL_FREELANCER_CATEGORIES;
        }
        return parsed;
      } catch (e) {
        return INITIAL_FREELANCER_CATEGORIES;
      }
    }
    return INITIAL_FREELANCER_CATEGORIES;
  });

  const [freelancers, setFreelancers] = useState<Freelancer[]>(() => {
    try {
      const saved = localStorage.getItem('wpp_crm_freelancers');
      let list: Freelancer[] = saved ? JSON.parse(saved) : INITIAL_FREELANCERS;
      if (!Array.isArray(list)) list = INITIAL_FREELANCERS;
      return list.map((f) => {
        if (!f) return f;
        let main = f.mainCategory;
        if (main === 'Cinematographer') main = 'Videographer';
        if (main === 'Support & On-Location') main = 'Assistant';
        return { ...f, mainCategory: main };
      }).filter(Boolean);
    } catch (e) {
      return INITIAL_FREELANCERS;
    }
  });

  const [freelancerAssignments, setFreelancerAssignments] = useState<FreelancerAssignment[]>(() => {
    try {
      const saved = localStorage.getItem('wpp_crm_freelancer_assignments');
      const list = saved ? JSON.parse(saved) : INITIAL_FREELANCER_ASSIGNMENTS;
      return Array.isArray(list) ? list : INITIAL_FREELANCER_ASSIGNMENTS;
    } catch (e) {
      return INITIAL_FREELANCER_ASSIGNMENTS;
    }
  });

  const [freelancerPayments, setFreelancerPayments] = useState<FreelancerPayment[]>(() => {
    try {
      const saved = localStorage.getItem('wpp_crm_freelancer_payments');
      const list = saved ? JSON.parse(saved) : INITIAL_FREELANCER_PAYMENTS;
      return Array.isArray(list) ? list : INITIAL_FREELANCER_PAYMENTS;
    } catch (e) {
      return INITIAL_FREELANCER_PAYMENTS;
    }
  });

  const [freelancerAttendance, setFreelancerAttendance] = useState<FreelancerAttendance[]>(() => {
    try {
      const saved = localStorage.getItem('wpp_crm_freelancer_attendance');
      const list = saved ? JSON.parse(saved) : INITIAL_FREELANCER_ATTENDANCE;
      return Array.isArray(list) ? list : INITIAL_FREELANCER_ATTENDANCE;
    } catch (e) {
      return INITIAL_FREELANCER_ATTENDANCE;
    }
  });

  const [freelancerDataReceived, setFreelancerDataReceived] = useState<FreelancerDataReceived[]>(() => {
    try {
      const saved = localStorage.getItem('wpp_crm_freelancer_data_received');
      const list = saved ? JSON.parse(saved) : INITIAL_FREELANCER_DATA_RECEIVED;
      return Array.isArray(list) ? list : INITIAL_FREELANCER_DATA_RECEIVED;
    } catch (e) {
      return INITIAL_FREELANCER_DATA_RECEIVED;
    }
  });

  const [freelancerActivityLogs, setFreelancerActivityLogs] = useState<FreelancerActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem('wpp_crm_freelancer_logs');
      const list = saved ? JSON.parse(saved) : INITIAL_FREELANCER_LOGS;
      return Array.isArray(list) ? list : INITIAL_FREELANCER_LOGS;
    } catch (e) {
      return INITIAL_FREELANCER_LOGS;
    }
  });

  // Sync state to localStorage on changes
  useEffect(() => {
    localStorage.setItem('wpp_crm_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('wpp_crm_team', JSON.stringify(team));
  }, [team]);

  useEffect(() => {
    localStorage.setItem('wpp_crm_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('wpp_crm_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('wpp_crm_freelancer_categories', JSON.stringify(freelancerCategories));
  }, [freelancerCategories]);

  useEffect(() => {
    localStorage.setItem('wpp_crm_freelancers', JSON.stringify(freelancers));
  }, [freelancers]);

  useEffect(() => {
    localStorage.setItem('wpp_crm_freelancer_assignments', JSON.stringify(freelancerAssignments));
  }, [freelancerAssignments]);

  useEffect(() => {
    localStorage.setItem('wpp_crm_freelancer_payments', JSON.stringify(freelancerPayments));
  }, [freelancerPayments]);

  useEffect(() => {
    localStorage.setItem('wpp_crm_freelancer_attendance', JSON.stringify(freelancerAttendance));
  }, [freelancerAttendance]);

  useEffect(() => {
    localStorage.setItem('wpp_crm_freelancer_data_received', JSON.stringify(freelancerDataReceived));
  }, [freelancerDataReceived]);

  useEffect(() => {
    localStorage.setItem('wpp_crm_freelancer_logs', JSON.stringify(freelancerActivityLogs));
  }, [freelancerActivityLogs]);

  // Tab, Sidebar & Filter States
  const [activeTab, setActiveTabState] = useState<TabType>(() => ROUTE_TABS[pathname] || (pathname.startsWith('/projects/') ? 'projects' : 'dashboard'));
  const setActiveTab = useCallback((tab: TabType) => {
    setActiveTabState(tab);
    router.push(TAB_ROUTES[tab]);
  }, [router]);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const routeTab = ROUTE_TABS[pathname];
    if (routeTab) setActiveTabState(routeTab);
    else if (pathname.startsWith('/projects/')) setActiveTabState('projects');
  }, [pathname]);

  const isEditor = currentUser?.role === 'Video Editor' || 
                   currentUser?.role === 'Photo Editor' || 
                   currentUser?.role === 'Cinematographer' || 
                   currentUser?.role === 'Lead Photographer' || 
                   (!!currentUser?.role && currentUser.role.toLowerCase().includes('editor'));

  useEffect(() => {
    // Never perform role-based navigation while the login screen is active.
    // Route changes remount this client tree and would clear entered credentials.
    if (!currentUser) return;

    if (currentUser?.role === 'Owner' && activeTab === 'roles') {
      setActiveTab('owner_workspace');
    } else if (currentUser?.role !== 'Owner' && activeTab === 'owner_workspace') {
      setActiveTab(isFullAdmin ? 'dashboard' : 'roles');
    } else if (!isFullAdmin && activeTab === 'dashboard') {
      setActiveTab('roles');
    }
  }, [currentUser, currentUser?.role, activeTab, isFullAdmin, setActiveTab]);

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
  const isNewProjectPage = pathname === '/projects/new';
  const isScheduleShootPage = pathname === '/shoots/schedule';
  const isRecordPaymentPage = pathname === '/payments/new';

  // Status counts for Header & Filters
  const counts = {
    total: projects.length,
    running: projects.filter((p) => p.status === 'running').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    readyToDeliver: projects.filter((p) => p.status === 'ready_to_deliver').length,
    pending: projects.filter((p) => p.status === 'pending').length,
    urgent: projects.filter((p) => p.status === 'urgent').length,
  };

  // Authentication Handlers
  const handleLogin = (user: TeamMember | typeof OWNER_USER) => {
    login(user);
    setShowLoginModal(false);
    
    // Non-admin roles automatically open their role workspace
    if (user.role !== 'Owner' && user.role !== 'Studio Manager' && user.role !== 'Manager' && user.role !== 'Account Manager') {
      setActiveTab('roles');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('wpp_crm_logged_user');
    logout();
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

  const handleAddTeamMember = (member: TeamMember) => {
    setTeam([member, ...team]);
  };

  const handleUpdateTeamMember = (updatedMember: TeamMember) => {
    setTeam(team.map((m) => (m.id === updatedMember.id ? updatedMember : m)));
  };

  const handleDeleteTeamMember = (memberId: string) => {
    setTeam(team.filter((m) => m.id !== memberId));
  };

  const handleRecordAttendance = (record: AttendanceRecord) => {
    setAttendance([record, ...attendance]);
  };

  const handleUpdateAttendance = (records: AttendanceRecord[]) => {
    setAttendance(records);
  };

  const handleAddTask = (task: TeamTask) => {
    setTasks([task, ...tasks]);
  };

  const handleUpdateTask = (updatedTask: TeamTask) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  // Freelancer Handlers
  const handleSaveFreelancer = (freelancer: Freelancer) => {
    const exists = freelancers.some((f) => f.id === freelancer.id);
    if (exists) {
      setFreelancers(freelancers.map((f) => (f.id === freelancer.id ? freelancer : f)));
    } else {
      setFreelancers([freelancer, ...freelancers]);
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

    // Recalculate advancePaid / pendingAmount on associated assignment
    if (payment.assignmentId) {
      setFreelancerAssignments(
        freelancerAssignments.map((a) => {
          if (a.id === payment.assignmentId) {
            const newPaid = a.advancePaid + payment.amountPaid;
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
        team={team}
        onLogin={handleLogin}
        onAddTeamMember={handleAddTeamMember}
      />
    );
  }

  return (
    <ToastProvider>
    <div className="h-screen w-full bg-slate-100 flex overflow-hidden font-sans text-slate-800">

      {/* Sidebar Component */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenOnMobile={isMobileSidebarOpen}
        setIsOpenOnMobile={setIsMobileSidebarOpen}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-100">
        
        {/* Top Horizontal Header Bar */}
        <TopHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onOpenNewProjectModal={() => {
            router.push('/projects/new');
          }}
          onOpenAIModal={() => setIsAIModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onExportData={handleExportData}
          onImportData={handleImportData}
          currentUser={currentUser}
          onLogout={handleLogout}
          counts={counts}
        />

        {/* Scrollable Canvas Area */}
        <div className="crm-canvas flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
          {isNewProjectPage ? (
            <ProjectFormModal
              isOpen
              variant="page"
              onClose={() => router.push('/projects')}
              onSave={handleSaveProject}
              existingProject={null}
              team={team}
            />
          ) : isScheduleShootPage ? (
            <ScheduleShootModal
              isOpen
              variant="page"
              onClose={() => router.push('/dashboard')}
              projects={projects}
              onUpdateProject={handleUpdateProject}
              team={team}
            />
          ) : isRecordPaymentPage ? (
            <AllPaymentsModal
              isOpen
              variant="page"
              onClose={() => router.push('/dashboard')}
              projects={projects}
              onUpdateProject={handleUpdateProject}
              onSelectProject={handleSelectProject}
            />
          ) : routedProject ? (
            <ProjectDetailModal
              variant="page"
              project={routedProject}
              onClose={() => {
                setSelectedProjectRole(undefined);
                router.push('/projects');
              }}
              onUpdateProject={handleUpdateProject}
              onGenerateInvoice={(project) => setSelectedProjectForInvoice(project)}
              onDeleteProject={handleDeleteProject}
              team={team}
              currentUser={currentUser}
              userRole={selectedProjectRole || currentUser?.role}
            />
          ) : (
          <>
          
          {/* Tab 1: Main Dashboard */}
          {activeTab === 'dashboard' && (
            <OwnerDashboard
              projects={projects}
              onSelectProject={(project) => handleSelectProject(project)}
              onOpenNewProjectModal={() => {
                router.push('/projects/new');
              }}
              onUpdateProject={handleUpdateProject}
              onOpenAllPaymentsModal={() => router.push('/payments/new')}
              setActiveTab={setActiveTab}
              team={team}
              attendance={attendance}
              tasks={tasks}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onAddTask={handleAddTask}
              onOpenMemberModal={(member) => setSelectedMemberForModal(member)}
              currentUser={currentUser}
            />
          )}

          {/* Exclusive Owner Workspace (Visible ONLY to Owner) */}
          {activeTab === 'owner_workspace' && currentUser?.role === 'Owner' && (
            <OwnerWorkspace
              projects={projects}
              activeTeamMembers={team}
            />
          )}

          {/* Leads & Inquiries Management (Visible ONLY to Owner, Manager, and Sales) */}
          {activeTab === 'leads' && (
            <LeadsManagement currentUser={currentUser} />
          )}

          {/* Tab 2: Role Workspaces & Distinct Dashboards */}
          {activeTab === 'roles' && (
            <RoleDashboards
              team={team}
              projects={projects}
              attendance={attendance}
              tasks={tasks}
              onUpdateTeamMember={handleUpdateTeamMember}
              onRecordAttendance={handleRecordAttendance}
              onUpdateAttendance={handleUpdateAttendance}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onSelectProject={(project, role) => handleSelectProject(project, role)}
              onOpenNewProjectModal={() => {
                setEditingProject(null);
                setIsFormModalOpen(true);
              }}
              onSaveProject={handleSaveProject}
              onOpenAllPaymentsModal={() => setIsAllPaymentsModalOpen(true)}
              setActiveTab={setActiveTab}
              currentUser={currentUser}
            />
          )}

          {/* Tab 2: Projects / Client Project Management */}
          {activeTab === 'projects' && (
            <ProjectsManager
              projects={projects}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onSelectProject={(project) => handleSelectProject(project, currentUser?.role)}
              onUpdateProject={handleUpdateProject}
              onEditProject={(project) => {
                setEditingProject(project);
                setIsFormModalOpen(true);
              }}
              onDeleteProject={handleDeleteProject}
              onOpenNewProjectModal={() => {
                setEditingProject(null);
                setIsFormModalOpen(true);
              }}
              onOpenAllPaymentsModal={() => setIsAllPaymentsModalOpen(true)}
              onGenerateInvoice={(project) => setSelectedProjectForInvoice(project)}
              currentUser={currentUser}
              userRole={currentUser?.role}
            />
          )}

          {/* Tab 3: Shoot Management */}
          {activeTab === 'shoots' && (
            <ShootManagement
              projects={projects}
              onUpdateProject={handleUpdateProject}
              onSelectProject={(project) => handleSelectProject(project)}
              team={team}
            />
          )}

          {/* Tab 4: Data Management */}
          {activeTab === 'data' && (
            isFullAdmin ? (
              <DataManagement
                projects={projects}
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
            isFullAdmin ? (
              <TeamAttendance
                team={team}
                attendance={attendance}
                projects={projects}
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
              projects={projects}
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
          team={team}
          onLogin={handleLogin}
          onAddTeamMember={handleAddTeamMember}
          onClose={() => setShowLoginModal(false)}
        />
      )}
      
      {/* Add / Edit Project Form Modal */}
      {isFormModalOpen && (
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
      {selectedProjectForInvoice && (
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
      {isAllPaymentsModalOpen && (
        <AllPaymentsModal
          isOpen
          onClose={() => setIsAllPaymentsModalOpen(false)}
          projects={projects}
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
    </ToastProvider>
  );
}
