import { AccessRole, AccessUser, PermissionScope } from './accessTypes';

export const SCOPE_LABELS: Record<PermissionScope, string> = {
  all: 'All records',
  assigned: 'Assigned only',
  team: 'Team records',
  own: 'Own records',
  custom: 'Selected projects',
};

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
