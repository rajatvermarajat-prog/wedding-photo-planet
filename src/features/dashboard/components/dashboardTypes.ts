import { AttendanceRecord, Project, TeamMember, TeamTask } from '@/types';

export interface SalaryInstallment {
  id: string;
  amount: number;
  date: string;
  mode: string;
  notes?: string;
}

export interface MemberSalaryRecord {
  memberId: string;
  memberName: string;
  role: string;
  monthlySalary: number;
  paidAmount: number;
  lastPaymentDate?: string;
  paymentMonth?: string;
  notes?: string;
  customValues?: Record<string, number | string>;
  installments?: SalaryInstallment[];
}

export interface OwnerDashboardProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onOpenNewProjectModal: () => void;
  onUpdateProject: (updated: Project) => void;
  onOpenAllPaymentsModal?: () => void;
  setActiveTab: (tab: 'dashboard' | 'projects' | 'shoots' | 'data' | 'team' | 'deliveries') => void;
  team?: TeamMember[];
  attendance?: AttendanceRecord[];
  tasks?: TeamTask[];
  onUpdateTask?: (task: TeamTask) => void;
  onDeleteTask?: (taskId: string) => void;
  onAddTask?: (task: TeamTask) => void;
  onOpenMemberModal?: (member: TeamMember) => void;
  currentUser?: TeamMember | { id?: string; name?: string; role?: string; email?: string } | null;
}
