import type { BackendUser } from '@/lib/api/users';
import type { TeamMember } from '@/types';

const statusMap = { ACTIVE: 'active', INACTIVE: 'inactive', SUSPENDED: 'suspended', DISABLED: 'inactive' } as const;
const employmentMap = { FULL_TIME: 'Full Time', PART_TIME: 'Part Time', CONTRACT: 'Contract', INTERN: 'Intern' } as const;

export function normalizeTeamMember(user: BackendUser): TeamMember {
  const profile = user.employeeProfile;
  return {
    id: user.id,
    name: user.fullName,
    role: user.userRoles.map(({ role }) => role.name).join(', ') || 'Unassigned',
    accessRoleId: user.userRoles[0]?.role.id,
    email: user.email,
    phone: user.phone ?? undefined,
    employeeId: user.employeeCode ?? undefined,
    status: statusMap[user.status],
    employmentType: profile?.employmentType ? employmentMap[profile.employmentType] : undefined,
    joiningDate: profile?.joiningDate?.slice(0, 10),
    skills: profile?.skills ?? [],
  };
}
