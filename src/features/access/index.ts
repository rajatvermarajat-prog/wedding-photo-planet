export type { AccessRole, AccessAuditEntry, AccessUser, PermissionScope } from './accessTypes';
export { PERMISSION_MODULES, ALL_PERMISSION_KEYS, findPermission, BACKEND_MODULE_META, BACKEND_MODULE_ORDER, ROLE_UI_MODULE_OVERRIDE, ROLE_UI_HIDDEN_KEYS, TEAM_PERMISSION_ORDER, FINANCE_PERMISSION_ORDER } from './permissionCatalog';
export {
  DEFAULT_ACCESS_ROLES,
  ACCESS_PRESETS,
  mergeAccessRoles,
  resolveAccessRole,
  hasPermission,
  hasAnyPermission,
  enabledCount,
} from './accessDomain';
export { PermissionProvider, PermissionGuard, RoleGuard, Can, usePermission, useRole } from './accessGuards';
export { TAB_PERMISSIONS } from './navPermissions';
export { RolesPermissionsManager } from './components/RolesPermissionsManager';
