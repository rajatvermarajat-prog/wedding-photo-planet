import type { TabType } from '@/components/layout/Header';

/** Sidebar item → page-level view permission. */
export const TAB_PERMISSIONS: Partial<Record<TabType, string>> = {
  dashboard: 'dashboard.view',
  owner_workspace: 'dashboard.view_financial',
  equipment: 'settings.view',
  roles: 'dashboard.view',
  leads: 'leads.view',
  projects: 'weddings.view',
  shoots: 'shoots.view',
  expenses: 'finance.manage_expenses',
  data: 'settings.view',
  team: 'employees.view',
  freelancers: 'freelancers.view',
  clients: 'clients.view',
  deliveries: 'albums.view',
  access: 'settings.manage_roles',
};
