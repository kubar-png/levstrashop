import { sanityClient } from '@/sanity/client';
import { productsByCategoryQuery } from '@/sanity/queries';
import { ProductCard } from '@/components/ProductCard';
import type { ProductSummary } from '@/sanity/types';
import { notFound } from 'next/navigation';

export const revalidate = 60;

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
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="text-4xl font-semibold capitalize tracking-tight">{category}</h1>
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
