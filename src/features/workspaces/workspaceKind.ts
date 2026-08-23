import { AccessRole } from '@/features/access';

export type WorkspaceKind =
  | 'admin'
  | 'manager'
  | 'employee'
  | 'freelancer'
  | 'photographer'
  | 'cinematographer'
  | 'photo_editor'
  | 'video_editor'
  | 'sales'
  | 'finance'
  | 'hr'
  | 'client';

const KIND_BY_ROLE: Record<string, WorkspaceKind> = {
  super_admin: 'admin',
  admin: 'admin',
  manager: 'manager',
  employee: 'employee',
  freelancer: 'freelancer',
  photographer: 'photographer',
  cinematographer: 'cinematographer',
  photo_editor: 'photo_editor',
  video_editor: 'video_editor',
  sales_executive: 'sales',
  accountant: 'finance',
  hr: 'hr',
  client: 'client',
};

export function workspaceKind(role?: AccessRole): WorkspaceKind {
  if (!role) return 'employee';
  return KIND_BY_ROLE[role.id] || (role.name.toLowerCase().includes('client') ? 'client' : 'employee');
}

export const WORKSPACE_COPY: Record<WorkspaceKind, { eyebrow: string; title: string; blurb: string }> = {
  admin: { eyebrow: 'Administration', title: 'Admin Desk', blurb: 'Studio-wide control stays in the main Admin modules.' },
  manager: { eyebrow: 'Production Desk', title: 'Manager Panel', blurb: 'Weddings, crew, shoots and today\'s studio floor.' },
  employee: { eyebrow: 'My Work', title: 'Employee Panel', blurb: 'Your tasks, schedule, attendance and assigned jobs.' },
  freelancer: { eyebrow: 'Assigned Work', title: 'Freelancer Panel', blurb: 'Only the shoots, deliverables and payouts assigned to you.' },
  photographer: { eyebrow: 'On-set Desk', title: 'Photographer Panel', blurb: 'Assigned shoots, brief, uploads and completion.' },
  cinematographer: { eyebrow: 'Picture Desk', title: 'Cinematographer Panel', blurb: 'Video shoots, footage status and deliverables.' },
  photo_editor: { eyebrow: 'Edit Bay', title: 'Photo Editor Panel', blurb: 'Assigned albums, selections, review and revisions.' },
  video_editor: { eyebrow: 'Edit Bay', title: 'Video Editor Panel', blurb: 'Teaser, highlight and film pipeline for assigned weddings.' },
  sales: { eyebrow: 'Lead Desk', title: 'Sales Panel', blurb: 'Inquiries, follow-ups, quotations and bookings.' },
  finance: { eyebrow: 'Accounts', title: 'Finance Panel', blurb: 'Invoices, collections, expenses and freelancer payouts.' },
  hr: { eyebrow: 'People Desk', title: 'HR Panel', blurb: 'Roster, attendance, leave and employee records.' },
  client: { eyebrow: 'Your Wedding', title: 'Client Gallery', blurb: 'Events, photos, films, approvals and payments — just yours.' },
};
