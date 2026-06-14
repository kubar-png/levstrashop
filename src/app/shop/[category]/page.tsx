import { notFound } from 'next/navigation';
import { getShopProducts } from '@/lib/data';
import { ShopClient } from '@/components/ShopClient';

export const revalidate = 60;

const KNOWN = ['kabelky', 'kufry'] as const;
type Cat = (typeof KNOWN)[number];

const TITLES: Record<Cat, string> = {
  kabelky: 'Kabelky',
  kufry: 'Kufry',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const c = category as Cat;
  if (!(KNOWN as readonly string[]).includes(c)) return { title: 'E-shop — Ciaobag' };
  return { title: `${TITLES[c]} — Ciaobag` };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!(KNOWN as readonly string[]).includes(category)) notFound();
  const cat = category as Cat;

  // Same full-catalog load as /shop — ShopClient filters to `cat` client-side.
  const products = await getShopProducts('all');

  return <ShopClient products={products} initialCategory={cat} />;
}
