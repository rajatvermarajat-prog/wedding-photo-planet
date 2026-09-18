import type { NextConfig } from 'next';

const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
const configuredApiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/$/, '');
const apiProxyTarget =
  configuredApiProxyTarget ??
  (process.env.NODE_ENV !== 'production' && publicApiUrl?.startsWith('/') ? 'http://localhost:5050' : undefined);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  /**
   * In local development, proxy API calls through Next so the browser talks
   * only to localhost. This avoids requiring the production API to grant CORS
   * access to every developer machine, while still forwarding auth headers.
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
