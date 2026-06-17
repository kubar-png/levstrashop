import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'static.wixstatic.com' },
    ],
  },
  async redirects() {
    // Canonical-domain guard. Arm this only once ciaobag.cz is the live domain
    // (set CANONICAL_REDIRECT=1 in Vercel) — otherwise the current
    // levstrashop.vercel.app production URL would 308 to a domain that isn't up
    // yet and take the live site down with it.
    if (process.env.CANONICAL_REDIRECT !== '1') return [];
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'levstrashop.vercel.app' }],
        destination: 'https://www.ciaobag.cz/:path*',
        permanent: true, // 308 — preserves method, cached by search engines
      },
    ];
  },
};

export default nextConfig;
