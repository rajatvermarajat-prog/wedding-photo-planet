import { AccessAuditEntry, AccessRole, AccessUser, PermissionGrant, PermissionScope } from './accessTypes';
import { ALL_PERMISSION_KEYS, PERMISSION_MODULES, findPermission } from './permissionCatalog';

const today = () => new Date().toISOString().slice(0, 10);

export const SCOPE_LABELS: Record<PermissionScope, string> = {
  all: 'All records',
  assigned: 'Assigned only',
  team: 'Team records',
  own: 'Own records',
  custom: 'Selected projects',
};

const grant = (enabled: boolean, scope: PermissionScope = 'all'): PermissionGrant => ({ enabled, scope });

function grantsFor(keys: string[], scope: PermissionScope = 'all'): Record<string, PermissionGrant> {
  const next: Record<string, PermissionGrant> = {};
  ALL_PERMISSION_KEYS.forEach((key) => {
    next[key] = grant(keys.includes(key), scope);
  });
  return next;
}

function allGrants(enabled: boolean, scope: PermissionScope = 'all') {
  return grantsFor(enabled ? ALL_PERMISSION_KEYS : [], scope);
}

const VIEW_OPS = [
  'dashboard.view',
  'dashboard.view_upcoming',
  'clients.view',
  'clients.view_details',
  'leads.view',
  'weddings.view',
  'weddings.view_details',
  'events.view',
  'shoots.view',
  'media.view_photos',
  'media.view_videos',
  'gallery.view',
  'albums.view',
  'tasks.view',
  'calendar.view',
  'calendar.view_personal',
  'notifications.view',
];

const EMPLOYEE_KEYS = [
  ...VIEW_OPS,
  'dashboard.view_analytics',
  'leads.create',
  'leads.edit',
  'leads.change_status',
  'shoots.edit',
  'shoots.manage_status',
  'events.edit',
  'media.upload_photos',
  'media.upload_videos',
  'media.edit_photo_meta',
  'tasks.create',
  'tasks.edit',
  'tasks.change_status',
  'calendar.view_team',
];

const MANAGER_KEYS = ALL_PERMISSION_KEYS.filter(
  (key) =>
    !key.startsWith('settings.') ||
    key === 'settings.view' ||
    key === 'settings.manage_users'
);

const FREELANCER_KEYS = [
  'dashboard.view',
  'dashboard.view_upcoming',
  'shoots.view',
  'events.view',
  'weddings.view',
  'media.view_photos',
  'media.view_videos',
  'media.upload_photos',
  'media.upload_videos',
  'tasks.view',
  'tasks.change_status',
  'calendar.view',
  'calendar.view_personal',
  'notifications.view',
];

const CLIENT_KEYS = [
  'gallery.view',
  'gallery.manage_favorites',
  'gallery.manage_selections',
  'albums.view',
  'media.view_photos',
  'media.view_videos',
  'notifications.view',
];

const FINANCE_KEYS = ALL_PERMISSION_KEYS.filter(
  (key) => key.startsWith('finance.') || key.startsWith('reports.') || key === 'dashboard.view' || key === 'dashboard.view_financial'
);

const SALES_KEYS = [
  ...VIEW_OPS,
  'dashboard.view_analytics',
  'leads.create',
  'leads.edit',
  'leads.assign',
  'leads.change_status',
  'leads.convert',
  'clients.create',
  'clients.edit',
  'weddings.create',
  'weddings.edit',
  'reports.view',
  'reports.view_sales',
  'notifications.send',
  'notifications.send_client',
];

function role(partial: Omit<AccessRole, 'createdAt' | 'updatedAt' | 'status'> & { createdAt?: string }): AccessRole {
  const stamp = partial.createdAt || '2026-01-01';
  return { ...partial, status: 'active', createdAt: stamp, updatedAt: stamp };
}

