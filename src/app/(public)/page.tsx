import type { Metadata } from 'next';
import { LandingPage } from '@/features/landing/components/LandingPage';

export const metadata: Metadata = {
  title: 'Wedding Photo Planet — studio operations for wedding photography',
  description:
    'A working CRM for wedding photography studios: inquiries, projects, shoots, crew, freelancers and payments on one record. Client galleries and the freelancer portal are in build.',
  openGraph: {
    title: 'Wedding Photo Planet',
    description:
      'Studio operations for wedding photography — from the first inquiry to the photographs a couple keeps.',
    images: ['/images/wedding-band.jpg'],
  },
};

export default function PublicHomePage() {
  return <LandingPage />;
}
