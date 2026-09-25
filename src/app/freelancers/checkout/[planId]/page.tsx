import { CheckoutPage } from '@/features/freelancer-growth/FreelancerPublic';
import { displayFont, sansFont } from '@/lib/fonts';

export default async function Page({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  return <div className={`${displayFont.variable} ${sansFont.variable}`}><CheckoutPage planId={planId} /></div>;
}
