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
  'dashboard.view_kpi',
  'dashboard.view_upcoming',
  'dashboard.view_projects',
  'dashboard.view_tasks',
  'dashboard.view_attendance',
  'dashboard.view_todos',
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
  'dashboard.view',
  'weddings.view',
  'weddings.view_details',
  'events.view',
  'gallery.view',
  'gallery.manage_favorites',
  'gallery.manage_selections',
  'albums.view',
  'media.view_photos',
  'media.view_videos',
  'finance.view_payments',
  'finance.view_invoices',
  'notifications.view',
];

const FINANCE_KEYS = ALL_PERMISSION_KEYS.filter(
  (key) => key.startsWith('finance.') || key.startsWith('reports.') || key === 'dashboard.view' || key === 'dashboard.view_financial'
);

const SALES_KEYS = [
  ...VIEW_OPS,
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
  if (incoming.length === 0) return DEFAULT_ACCESS_ROLES.map((role) => ({ ...role, grants: { ...role.grants } }));

  const byId = new Map(incoming.map((r) => [r.id, r]));
  DEFAULT_ACCESS_ROLES.forEach((base) => {
    if (!byId.has(base.id)) byId.set(base.id, base);
  });
  return [...byId.values()]
    .map((role) => {
      const base = DEFAULT_ACCESS_ROLES.find((r) => r.id === role.id);
      const savedGrants = role.grants || {};
      const grants: Record<string, PermissionGrant> = {};
      ALL_PERMISSION_KEYS.forEach((key) => {
        if (savedGrants[key]) grants[key] = savedGrants[key];
        else grants[key] = base?.grants[key] || grant(false);
      });
      return { ...role, grants };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function hasAnyPermission(
  user: AccessUser | null | undefined,
  roles: AccessRole[],
  keys: string | string[]
) {
  return (Array.isArray(keys) ? keys : [keys]).some((key) => hasPermission(user, roles, key));
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
  const backendPermissions = user.permissions;
  if (backendPermissions) {
    return backendKeysFor(key).some((backendKey) => backendPermissions.includes(backendKey));
  }
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

/** Maps preserved UI capability names to the backend's permission contract. */
const LEGACY_PERMISSION_KEYS: Record<string, string> = {
  'dashboard.view': 'DASHBOARD_VIEW',
  'dashboard.view_kpi': 'DASHBOARD_KPI',
  'dashboard.view_analytics': 'DASHBOARD_KPI',
  'dashboard.view_financial': 'DASHBOARD_FINANCIAL',
  'dashboard.view_upcoming': 'DASHBOARD_UPCOMING',
  'dashboard.view_projects': 'DASHBOARD_PROJECTS',
  'dashboard.view_team': 'DASHBOARD_TEAM',
  'dashboard.view_tasks': 'DASHBOARD_TASKS',
  'dashboard.view_attendance': 'DASHBOARD_ATTENDANCE',
  'dashboard.view_todos': 'DASHBOARD_TODOS',
  'dashboard.view_quick_actions': 'DASHBOARD_QUICK_ACTIONS',
  'dashboard.view_alerts': 'DASHBOARD_ALERTS',
  'settings.view': 'ORG_VIEW',
  'settings.edit': 'SETTING_UPDATE',
  'settings.manage_roles': 'ROLE_UPDATE',
  'settings.manage_permissions': 'PERMISSION_ASSIGN',
  'settings.manage_users': 'USER_MANAGE',
  'leads.view': 'LEAD_VIEW',
  'leads.create': 'LEAD_CREATE',
  'leads.edit': 'LEAD_UPDATE',
  'leads.delete': 'LEAD_DELETE',
  'leads.assign': 'LEAD_ASSIGN',
  'leads.change_status': 'LEAD_UPDATE',
  'leads.convert': 'LEAD_CONVERT',
  'weddings.view': 'PROJECT_VIEW',
  'weddings.create': 'PROJECT_CREATE',
  'weddings.edit': 'PROJECT_UPDATE',
  'weddings.delete': 'PROJECT_DELETE',
  'weddings.change_status': 'PROJECT_STATUS_CHANGE',
  'shoots.view': 'SHOOT_VIEW',
  'shoots.create': 'SHOOT_CREATE',
  'shoots.edit': 'SHOOT_UPDATE',
  'shoots.delete': 'SHOOT_DELETE',
  'shoots.assign_photographer': 'SHOOT_ASSIGN',
  'shoots.assign_cinematographer': 'SHOOT_ASSIGN',
  'shoots.assign_freelancer': 'SHOOT_ASSIGN',
  'shoots.manage_status': 'SHOOT_UPDATE',
  'events.view': 'EVENT_VIEW',
  'events.create': 'EVENT_CREATE',
  'events.edit': 'EVENT_UPDATE',
  'events.delete': 'EVENT_DELETE',
  'finance.view_payments': 'PAYMENT_VIEW',
  'finance.record_payment': 'PAYMENT_CREATE',
  'finance.view_expenses': 'EXPENSE_VIEW',
  'finance.manage_expenses': 'EXPENSE_CREATE',
  'finance.edit_expense': 'EXPENSE_UPDATE',
  'finance.delete_expense': 'EXPENSE_DELETE',
  'finance.approve_expenses': 'EXPENSE_APPROVE',
  'finance.view_invoices': 'INVOICE_VIEW',
  'finance.create_invoice': 'INVOICE_CREATE',
  'finance.edit_invoice': 'INVOICE_UPDATE',
  'finance.delete_invoice': 'INVOICE_CANCEL',
  'finance.view_reports': 'REPORT_VIEW',
  'finance.export': 'REPORT_EXPORT',
  'employees.view': 'TEAM_VIEW',
  'employees.create': 'USER_CREATE',
  'employees.edit': 'USER_UPDATE',
  'employees.delete': 'USER_DELETE',
  'employees.assign': 'USER_MANAGE',
  'employees.manage_attendance': 'ATTENDANCE_MANAGE',
  'attendance.view': 'ATTENDANCE_VIEW',
  'attendance.mark': 'ATTENDANCE_MARK',
  'attendance.manage': 'ATTENDANCE_MANAGE',
  'leave.view': 'LEAVE_VIEW',
  'leave.request': 'LEAVE_REQUEST',
  'leave.approve': 'LEAVE_APPROVE',
  'freelancers.view': 'FREELANCER_VIEW',
  'freelancers.create': 'FREELANCER_CREATE',
  'freelancers.edit': 'FREELANCER_UPDATE',
  'freelancers.delete': 'FREELANCER_DELETE',
  'freelancers.assign': 'SHOOT_ASSIGN',
  'freelancers.manage_payments': 'FREELANCER_PAY',
  'clients.view': 'CLIENT_VIEW',
  'clients.create': 'CLIENT_CREATE',
  'clients.edit': 'CLIENT_UPDATE',
  'clients.delete': 'CLIENT_DELETE',
  'media.view_photos': 'DELIVERY_VIEW',
  'media.view_videos': 'DELIVERY_VIEW',
  'tasks.view': 'TASK_VIEW',
  'tasks.create': 'TASK_CREATE',
  'tasks.edit': 'TASK_UPDATE',
  'tasks.change_status': 'TASK_UPDATE',
  'tasks.delete': 'TASK_DELETE',
  'personal.todo': 'PERSONAL_TODO',
  'reports.view': 'REPORT_VIEW',
  'reports.view_sales': 'REPORT_VIEW',
  'reports.export': 'REPORT_EXPORT',
  'data.view': 'DATA_MANAGEMENT_VIEW',
};

function backendKeysFor(key: string): string[] {
  if (key === 'employees.edit') return ['USER_UPDATE', 'TEAM_MANAGE'];
  return [LEGACY_PERMISSION_KEYS[key] || key];
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
