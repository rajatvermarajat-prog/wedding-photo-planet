import { ApiError } from '@/lib/api/client';
import type { BackendLeaveRequest } from '@/lib/api/attendance';
import type { LeaveRequest, Project, TeamMember } from '@/types';

export function toShiftValue(value?: string): string | undefined {
  if (!value) return undefined;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return undefined;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (match[3]) hours = (hours % 12) + (match[3].toUpperCase() === 'PM' ? 12 : 0);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) return fallback;
  const details = error.details
    ?.filter((detail): detail is { field?: string; message?: string } => typeof detail === 'object' && detail !== null)
    .map((detail) => `${detail.field ? `${detail.field}: ` : ''}${detail.message ?? ''}`.trim())
    .filter(Boolean);
  return details?.length ? `${error.message}\n${details.join('\n')}` : error.message;
}

export function hasEmployeeAssignmentConflict(candidate: Project, projects: Project[], team: TeamMember[]) {
  const assignments = (project: Project) => (project.shoots || []).flatMap((shoot) => {
    const date = shoot.date?.slice(0, 10);
    return (shoot.crewAssignments || []).flatMap((crew) => {
      const name = crew.name?.trim();
      if (!date || !name) return [];
      const employeeId = crew.userId || team.find((member) => member.name.trim().toLowerCase() === name.toLowerCase())?.id;
      return [{ projectId: project.id, assignmentId: crew.id, employee: employeeId || name.toLowerCase(), date }];
    });
  });

  const nextAssignments = assignments(candidate);
  const savedAssignments = projects.flatMap(assignments);
  return nextAssignments.some((next, index) =>
    savedAssignments.some((saved) =>
      next.employee === saved.employee &&
      next.date === saved.date &&
      !(next.projectId === saved.projectId && next.assignmentId === saved.assignmentId),
    ) ||
    nextAssignments.some((other, otherIndex) =>
      index !== otherIndex && next.employee === other.employee && next.date === other.date,
    ),
  );
}

export function isEmployeeAttendanceUser(user: { role?: string; roles?: string[] } | null): boolean {
  if (!user) return false;
  const roleNames = user.roles?.length ? user.roles : [user.role ?? ''];
  return !roleNames.some((role) => /(^|\W)(admin|owner)(\W|$)/i.test(role));
}

export function normalizeLeaveRequest(row: BackendLeaveRequest, team: TeamMember[]): LeaveRequest {
  const member = team.find((item) => item.id === row.userId);
  const leaveType = row.type === 'UNPAID' ? 'Other' : row.type.charAt(0) + row.type.slice(1).toLowerCase();
  return {
    id: row.id,
    teamMemberId: row.userId,
    teamMemberName: row.user?.fullName ?? member?.name ?? 'Employee',
    role: member?.role ?? 'Unassigned',
    leaveType,
    startDate: row.startDate.slice(0, 10),
    endDate: row.endDate.slice(0, 10),
    days: row.days,
    reason: row.reason ?? '',
    status: row.status.toLowerCase() as LeaveRequest['status'],
    appliedOn: row.createdAt.slice(0, 10),
    reviewedBy: row.reviewer?.fullName,
    reviewedOn: row.reviewedAt?.slice(0, 10),
    reviewNote: row.reviewNote ?? undefined,
  };
}

export function leaveTypeInput(value: string): BackendLeaveRequest['type'] {
  const normalized = value.trim().toUpperCase();
  if (['CASUAL', 'SICK', 'PERSONAL', 'EMERGENCY', 'OTHER'].includes(normalized)) return normalized as BackendLeaveRequest['type'];
  return 'OTHER';
}
