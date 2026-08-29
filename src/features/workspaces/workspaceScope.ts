import { AttendanceRecord, FreelancerPayment, Project, ShootEvent, TeamMember, TeamTask } from '@/types';
import { AccessRole, AccessUser, PermissionScope } from '@/features/access';
import { hasPermission, resolveAccessRole } from '@/features/access';

export function grantScope(role: AccessRole | undefined, key: string): PermissionScope {
  return role?.grants[key]?.scope || 'all';
}

export function nameMatch(user?: AccessUser | null, value?: string) {
  if (!user?.name || !value) return false;
  const a = user.name.toLowerCase();
  const b = value.toLowerCase();
  return b.includes(a) || a.includes(b);
}

export function projectVisible(project: Project, user: AccessUser | null | undefined, scope: PermissionScope) {
  if (scope === 'all') return true;
  if (scope === 'own' || scope === 'custom') {
    return (
      nameMatch(user, project.clientWeddingTitle) ||
      nameMatch(user, project.name) ||
      nameMatch(user, project.projectName) ||
      nameMatch(user, project.specialNotesMusicPreferences)
    );
  }
  return (project.shoots || []).some((shoot) =>
    [shoot.leadPhotographer, shoot.cinematographer, shoot.droneOperator, ...(shoot.crewAssignments || []).map((c) => c.name)]
      .filter(Boolean)
      .some((name) => nameMatch(user, String(name)))
  ) || (project.tasks || []).some((task) => nameMatch(user, task.assignedTo));
}

export function canAccessProject(
  user: AccessUser | null | undefined,
  roles: AccessRole[],
  project: Project,
  key = 'weddings.view'
) {
  if (!hasPermission(user, roles, key)) return false;
  return projectVisible(project, user, grantScope(resolveAccessRole(user, roles), key));
}

export function visibleProjects(projects: Project[], user: AccessUser | null | undefined, roles: AccessRole[], key: string) {
  if (!hasPermission(user, roles, key)) return [];
  const scope = grantScope(resolveAccessRole(user, roles), key);
  if (scope === 'all') return projects;
  return projects.filter((p) => projectVisible(p, user, scope));
}

export function visibleShoots(projects: Project[], user: AccessUser | null | undefined, roles: AccessRole[]) {
  return visibleProjects(projects, user, roles, 'shoots.view')
    .flatMap((project) => (project.shoots || []).map((shoot) => ({ project, shoot })))
    .filter((row) => row.shoot.status !== 'cancelled')
    .sort((a, b) => (a.shoot.date || '').localeCompare(b.shoot.date || ''));
}

export function todayShoots(rows: { project: Project; shoot: ShootEvent }[]) {
  const today = new Date().toISOString().slice(0, 10);
  return rows.filter((row) => row.shoot.date === today);
}

export function upcomingShoots(rows: { project: Project; shoot: ShootEvent }[]) {
  const today = new Date().toISOString().slice(0, 10);
  return rows.filter((row) => row.shoot.date >= today).slice(0, 8);
}

export function myTasks(tasks: TeamTask[], user: AccessUser | null | undefined) {
  if (!user) return [];
  return tasks.filter((t) => t.assignedToId === user.id || nameMatch(user, t.assignedToName));
}

export function todayAttendance(attendance: AttendanceRecord[], user: AccessUser | null | undefined) {
  const today = new Date().toISOString().slice(0, 10);
  return attendance.find((a) => a.date === today && (a.teamMemberId === user?.id || nameMatch(user, a.teamMemberName)));
}

export function attendanceHistory(attendance: AttendanceRecord[], user: AccessUser | null | undefined, limit = 8) {
  return attendance
    .filter((a) => a.teamMemberId === user?.id || nameMatch(user, a.teamMemberName))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, limit);
}

export function presentCount(attendance: AttendanceRecord[], team: TeamMember[]) {
  const today = new Date().toISOString().slice(0, 10);
  const marked = attendance.filter((a) => a.date === today && String(a.status).includes('present')).length;
  return marked || team.filter((m) => m.availabilityStatus === 'Available' || m.workStatus === 'EDITING').length;
}

export function teamBuckets(team: TeamMember[]) {
  return {
    available: team.filter((m) => m.availabilityStatus === 'Available' || (!m.availabilityStatus && m.status === 'active')).length,
    working: team.filter((m) => m.availabilityStatus === 'On Shoot' || m.availabilityStatus === 'Busy' || m.workStatus === 'EDITING').length,
    assigned: team.filter((m) => (m.activeTasksCount || 0) > 0).length,
    leave: team.filter((m) => m.status === 'on_leave' || m.availabilityStatus === 'On Leave').length,
    freelancer: team.filter((m) => m.employmentType === 'Freelancer' || m.employmentType === 'Contract').length,
  };
}

export function projectHealth(projects: Project[]) {
  const today = new Date().toISOString().slice(0, 10);
  const delayed = projects.filter((p) => p.finalDeliveryDeadline && p.finalDeliveryDeadline < today && p.status !== 'completed');
  const atRisk = projects.filter((p) => p.status === 'urgent' || p.status === 'pending');
  const onTrack = projects.filter((p) => !delayed.includes(p) && !atRisk.includes(p) && p.status !== 'completed');
  return { onTrack: onTrack.length, atRisk: atRisk.length, delayed: delayed.length };
}

export function ownPayments(payments: FreelancerPayment[], user: AccessUser | null | undefined) {
  return payments.filter((p) => p.freelancerId === user?.id || nameMatch(user, p.freelancerName));
}

export function paymentPending(row: FreelancerPayment) {
  if (row.ledgerStatus && row.ledgerStatus !== 'paid' && row.ledgerStatus !== 'cancelled') return true;
  return (row.pendingAmount ?? 0) > 0;
}
