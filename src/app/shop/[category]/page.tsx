import { sanityClient } from '@/sanity/client';
import { productsByCategoryQuery } from '@/sanity/queries';
import { ProductCard } from '@/components/ProductCard';
import type { ProductSummary } from '@/sanity/types';

export const revalidate = 60;

const KNOWN_CATEGORIES = ['kabelky', 'kufry'];

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  let products: ProductSummary[] = [];
  try {
    products = await sanityClient.fetch<ProductSummary[]>(productsByCategoryQuery, {
      slug: category,
    });
  } catch {
    /* Sanity not configured — fall through to empty state for known categories. */
    if (!KNOWN_CATEGORIES.includes(category)) {
      const { notFound } = await import('next/navigation');
      notFound();
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Kategorie</p>
      <h1 className="font-display mt-2 text-5xl font-medium capitalize md:text-6xl">{category}</h1>
      {products.length === 0 ? (
        <p className="mt-12 text-neutral-500">V této kategorii zatím nic není.</p>
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
