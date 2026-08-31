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
 * A personal role is one employee's own permission set, so it is offered only
 * while editing that employee — never in anyone else's list.
 */
export function assignableRoles(roles: AccessRole[], forUserId?: string): AccessRole[] {
  return roles.filter(
    (role) =>
      role.assignable &&
      role.status === 'active' &&
      (!role.personalForUserId || role.personalForUserId === forUserId),
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
