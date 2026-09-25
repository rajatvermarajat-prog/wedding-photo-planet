import { PanelShell } from '@/features/freelancer-growth/FreelancerPanel';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PanelShell>{children}</PanelShell>;
}
