import { sanityClient } from '@/sanity/client';
import { allProductsQuery } from '@/sanity/queries';
import { ProductCard } from '@/components/ProductCard';
import type { ProductSummary } from '@/sanity/types';
import Link from 'next/link';

export const revalidate = 60;
export const metadata = { title: 'E-shop — Levstra' };

export default async function ShopPage() {
  let products: ProductSummary[] = [];
  try {
    products = await sanityClient.fetch<ProductSummary[]>(allProductsQuery);
  } catch {}

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">E-shop</h1>
      <p className="mt-2 text-neutral-600">Všechny kabelky a kufry.</p>
      {products.length === 0 ? (
        <p className="mt-12 text-neutral-500">
          Zatím žádné produkty. Přidejte je v{' '}
          <Link href="/studio" className="underline">Sanity Studio</Link>.
        </p>
      ) : (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
