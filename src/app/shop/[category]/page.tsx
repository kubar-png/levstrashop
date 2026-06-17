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

const DESCRIPTIONS: Record<Cat, string> = {
  kabelky:
    'Dámské kabelky Marina Galanti — elegantní italský design pro každý den i výjimečné příležitosti. Nakupte u Ciaobag, doprava zdarma nad 1 500 Kč.',
  kufry:
    'Cestovní kufry Marina Galanti — lehké, stylové a odolné na každou cestu. Vyberte si u Ciaobag, doprava zdarma nad 1 500 Kč, doručení PPL.',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const c = category as Cat;
  if (!(KNOWN as readonly string[]).includes(c)) return { title: 'E-shop — Ciaobag' };
  return {
    title: `${TITLES[c]} — Ciaobag`,
    description: DESCRIPTIONS[c],
    alternates: { canonical: `/shop/${c}` },
  };
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
