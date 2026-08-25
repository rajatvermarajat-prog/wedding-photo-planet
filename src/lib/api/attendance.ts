import { apiRequest, type ApiMeta } from './client';

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

function queryString(query: AttendanceListQuery): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); });
  return `?${params.toString()}`;
}

export const attendanceApi = {
  async list(query: AttendanceListQuery): Promise<{ items: BackendAttendance[]; meta: ApiMeta }> {
    const response = await apiRequest<BackendAttendance[]>(`/attendance${queryString(query)}`);
    return { items: response.data, meta: response.meta };
  },
  async mark(input: { date: string; checkIn?: string; checkOut?: string; status?: BackendAttendanceStatus; source?: 'PASSWORD'; workLocation?: 'OFFICE' | 'WFH' | 'HYBRID' | 'ON_SHOOT' }): Promise<BackendAttendance> {
    const { data } = await apiRequest<BackendAttendance>('/attendance', { method: 'POST', body: JSON.stringify(input) });
    return data;
  },
};