export const DEFAULT_ACCESS_ROLES: AccessRole[] = [
  role({ id: 'super_admin', name: 'Super Admin', description: 'Full studio control. Cannot be deleted.', type: 'system', grants: allGrants(true) }),
  role({ id: 'admin', name: 'Admin', description: 'Studio administration without removing Super Admin protection.', type: 'system', grants: grantsFor(MANAGER_KEYS.concat(['settings.manage_roles', 'settings.manage_permissions', 'settings.edit'])) }),
  role({ id: 'manager', name: 'Manager', description: 'Manages weddings, team, shoots and day-to-day studio work.', type: 'system', grants: grantsFor(MANAGER_KEYS) }),
  role({ id: 'employee', name: 'Employee', description: 'Operational access for assigned studio work.', type: 'system', grants: grantsFor(EMPLOYEE_KEYS, 'assigned') }),
  role({ id: 'freelancer', name: 'Freelancer', description: 'Assigned shoots, uploads and personal calendar.', type: 'system', grants: grantsFor(FREELANCER_KEYS, 'assigned') }),
  role({ id: 'photographer', name: 'Photographer', description: 'Assigned shoots and photo upload.', type: 'system', grants: grantsFor([...FREELANCER_KEYS, 'media.download', 'shoots.assign_photographer'], 'assigned') }),
  role({ id: 'cinematographer', name: 'Cinematographer', description: 'Assigned shoots and video upload.', type: 'system', grants: grantsFor([...FREELANCER_KEYS, 'media.download', 'shoots.assign_cinematographer'], 'assigned') }),
  role({ id: 'video_editor', name: 'Video Editor', description: 'Editing tasks, media view and assigned projects.', type: 'system', grants: grantsFor(['dashboard.view', 'weddings.view', 'shoots.view', 'media.view_videos', 'media.view_photos', 'tasks.view', 'tasks.edit', 'tasks.change_status', 'albums.view', 'calendar.view_personal', 'notifications.view'], 'assigned') }),
  role({ id: 'photo_editor', name: 'Photo Editor', description: 'Photo editing tasks and album work.', type: 'system', grants: grantsFor(['dashboard.view', 'weddings.view', 'media.view_photos', 'media.edit_photo_meta', 'tasks.view', 'tasks.edit', 'tasks.change_status', 'albums.view', 'albums.edit', 'calendar.view_personal', 'notifications.view'], 'assigned') }),
  role({ id: 'sales_executive', name: 'Sales Executive', description: 'Leads, follow-ups and conversion.', type: 'system', grants: grantsFor(SALES_KEYS, 'own') }),
  role({ id: 'accountant', name: 'Accountant', description: 'Invoices, payments and financial reports.', type: 'system', grants: grantsFor(FINANCE_KEYS) }),
  role({ id: 'hr', name: 'HR', description: 'Employees, attendance and HR reports.', type: 'system', grants: grantsFor(['dashboard.view', 'employees.view', 'employees.create', 'employees.edit', 'employees.manage_attendance', 'employees.view_performance', 'reports.view', 'reports.view_employee', 'settings.manage_users', 'notifications.send_team']) }),
  role({ id: 'client', name: 'Client', description: 'Client gallery and selections only.', type: 'system', grants: grantsFor(CLIENT_KEYS, 'own') }),
];

export const ACCESS_PRESETS: { id: string; label: string; hint: string; keys: string[]; scope: PermissionScope }[] = [
  { id: 'full', label: 'Full Access', hint: 'Every module and action', keys: ALL_PERMISSION_KEYS, scope: 'all' },
  { id: 'manager', label: 'Manager Access', hint: 'Day-to-day studio management', keys: MANAGER_KEYS, scope: 'all' },
  { id: 'employee', label: 'Employee Access', hint: 'Operational work on assigned jobs', keys: EMPLOYEE_KEYS, scope: 'assigned' },
  { id: 'freelancer', label: 'Freelancer Access', hint: 'Assigned shoots and uploads', keys: FREELANCER_KEYS, scope: 'assigned' },
  { id: 'client', label: 'Client Access', hint: 'Gallery and selections only', keys: CLIENT_KEYS, scope: 'own' },
  { id: 'finance', label: 'Finance Access', hint: 'Invoices, payments and reports', keys: FINANCE_KEYS, scope: 'all' },
];

const TITLE_MAP: Array<{ test: RegExp; roleId: string }> = [
  { test: /owner|super admin/i, roleId: 'super_admin' },
  { test: /^admin$/i, roleId: 'admin' },
  { test: /studio manager|account manager|^manager$/i, roleId: 'manager' },
  { test: /sales/i, roleId: 'sales_executive' },
  { test: /photo editor|retouch/i, roleId: 'photo_editor' },
  { test: /video editor|^editor$/i, roleId: 'video_editor' },
  { test: /cinema|video/i, roleId: 'cinematographer' },
  { test: /photo/i, roleId: 'photographer' },
  { test: /freelance/i, roleId: 'freelancer' },
  { test: /account|finance/i, roleId: 'accountant' },
  { test: /^hr$|human resource/i, roleId: 'hr' },
  { test: /client/i, roleId: 'client' },
];

