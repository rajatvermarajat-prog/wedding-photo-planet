import type { ReactNode } from 'react';
import { LandingFooter } from '@/features/landing/components/LandingFooter';
import { LandingNavbar } from '@/features/landing/components/LandingNavbar';
import { displayFont, sansFont } from '@/lib/fonts';

/**
 * Bootstrap for the scroll-reveal system.
 *
 * Runs during parse, before the sections below it paint, and marks the wrapper
 * as script-capable — which is what arms the hidden starting state in CSS. If
 * scripting is unavailable the attribute is never set and every section renders
 * visibly, so the page can never end up blank below the fold.
 *
 * The timer is the second half of that guarantee: above-the-fold reveals are
 * marked shown the moment React hydrates, so if nothing has been marked after
 * 2.5s, hydration did not happen and we drop back to the visible state.
 */
const revealBootstrap = `
(function () {
  var root = document.currentScript && document.currentScript.parentElement;
  if (!root) return;
  root.setAttribute('data-ed-js', 'true');
  setTimeout(function () {
    if (!root.querySelector('[data-shown="true"]')) root.removeAttribute('data-ed-js');
  }, 2500);
})();
`;

/**
 * Public marketing shell.
 *
 * The editorial font variables and the `.wpp-ed` token scope are applied here
 * rather than on <html>, so the authenticated CRM keeps its existing
 * system-font rendering and token set untouched.
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div
      suppressHydrationWarning
      className={`${displayFont.variable} ${sansFont.variable} wpp-ed min-h-screen`}
    >
      <script dangerouslySetInnerHTML={{ __html: revealBootstrap }} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-[var(--ed-brass)] focus:px-4 focus:py-2 focus:text-[0.8125rem] focus:font-semibold focus:text-[var(--ed-ink)]"
      >
        Skip to content
      </a>
      <LandingNavbar />
      <main id="main">{children}</main>
      <LandingFooter />
    </div>
  );
}
