import { PermissionModule, PermissionScope } from './accessTypes';

const RECORD: PermissionScope[] = ['all', 'assigned', 'team', 'own', 'custom'];
const ALL: PermissionScope[] = ['all'];

const p = (key: string, label: string, scopes: PermissionScope[] = ALL, sensitive = false) => ({
  key,
  label,
  scopes,
  sensitive,
});

export const PERMISSION_MODULES: PermissionModule[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Studio overview and live status.',
    permissions: [
      p('dashboard.view', 'View Dashboard'),
      p('dashboard.view_analytics', 'View Analytics'),
      p('dashboard.view_financial', 'View Financial Summary', ALL, true),
      p('dashboard.view_upcoming', 'View Upcoming Events'),
    ],
  },
  {
    id: 'clients',
    label: 'Clients',
    description: 'Wedding couples and booked families.',
    permissions: [
      p('clients.view', 'View Clients', RECORD),
      p('clients.create', 'Create Client'),
      p('clients.edit', 'Edit Client', RECORD),
      p('clients.delete', 'Delete Client', RECORD, true),
      p('clients.view_details', 'View Client Details', RECORD),
      p('clients.export', 'Export Client Data', ALL, true),
    ],
  },
  {
    id: 'leads',
    label: 'Leads',
    description: 'Inquiries and sales pipeline.',
    permissions: [
      p('leads.view', 'View Leads', RECORD),
      p('leads.create', 'Create Lead'),
      p('leads.edit', 'Edit Lead', RECORD),
      p('leads.delete', 'Delete Lead', RECORD, true),
      p('leads.assign', 'Assign Lead', RECORD),
      p('leads.change_status', 'Change Lead Status', RECORD),
      p('leads.convert', 'Convert Lead to Client', RECORD),
    ],
  },
  {
    id: 'weddings',
    label: 'Weddings / Projects',
    description: 'Booked weddings and project files.',
    permissions: [
      p('weddings.view', 'View Weddings', RECORD),
      p('weddings.create', 'Create Wedding'),
      p('weddings.edit', 'Edit Wedding', RECORD),
      p('weddings.delete', 'Delete Wedding', RECORD, true),
      p('weddings.view_details', 'View Wedding Details', RECORD),
      p('weddings.assign_manager', 'Assign Manager', RECORD),
      p('weddings.assign_team', 'Assign Team', RECORD),
      p('weddings.change_status', 'Change Wedding Status', RECORD),
      p('weddings.archive', 'Archive Wedding', RECORD),
    ],
  },
  {
    id: 'events',
    label: 'Events',
    description: 'Functions inside a wedding.',
    permissions: [
      p('events.view', 'View Events', RECORD),
      p('events.create', 'Create Event'),
      p('events.edit', 'Edit Event', RECORD),
      p('events.delete', 'Delete Event', RECORD, true),
      p('events.assign_team', 'Assign Team', RECORD),
      p('events.manage_schedule', 'Manage Event Schedule', RECORD),
    ],
  },
  {
    id: 'shoots',
    label: 'Shoots',
    description: 'Shoot days, crew and status.',
    permissions: [
      p('shoots.view', 'View Shoots', RECORD),
      p('shoots.create', 'Create Shoot'),
      p('shoots.edit', 'Edit Shoot', RECORD),
      p('shoots.delete', 'Delete Shoot', RECORD, true),
      p('shoots.assign_photographer', 'Assign Photographer', RECORD),
      p('shoots.assign_cinematographer', 'Assign Cinematographer', RECORD),
      p('shoots.assign_freelancer', 'Assign Freelancer', RECORD),
      p('shoots.manage_status', 'Manage Shoot Status', RECORD),
    ],
  },
  {
    id: 'media',
    label: 'Media',
    description: 'Photos, videos and files.',
    permissions: [
      p('media.view_photos', 'View Photos', RECORD),
      p('media.upload_photos', 'Upload Photos', RECORD),
      p('media.edit_photo_meta', 'Edit Photo Metadata', RECORD),
      p('media.delete_photos', 'Delete Photos', RECORD, true),
      p('media.view_videos', 'View Videos', RECORD),
      p('media.upload_videos', 'Upload Videos', RECORD),
      p('media.delete_videos', 'Delete Videos', RECORD, true),
      p('media.create_gallery', 'Create Gallery'),
      p('media.edit_gallery', 'Edit Gallery', RECORD),
      p('media.publish_gallery', 'Publish Gallery', RECORD),
      p('media.hide_gallery', 'Hide Gallery', RECORD),
      p('media.download', 'Download Media', RECORD),
      p('media.share_gallery', 'Share Gallery', RECORD),
    ],
  },
  {
    id: 'gallery',
    label: 'Client Gallery',
    description: 'Client-facing selections and delivery.',
    permissions: [
      p('gallery.view', 'View Client Gallery', RECORD),
      p('gallery.create', 'Create Gallery'),
      p('gallery.edit', 'Edit Gallery', RECORD),
      p('gallery.publish', 'Publish Gallery', RECORD),
      p('gallery.unpublish', 'Unpublish Gallery', RECORD),
      p('gallery.allow_download', 'Allow Download', RECORD),
      p('gallery.disable_download', 'Disable Download', RECORD),
      p('gallery.manage_favorites', 'Manage Favorites', RECORD),
      p('gallery.manage_selections', 'Manage Client Selections', RECORD),
      p('gallery.view_activity', 'View Client Activity', RECORD),
    ],
  },
  {
    id: 'albums',
    label: 'Albums',
    description: 'Album design and delivery.',
    permissions: [
      p('albums.view', 'View Albums', RECORD),
      p('albums.create', 'Create Album'),
      p('albums.edit', 'Edit Album', RECORD),
      p('albums.delete', 'Delete Album', RECORD, true),
      p('albums.approve', 'Approve Album', RECORD, true),
      p('albums.manage_selected', 'Manage Selected Photos', RECORD),
    ],
  },
  {
    id: 'employees',
    label: 'Team / Employees',
    description: 'Studio roster and attendance.',
    permissions: [
      p('employees.view', 'View Employees'),
      p('employees.create', 'Create Employee', ALL, true),
      p('employees.edit', 'Edit Employee', ALL, true),
      p('employees.delete', 'Delete Employee', ALL, true),
      p('employees.assign', 'Assign Employee'),
      p('employees.view_performance', 'View Employee Performance'),
      p('employees.manage_attendance', 'Manage Employee Attendance'),
    ],
  },
  {
    id: 'freelancers',
    label: 'Freelancers',
    description: 'External crew and payouts.',
    permissions: [
      p('freelancers.view', 'View Freelancers'),
      p('freelancers.create', 'Create Freelancer'),
      p('freelancers.edit', 'Edit Freelancer'),
      p('freelancers.delete', 'Delete Freelancer', ALL, true),
      p('freelancers.assign', 'Assign Freelancer', RECORD),
      p('freelancers.view_projects', 'View Freelancer Projects', RECORD),
      p('freelancers.manage_payments', 'Manage Freelancer Payments', ALL, true),
    ],
  },
  {
    id: 'vendors',
    label: 'Vendors',
    description: 'Makeup, decor and partner vendors.',
    permissions: [
      p('vendors.view', 'View Vendors'),
      p('vendors.create', 'Create Vendor'),
      p('vendors.edit', 'Edit Vendor'),
      p('vendors.delete', 'Delete Vendor', ALL, true),
      p('vendors.assign', 'Assign Vendor', RECORD),
      p('vendors.manage_payments', 'Manage Vendor Payments', ALL, true),
    ],
  },
  {
    id: 'tasks',
    label: 'Tasks',
    description: 'Editing and studio tasks.',
    permissions: [
      p('tasks.view', 'View Tasks', RECORD),
      p('tasks.create', 'Create Tasks'),
      p('tasks.edit', 'Edit Tasks', RECORD),
      p('tasks.delete', 'Delete Tasks', RECORD, true),
      p('tasks.assign', 'Assign Tasks', RECORD),
      p('tasks.change_status', 'Change Task Status', RECORD),
      p('tasks.view_team', 'View Team Tasks'),
    ],
  },
  {
    id: 'calendar',
    label: 'Calendar',
    description: 'Studio and personal calendars.',
    permissions: [
      p('calendar.view', 'View Calendar'),
      p('calendar.create', 'Create Event'),
      p('calendar.edit', 'Edit Event', RECORD),
      p('calendar.delete', 'Delete Event', RECORD, true),
      p('calendar.view_team', 'View Team Calendar'),
      p('calendar.view_personal', 'View Personal Calendar'),
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    description: 'Invoices, payments and expenses. Restricted by default.',
    permissions: [
      p('finance.view_invoices', 'View Invoices', RECORD, true),
      p('finance.create_invoice', 'Create Invoice', ALL, true),
      p('finance.edit_invoice', 'Edit Invoice', RECORD, true),
      p('finance.delete_invoice', 'Delete Invoice', RECORD, true),
      p('finance.view_payments', 'View Payments', RECORD, true),
      p('finance.record_payment', 'Record Payment', RECORD, true),
      p('finance.manage_expenses', 'Manage Expenses', RECORD, true),
      p('finance.approve_expenses', 'Approve Expenses', ALL, true),
      p('finance.view_reports', 'View Financial Reports', ALL, true),
      p('finance.export', 'Export Financial Data', ALL, true),
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    description: 'Studio reporting and exports.',
    permissions: [
      p('reports.view', 'View Reports'),
      p('reports.create', 'Create Reports'),
      p('reports.export', 'Export Reports', ALL, true),
      p('reports.view_financial', 'View Financial Reports', ALL, true),
      p('reports.view_employee', 'View Employee Reports'),
      p('reports.view_wedding', 'View Wedding Reports', RECORD),
      p('reports.view_sales', 'View Sales Reports'),
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Studio and client messages.',
    permissions: [
      p('notifications.view', 'View Notifications'),
      p('notifications.send', 'Send Notifications'),
      p('notifications.send_client', 'Send Client Notifications'),
      p('notifications.send_team', 'Send Team Notifications'),
      p('notifications.manage_templates', 'Manage Notification Templates'),
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Studio configuration and administration.',
    permissions: [
      p('settings.view', 'View Settings'),
      p('settings.edit', 'Edit Settings', ALL, true),
      p('settings.manage_users', 'Manage Users', ALL, true),
      p('settings.manage_roles', 'Manage Roles', ALL, true),
      p('settings.manage_permissions', 'Manage Permissions', ALL, true),
      p('settings.manage_integrations', 'Manage Integrations', ALL, true),
    ],
  },
];

export const ALL_PERMISSIONS = PERMISSION_MODULES.flatMap((m) => m.permissions);
export const ALL_PERMISSION_KEYS = ALL_PERMISSIONS.map((p) => p.key);
export const SENSITIVE_KEYS = new Set(ALL_PERMISSIONS.filter((p) => p.sensitive).map((p) => p.key));

export function findPermission(key: string) {
  return ALL_PERMISSIONS.find((p) => p.key === key);
}

export function moduleOf(key: string) {
  return PERMISSION_MODULES.find((m) => m.permissions.some((p) => p.key === key));
}
