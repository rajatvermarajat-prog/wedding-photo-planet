export const ACCESS_COOKIE = 'wpp_access_token';
export const REFRESH_COOKIE = 'wpp_refresh_token';
export const CLIENT_SESSION_COOKIE = 'wpp_client_session';
export const FREELANCER_ACCESS_COOKIE = 'wpp_freelancer_access_token';
export const FREELANCER_REFRESH_COOKIE = 'wpp_freelancer_refresh_token';
export const FREELANCER_SESSION_COOKIE = 'wpp_freelancer_session';

const PUBLIC_PREFIXES = [
  '/login',
  '/pricing',
  '/contact',
  '/services',
  '/privacy',
  '/terms',
  '/client',
  '/freelancers/join',
];

const PUBLIC_FREELANCER_ROUTES = ['/freelancer/login', '/freelancer/join'];
const PROTECTED_FREELANCER_PREFIXES = ['/freelancer'];

const PUBLIC_ROUTES = [
  '/',
];

const PUBLIC_FILES = [
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

export function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  if (PUBLIC_FILES.includes(pathname)) return true;
  if (PUBLIC_FREELANCER_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) return true;
  return PUBLIC_PREFIXES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function isFreelancerRoute(pathname: string): boolean {
  return PROTECTED_FREELANCER_PREFIXES.some((route) => pathname === route || pathname.startsWith(`${route}/`)) &&
    !PUBLIC_FREELANCER_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
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

export function hasFreelancerAuthCookie(cookies: { has: (name: string) => boolean }): boolean {
  return cookies.has(FREELANCER_ACCESS_COOKIE) || cookies.has(FREELANCER_REFRESH_COOKIE) || cookies.has(FREELANCER_SESSION_COOKIE);
}

export function safeReturnPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard';
  if (isPublicRoute(value) || isFrameworkRoute(value)) return '/dashboard';
  return value;
}
