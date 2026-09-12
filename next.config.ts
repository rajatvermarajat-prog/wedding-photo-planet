import type { NextConfig } from 'next';

const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/$/, '');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  // Keep browser API calls same-origin while forwarding them to the standalone
  // backend.  Without this rewrite, NEXT_PUBLIC_API_URL=/api/v1 resolves to
  // localhost:3000/api/v1 and Next returns a 404 because it has no such route.
  async rewrites() {
    if (!apiProxyTarget) return [];

    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiProxyTarget}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