export function mergeAccessRoles(saved?: AccessRole[] | null): AccessRole[] {
  const incoming = Array.isArray(saved) ? saved : [];
  const byId = new Map(incoming.map((r) => [r.id, r]));
  DEFAULT_ACCESS_ROLES.forEach((base) => {
    if (!byId.has(base.id)) byId.set(base.id, base);
  });
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function resolveAccessRole(user: AccessUser | null | undefined, roles: AccessRole[]): AccessRole | undefined {
  if (!user) return undefined;
  if (user.accessRoleId) {
    const match = roles.find((r) => r.id === user.accessRoleId);
    if (match) return match;
  }
  const title = user.role || '';
  const mapped = TITLE_MAP.find((row) => row.test.test(title));
  return roles.find((r) => r.id === (mapped?.roleId || 'employee'));
}

export function enabledCount(role: AccessRole) {
  return Object.values(role.grants || {}).filter((g) => g.enabled).length;
}

export function moduleSummary(role: AccessRole) {
  return PERMISSION_MODULES.map((mod) => {
    const total = mod.permissions.length;
    const on = mod.permissions.filter((p) => role.grants[p.key]?.enabled).length;
    return { id: mod.id, label: mod.label, on, total };
  });
}

export function applyPreset(keys: string[], scope: PermissionScope): Record<string, PermissionGrant> {
  return grantsFor(keys, scope);
}

export function hasPermission(
  user: AccessUser | null | undefined,
  roles: AccessRole[],
  key: string,
  requiredScope?: PermissionScope
): boolean {
  if (!user) return false;
  const denied = user.deniedPermissions || [];
  if (denied.includes(key)) return false;
  const extra = user.extraPermissions || [];
  if (extra.includes(key)) return true;
  const role = resolveAccessRole(user, roles);
  if (!role || role.status !== 'active') return false;
  const grant = role.grants[key];
  if (!grant?.enabled) return false;
  if (requiredScope && grant.scope && grant.scope !== 'all' && grant.scope !== requiredScope) {
    const rank: PermissionScope[] = ['own', 'assigned', 'team', 'custom', 'all'];
    return rank.indexOf(grant.scope) >= rank.indexOf(requiredScope);
  }
  return true;
}

export function permissionLabel(key: string) {
  return findPermission(key)?.label || key;
}

export function diffGrants(before: AccessRole, after: AccessRole) {
  const added: string[] = [];
  const removed: string[] = [];
  ALL_PERMISSION_KEYS.forEach((key) => {
    const was = !!before.grants[key]?.enabled;
    const now = !!after.grants[key]?.enabled;
    if (!was && now) added.push(key);
    if (was && !now) removed.push(key);
  });
  return { added, removed };
}

export function makeAudit(role: AccessRole, added: string[], removed: string[], changedBy: string): AccessAuditEntry {
  return {
    id: `audit-${Date.now()}`,
    roleId: role.id,
    roleName: role.name,
    added: added.map(permissionLabel),
    removed: removed.map(permissionLabel),
    changedBy,
    date: new Date().toISOString(),
  };
}

export function slugRoleId(name: string) {
  return `role-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || Date.now()}`;
}

export function newCustomRole(name: string, description: string): AccessRole {
  const stamp = today();
  return {
    id: `${slugRoleId(name)}-${Date.now().toString().slice(-4)}`,
    name,
    description,
    type: 'custom',
    status: 'active',
    grants: allGrants(false),
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export function duplicateRole(source: AccessRole, name: string): AccessRole {
  const stamp = today();
  return {
    ...source,
    id: `${slugRoleId(name)}-${Date.now().toString().slice(-4)}`,
    name,
    description: `Copy of ${source.name}`,
    type: 'custom',
    status: 'active',
    grants: JSON.parse(JSON.stringify(source.grants)),
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export const ACCESS_STORAGE_ROLES = 'wpp_crm_access_roles';
export const ACCESS_STORAGE_AUDIT = 'wpp_crm_access_audit';
