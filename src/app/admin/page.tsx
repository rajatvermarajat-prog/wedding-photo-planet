import { redirect } from 'next/navigation';
import { AdminRedirectNotice } from '@/components/experience/ExperienceLayouts';

export default function AdminIndexPage() {
  redirect('/dashboard');
  return <AdminRedirectNotice />;
}
