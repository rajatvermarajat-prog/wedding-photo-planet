import type { TabType } from '@/components/layout/Header';

/** Sidebar item → one or more view permissions (any match grants the tab). */
export const TAB_PERMISSIONS: Partial<Record<TabType, string | string[]>> = {
  dashboard: ['dashboard.view', 'reports.view'],
  owner_workspace: 'dashboard.view_financial',
  equipment: 'settings.view',
  leads: 'leads.view',
  projects: 'weddings.view',
  shoots: ['shoots.view', 'events.view'],
  expenses: ['finance.view_payments', 'finance.manage_expenses', 'finance.view_invoices', 'finance.view_reports'],
  data: 'settings.view',
  team: 'employees.view',
  freelancers: 'freelancers.view',
  clients: 'clients.view',
  deliveries: ['media.view_photos', 'media.view_videos'],
  access: 'settings.manage_roles',
};
