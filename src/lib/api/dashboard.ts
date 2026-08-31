import { apiRequest } from './client';

export interface DashboardSummary {
  stats: {
    projects: number;
    activeProjects: number;
    completedProjects: number;
    urgentProjects: number;
    shoots: number;
    upcomingShoots: number;
    tasks: number;
    openTasks: number;
    overdueTasks: number;
    todos: number;
    pendingTodos: number;
    teamMembers: number;
    unreadNotifications: number;
    presentToday: number;
  };
  projectsByStatus: Record<string, number>;
  finance: { received: number; quoted: number; outstanding: number } | null;
  attendance: {
    status: string;
    checkIn: string | null;
    checkOut: string | null;
    date: string;
  } | null;
  upcomingShoots: {
    id: string;
    title: string;
    shootDate: string;
    startTime: string | null;
    status: string;
    location: string | null;
    projectName: string;
    projectNumber: string;
    clientName: string;
    eventName: string | null;
    crew: { role: string; name: string | null }[];
  }[];
  urgentProjects: {
    id: string;
    projectNumber: string;
    name: string;
    status: string;
    weddingDate: string | null;
    deliveryDueDate: string | null;
  }[];
}

export const dashboardApi = {
  async summary(): Promise<DashboardSummary> {
    const { data } = await apiRequest<DashboardSummary>('/dashboard/summary');
    return data;
  },
};
