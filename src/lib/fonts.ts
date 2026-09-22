import { Fraunces, Instrument_Sans } from 'next/font/google';

/**
 * Editorial type pairing for the public marketing surface only.
 *
 * Fraunces carries the display voice: a high-contrast, slightly wonky old-style
 * face that reads as printed matter rather than product UI. Instrument Sans
 * handles body, navigation and metadata at small sizes.
 *
 * These are attached to the (public) layout wrapper — not <html> — so the
 * authenticated CRM keeps its existing system-font rendering untouched.
 */
export const displayFont = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  axes: ['SOFT', 'WONK', 'opsz'],
  variable: '--font-display',
});

export const sansFont = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});
