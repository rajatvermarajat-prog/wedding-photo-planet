import { LandingFooter } from '@/features/landing/components/LandingFooter';
import { LandingNavbar } from '@/features/landing/components/LandingNavbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#302C2E]">
      <LandingNavbar />
      <main>{children}</main>
      <LandingFooter />
    </div>
  );
}
