export type { AccessRole, AccessAuditEntry, AccessUser, PermissionScope } from './accessTypes';
export { PERMISSION_MODULES, ALL_PERMISSION_KEYS, findPermission } from './permissionCatalog';
export {
  DEFAULT_ACCESS_ROLES,
  ACCESS_PRESETS,
  mergeAccessRoles,
  resolveAccessRole,
  hasPermission,
  hasAnyPermission,
  enabledCount,
  ACCESS_STORAGE_ROLES,
  ACCESS_STORAGE_AUDIT,
} from './accessDomain';
export { PermissionProvider, PermissionGuard, RoleGuard, Can, usePermission, useRole } from './accessGuards';
export { TAB_PERMISSIONS } from './navPermissions';
export { usePermissionRoles } from './usePermissionRoles';
export { savePermissionRoles, loadPermissionRoles, PERMISSION_STORAGE_KEY } from './permissionStore';
export { RolesPermissionsManager } from './components/RolesPermissionsManager';
