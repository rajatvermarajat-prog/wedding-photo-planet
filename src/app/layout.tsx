import type { Metadata, Viewport } from 'next';
import { AuthSessionProvider } from '@/components/auth/AuthSessionProvider';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Wedding Photo Planet CRM', template: '%s | WPP CRM' },
  description: 'Wedding Photo Planet studio operations and client relationship management.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F7F6F3',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><AuthSessionProvider>{children}</AuthSessionProvider></body>
    </html>
  );
}
