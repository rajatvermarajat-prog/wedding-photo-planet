import type { BackendAttendance } from '@/lib/api/attendance';
import type { AttendanceRecord } from '@/types';

const statusMap = { PRESENT: 'present_office', HALF_DAY: 'half_day', ABSENT: 'absent', ON_LEAVE: 'leave', WEEKLY_OFF: 'weekly_off', HOLIDAY: 'holiday' } as const;
function time(value: string | null): string | undefined { return value ? new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : undefined; }

export function normalizeAttendance(record: BackendAttendance): AttendanceRecord {
  return {
    id: record.id,
    date: record.date.slice(0, 10),
    teamMemberId: record.userId,
    teamMemberName: record.user?.fullName ?? 'Team member',
    role: 'Other',
    status: statusMap[record.status],
    inTime: time(record.checkIn),
    outTime: time(record.checkOut),
    payAmount: 0,
    paidStatus: 'pending',
  };
}
