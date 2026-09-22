import type { NextConfig } from 'next';

const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
const configuredApiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/$/, '');
const publicApiProxyTarget = publicApiUrl?.startsWith('http')
  ? publicApiUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '')
  : undefined;
const apiProxyTarget =
  configuredApiProxyTarget ??
  publicApiProxyTarget ??
  (process.env.NODE_ENV !== 'production' && publicApiUrl?.startsWith('/') ? 'http://localhost:5050' : undefined);

/**
 * A relative NEXT_PUBLIC_API_URL (the recommended setting, so auth cookies stay
 * first-party) only works if Next actually proxies it somewhere. Without a
 * resolvable target the rewrite list is empty and every browser API call — the
 * login POST included — hits the frontend's own 404 page. Fail the build rather
 * than ship an app that cannot authenticate.
 */
if (
  process.env.NODE_ENV === 'production' &&
  !apiProxyTarget &&
  (publicApiUrl?.startsWith('/') ?? true)
) {
  throw new Error(
    'API_PROXY_TARGET is not set. Set it to the backend origin (for example ' +
      'https://your-backend.vercel.app) so Next can proxy /api/v1/* to the API, ' +
      'or set NEXT_PUBLIC_API_URL to an absolute backend URL.',
  );
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  /**
   * Proxy browser API calls through Next so auth cookies stay first-party to
   * the CRM origin. This avoids third-party cookie loss on /auth/refresh when
   * the backend is hosted on a separate domain.
   */
  async rewrites() {
    if (!apiProxyTarget) return [];
    return [{
      source: '/api/v1/:path*',
      destination: `${apiProxyTarget}/api/v1/:path*`,
    }];
  },
};

export default nextConfig;
