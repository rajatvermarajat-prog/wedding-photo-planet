import { describe, expect, it } from 'vitest';
import { ACCESS_COOKIE, REFRESH_COOKIE, hasAuthCookie, isFrameworkRoute, isPublicRoute, safeReturnPath } from './routeProtection';

const cookies = (...names: string[]) => ({
  has: (name: string) => names.includes(name),
});

describe('route protection helpers', () => {
  it('keeps login and public freelancer registration routes public', () => {
    expect(isPublicRoute('/login')).toBe(true);
    expect(isPublicRoute('/freelancers/join')).toBe(true);
    expect(isPublicRoute('/dashboard')).toBe(false);
  });

  it('ignores framework and API paths', () => {
    expect(isFrameworkRoute('/_next/static/chunk.js')).toBe(true);
    expect(isFrameworkRoute('/api/v1/auth/me')).toBe(true);
    expect(isFrameworkRoute('/images/wedding-login-hero.png')).toBe(true);
    expect(isFrameworkRoute('/projects/new')).toBe(false);
  });

  it('accepts either backend auth cookie so refresh sessions can reach the app', () => {
    expect(hasAuthCookie(cookies())).toBe(false);
    expect(hasAuthCookie(cookies(ACCESS_COOKIE))).toBe(true);
    expect(hasAuthCookie(cookies(REFRESH_COOKIE))).toBe(true);
  });

  it('allows only protected local return paths', () => {
    expect(safeReturnPath('/projects/new')).toBe('/projects/new');
    expect(safeReturnPath('/dashboard?_rsc=abc')).toBe('/dashboard?_rsc=abc');
    expect(safeReturnPath('/login')).toBe('/dashboard');
    expect(safeReturnPath('/freelancers/join')).toBe('/dashboard');
    expect(safeReturnPath('https://evil.test')).toBe('/dashboard');
    expect(safeReturnPath('//evil.test')).toBe('/dashboard');
    expect(safeReturnPath(null)).toBe('/dashboard');
  });
});
