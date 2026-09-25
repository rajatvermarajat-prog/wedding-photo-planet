import { FreelancerLandingPage } from '@/features/freelancer-growth/FreelancerPublic';
import { displayFont, sansFont } from '@/lib/fonts';

export default function Page() {
  return <div className={`${displayFont.variable} ${sansFont.variable}`}><FreelancerLandingPage /></div>;
}
