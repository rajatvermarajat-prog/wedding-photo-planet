import type { NextConfig } from 'next';

const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
const configuredApiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/$/, '');
const publicApiProxyTarget = publicApiUrl?.startsWith('http')
  ? publicApiUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '')
  : undefined;
const defaultApiProxyTarget = 'https://wedding-photo-planet-backend.vercel.app';
const apiProxyTarget =
  configuredApiProxyTarget ??
  publicApiProxyTarget ??
  (process.env.NODE_ENV !== 'production' && publicApiUrl?.startsWith('/') ? 'http://localhost:5050' : undefined) ??
  (publicApiUrl?.startsWith('/') ?? true ? defaultApiProxyTarget : undefined);

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
