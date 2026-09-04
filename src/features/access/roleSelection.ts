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

const SYSTEM_ROLE_PRIORITY: Record<string, number> = {
  ADMIN: 0,
  MANAGER: 1,
};

/** True for an employee-specific permission set, rather than a reusable role template. */
export function isPersonalRole(role: Pick<AccessRole, 'personalForUserId'>): boolean {
  return Boolean(role.personalForUserId);
}

/**
 * Presentation-only cleanup for reusable roles. Older data can contain the
 * same system role with different casing (for example ADMIN and Admin). Keep
 * one row/option, preferring the canonical all-caps record when it exists.
 */
export function roleTemplates(roles: AccessRole[]): AccessRole[] {
  const seenSystemNames = new Set<string>();
  const canonicalFirst = [...roles].sort((a, b) => {
    const aCanonical = a.type === 'system' && a.name === a.name.toUpperCase() ? 0 : 1;
    const bCanonical = b.type === 'system' && b.name === b.name.toUpperCase() ? 0 : 1;
    return aCanonical - bCanonical;
  });

  return canonicalFirst
    .filter((role) => {
      if (isPersonalRole(role)) return false;
      if (role.type !== 'system') return true;
      const key = role.name.trim().toLocaleUpperCase();
      if (seenSystemNames.has(key)) return false;
      seenSystemNames.add(key);
      return true;
    })
    .sort((a, b) => {
      const priority = (role: AccessRole) => SYSTEM_ROLE_PRIORITY[role.name.trim().toLocaleUpperCase()] ?? 2;
      return priority(a) - priority(b) || a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
}

/** Personal roles, sorted consistently for the Individual Access view. */
export function individualAccessRoles(roles: AccessRole[]): AccessRole[] {
  return roles
    .filter(isPersonalRole)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
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
