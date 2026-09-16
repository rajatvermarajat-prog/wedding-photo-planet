export const ACCESS_COOKIE = 'wpp_access_token';
export const REFRESH_COOKIE = 'wpp_refresh_token';
export const CLIENT_SESSION_COOKIE = 'wpp_client_session';

const PUBLIC_PREFIXES = [
  '/login',
  '/freelancers/join',
];

const PUBLIC_FILES = [
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

export function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_FILES.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function isFrameworkRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/images/')
  );
}

export function hasAuthCookie(cookies: { has: (name: string) => boolean }): boolean {
  return cookies.has(ACCESS_COOKIE) || cookies.has(REFRESH_COOKIE) || cookies.has(CLIENT_SESSION_COOKIE);
}

export function safeReturnPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard';
  if (isPublicRoute(value) || isFrameworkRoute(value)) return '/dashboard';
  return value;
}
