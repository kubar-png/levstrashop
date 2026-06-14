import { getShopProducts } from '@/lib/data';
import { ShopClient } from '@/components/ShopClient';

export const revalidate = 60;
export const metadata = { title: 'E-shop — Ciaobag' };

const VALID = ['all', 'kabelky', 'kufry'] as const;
type Cat = (typeof VALID)[number];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: rawCat } = await searchParams;
  const cat: Cat = VALID.includes(rawCat as Cat) ? (rawCat as Cat) : 'all';

  // Load the full catalog once; category/subcategory/price all filter
  // client-side in ShopClient so switching never reloads the whole page.
  const products = await getShopProducts('all');

  return <ShopClient products={products} initialCategory={cat} />;
}
