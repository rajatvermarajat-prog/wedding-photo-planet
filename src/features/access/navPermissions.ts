import type { TabType } from '@/components/layout/Header';

/** Sidebar item → one or more view permissions (any match grants the tab). */
export const TAB_PERMISSIONS: Partial<Record<TabType, string | string[]>> = {
  dashboard: 'dashboard.view',
  equipment: ['settings.view', 'SETTING_VIEW'],
  leads: 'leads.view',
  projects: 'weddings.view',
  shoots: ['shoots.view', 'SHOOT_VIEW'],
  expenses: ['finance.view_expenses', 'EXPENSE_VIEW', 'finance.view_payments', 'finance.view_invoices', 'finance.view_reports'],
  data: ['data.view', 'DATA_MANAGEMENT_VIEW'],
  team: ['employees.view', 'TEAM_VIEW', 'attendance.view', 'ATTENDANCE_VIEW'],
  freelancers: 'freelancers.view',
  clients: 'clients.view',
  deliveries: ['media.view_photos', 'media.view_videos'],
  // Reading the roles desk needs ROLE_VIEW; the create/edit/delete actions on
  // the page are gated separately on their own permissions.
  access: 'ROLE_VIEW',
};
