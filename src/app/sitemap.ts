import type { MetadataRoute } from 'next';
import { groq } from 'next-sanity';
import { sanityClient } from '@/sanity/client';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://levstra.cz';

const productSlugsQuery = groq`*[_type=="product" && active==true].slug.current`;
const postSlugsQuery = groq`*[_type=="post" && published==true].slug.current`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '',
    '/shop',
    '/shop/kabelky',
    '/shop/kufry',
    '/o-nas',
    '/blog',
    '/doprava',
    '/vraceni',
    '/kontakt',
    '/obchodni-podminky',
    '/gdpr',
    '/cookies',
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1.0 : 0.7,
  }));

  let productSlugs: string[] = [];
  let postSlugs: string[] = [];
  try {
    [productSlugs, postSlugs] = await Promise.all([
      sanityClient.fetch<string[]>(productSlugsQuery),
      sanityClient.fetch<string[]>(postSlugsQuery),
    ]);
  } catch {}

  const productRoutes = productSlugs.map((slug) => ({
    url: `${BASE}/shop/p/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const postRoutes = postSlugs.map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...postRoutes];
}
