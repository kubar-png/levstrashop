import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://ciaobag.cz';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/studio/', '/cart', '/checkout'] },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
