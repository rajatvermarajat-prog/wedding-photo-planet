import { redirect } from 'next/navigation';
import { AdminRedirectNotice } from '@/components/experience/ExperienceLayouts';
import { TAB_ROUTES } from '@/components/app/crmRoutes';

const ADMIN_WORKSPACES = new Set(Object.values(TAB_ROUTES).map((route) => route.replace(/^\//, '')));

export function generateStaticParams() {
  return [...ADMIN_WORKSPACES].map((workspace) => ({ workspace }));
}

export default async function AdminWorkspacePage({ params }: { params: Promise<{ workspace: string }> }) {
  const { workspace } = await params;
  redirect(ADMIN_WORKSPACES.has(workspace) ? `/${workspace}` : '/dashboard');
  return <AdminRedirectNotice />;
}
