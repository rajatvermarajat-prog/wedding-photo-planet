import { apiBlobRequest, apiRequest, type ApiMeta } from './client';

export type BackendAttendanceStatus = 'PRESENT' | 'HALF_DAY' | 'ABSENT' | 'ON_LEAVE' | 'WEEKLY_OFF' | 'HOLIDAY';

export interface BackendAttendance {
  id: string;
  userId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workingMinutes: number;
  status: BackendAttendanceStatus;
  workLocation: 'OFFICE' | 'WFH' | 'HYBRID' | 'ON_SHOOT';
  user?: { id: string; fullName: string; employeeCode: string | null };
}

export interface AttendanceListQuery { userId?: string; page?: number; limit?: number; from?: string; to?: string; }

export interface BackendLeaveRequest {
  id: string;
  userId: string;
  type: 'CASUAL' | 'SICK' | 'PERSONAL' | 'EMERGENCY' | 'UNPAID' | 'OTHER';
  startDate: string;
  endDate: string;
  days: number;
  reason: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
  user?: { id: string; fullName: string };
  reviewer?: { id: string; fullName: string } | null;
}

export interface LeaveListQuery { userId?: string; page?: number; limit?: number; status?: BackendLeaveRequest['status']; }

export interface EmployeePerformanceReport {
  month: string;
  employee: {
    userId: string; fullName: string; employeeCode: string | null;
    present: number; absent: number; late: number; halfDay: number; onLeave: number;
    payableDays: number; workingMinutes: number; expectedMinutes: number; undertimeMinutes: number;
    dailyRate: number; calculatedSalary: number; shift: { start: string | null; end: string | null };
  };
  attendance: { present: number; absent: number; late: number; halfDay: number; onLeave: number; payableDays: number; workingMinutes: number; expectedMinutes: number; undertimeMinutes: number };
  salary: { dailyRate: number; calculatedSalary: number };
  performance: { assignedTasks: number; completedTasks: number; completionRate: number; trackedWorkSessions: number; trackedWorkMinutes: number; shootAssignments: number };
}

function queryString(query: object): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); });
  return `?${params.toString()}`;
}

export const attendanceApi = {
  async list(query: AttendanceListQuery): Promise<{ items: BackendAttendance[]; meta: ApiMeta }> {
    const response = await apiRequest<BackendAttendance[]>(`/attendance${queryString(query)}`);
    return { items: response.data, meta: response.meta };
  },
  async mark(input: { userId?: string; date: string; checkIn?: string; checkOut?: string; status?: BackendAttendanceStatus; source?: 'PASSWORD' | 'ADMIN'; workLocation?: 'OFFICE' | 'WFH' | 'HYBRID' | 'ON_SHOOT' }): Promise<BackendAttendance> {
    const { data } = await apiRequest<BackendAttendance>('/attendance', { method: 'POST', body: JSON.stringify(input) });
    return data;
  },
  async performanceReport(userId: string, month: string): Promise<EmployeePerformanceReport> {
    const { data } = await apiRequest<EmployeePerformanceReport>(`/attendance/performance/${userId}?month=${encodeURIComponent(month)}`);
    return data;
  },
  async downloadPerformanceReport(userId: string, month: string): Promise<{ blob: Blob; filename: string | null }> {
    return apiBlobRequest(`/attendance/performance/${userId}/pdf?month=${encodeURIComponent(month)}`);
  },
  async listLeave(query: LeaveListQuery = {}): Promise<{ items: BackendLeaveRequest[]; meta: ApiMeta }> {
    const response = await apiRequest<BackendLeaveRequest[]>(`/attendance/leave${queryString(query)}`);
    return { items: response.data, meta: response.meta };
  },
  async requestLeave(input: { type?: BackendLeaveRequest['type']; startDate: string; endDate: string; reason?: string }): Promise<BackendLeaveRequest> {
    const { data } = await apiRequest<BackendLeaveRequest>('/attendance/leave', { method: 'POST', body: JSON.stringify(input) });
    return data;
  },
  async reviewLeave(id: string, input: { decision: 'APPROVE' | 'REJECT'; note?: string }): Promise<BackendLeaveRequest> {
    const { data } = await apiRequest<BackendLeaveRequest>(`/attendance/leave/${id}/review`, { method: 'POST', body: JSON.stringify(input) });
    return data;
  },
};
