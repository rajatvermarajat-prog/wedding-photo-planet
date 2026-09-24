import type { Metadata, Viewport } from 'next';
import { AuthSessionProvider } from '@/components/auth/AuthSessionProvider';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://weddingphotoplanet.com'),
  title: { default: 'Wedding Photo Planet CRM', template: '%s | WPP CRM' },
  description: 'Wedding Photo Planet studio operations and client relationship management.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F7F6F3',
};

const chunkRecoveryScript = `
(function () {
  var KEY = 'wpp_next_chunk_reload';
  function isNextChunk(url) {
    return typeof url === 'string' && url.indexOf('/_next/static/') !== -1 && /\\.js(\\?|$)/.test(url);
  }
  function recover() {
    try {
      if (sessionStorage.getItem(KEY) === '1') return;
      sessionStorage.setItem(KEY, '1');
      var url = new URL(window.location.href);
      url.searchParams.set('__refresh', Date.now().toString());
      window.location.replace(url.toString());
    } catch {
      window.location.reload();
    }
  }
  window.addEventListener('error', function (event) {
    var target = event && event.target;
    if (target && target.tagName === 'SCRIPT' && isNextChunk(target.src)) recover();
  }, true);
  window.addEventListener('unhandledrejection', function (event) {
    var reason = event && event.reason;
    var message = String((reason && (reason.message || reason.stack)) || reason || '');
    if (/Loading chunk|ChunkLoadError|_next\\/static/.test(message)) recover();
  });
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <script dangerouslySetInnerHTML={{ __html: chunkRecoveryScript }} />
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
