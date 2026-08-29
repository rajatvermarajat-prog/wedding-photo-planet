import type { TeamMember } from '@/types';

export const UNASSIGNED_ASSIGNEE = 'Unassigned';
export const FREELANCER_ASSIGNEE = 'Freelancer';

export function employeeAssignees(team: TeamMember[] = []): TeamMember[] {
  return team.filter((member) => {
    if (!member?.name?.trim()) return false;
    const status = String(member.status || 'active').toLowerCase();
    return status !== 'inactive' && status !== 'suspended' && status !== 'disabled';
  });
}

export function mergeAssignees(...lists: TeamMember[][]): TeamMember[] {
  const map = new Map<string, TeamMember>();
  for (const list of lists) {
    for (const member of list) {
      const key = member.id || member.name;
      if (!key) continue;
      map.set(key, member);
    }
  }
  return employeeAssignees([...map.values()]);
}

export function assigneeSelectValue(assignedTo: string | undefined, employees: TeamMember[]) {
  if (!assignedTo || assignedTo === UNASSIGNED_ASSIGNEE) return UNASSIGNED_ASSIGNEE;
  if (employees.some((member) => member.name === assignedTo)) return assignedTo;
  return FREELANCER_ASSIGNEE;
}
