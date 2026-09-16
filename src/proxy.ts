import { NextRequest, NextResponse } from 'next/server';
import { hasAuthCookie, isFrameworkRoute, isPublicRoute, safeReturnPath } from '@/lib/auth/routeProtection';

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (isFrameworkRoute(pathname)) return NextResponse.next();

  const authenticated = hasAuthCookie(request.cookies);

  if (isPublicRoute(pathname)) {
    if (pathname === '/login' && authenticated) {
      const redirectTo = request.nextUrl.clone();
      redirectTo.pathname = safeReturnPath(request.nextUrl.searchParams.get('returnTo'));
      redirectTo.search = '';
      return NextResponse.redirect(redirectTo);
    }
    return NextResponse.next();
  }

  if (!authenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    const returnTo = `${pathname}${search}`;
    if (safeReturnPath(returnTo) === returnTo) loginUrl.searchParams.set('returnTo', returnTo);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
