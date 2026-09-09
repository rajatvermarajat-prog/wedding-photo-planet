import { AccessRole, AccessRoleStatus, AccessRoleType, PermissionModule } from './accessTypes';

/**
 * Pure view logic shared by the roles desk and the employee role selector, kept
 * out of the components so it can be tested without a DOM.
 */

export interface RoleFilter {
  query?: string;
  type?: 'all' | AccessRoleType;
  status?: 'all' | AccessRoleStatus;
}

export const FIXED_ROLE_NAMES = [
  'Admin', 'Manager', 'Account Manager', 'Video Editor', 'Social Media Handler',
  'Photo Editor', 'Album Designer', 'Photographer - Traditional',
  'Photographer - Candid', 'Videographer - Traditional',
  'Videographer - Candid', 'Drone Operator', 'Sales Team',
] as const;

/** True for an employee-specific permission set, rather than a reusable role template. */
export function isPersonalRole(role: Pick<AccessRole, 'personalForUserId'>): boolean {
  return Boolean(role.personalForUserId);
}

/**
 * The role catalogue is fixed. This second client-side guard keeps every
 * selector safe even if a stale API response is cached in a browser.
 */
export function roleTemplates(roles: AccessRole[]): AccessRole[] {
  return roles
    .filter((role) => FIXED_ROLE_NAMES.includes(role.name as typeof FIXED_ROLE_NAMES[number]))
    .sort((a, b) => FIXED_ROLE_NAMES.indexOf(a.name as typeof FIXED_ROLE_NAMES[number]) - FIXED_ROLE_NAMES.indexOf(b.name as typeof FIXED_ROLE_NAMES[number]));
}

/** Personal roles, sorted consistently for the Individual Access view. */
export function individualAccessRoles(roles: AccessRole[]): AccessRole[] {
  void roles;
  return [];
}

export function filterRoles(roles: AccessRole[], filter: RoleFilter): AccessRole[] {
  const q = (filter.query ?? '').trim().toLowerCase();
  const type = filter.type ?? 'all';
  const status = filter.status ?? 'all';
  return roles.filter(
    (role) =>
      (!q || `${role.name} ${role.description}`.toLowerCase().includes(q)) &&
      (type === 'all' || role.type === type) &&
      (status === 'all' || role.status === status),
  );
}

/**
 * Roles the signed-in actor may hand to an employee. `assignable` is computed
 * server-side; this only mirrors it so the UI does not offer a doomed choice.
 *
 * Employee-specific permission sets are managed from Individual Access and do
 * not belong in an employee's reusable-role selector.
 */
export function assignableRoles(roles: AccessRole[], forUserId?: string): AccessRole[] {
  void forUserId;
  return roleTemplates(roles).filter(
    (role) =>
      role.assignable &&
      role.status === 'active',
  );
}

export function enabledPermissionKeys(role: Pick<AccessRole, 'grants'>): string[] {
  return Object.entries(role.grants)
    .filter(([, grant]) => grant.enabled)
    .map(([key]) => key);
}

/** Module-level summary of a role's grant, for the permission preview. */
export function rolePermissionPreview(
  role: Pick<AccessRole, 'grants'> | null,
  modules: PermissionModule[],
): Array<{ module: string; count: number }> {
  if (!role) return [];
  return modules
    .map((module) => ({
      module: module.label,
      count: module.permissions.filter((permission) => role.grants[permission.key]?.enabled).length,
    }))
    .filter((entry) => entry.count > 0);
}
