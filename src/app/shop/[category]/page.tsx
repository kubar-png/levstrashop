import { getProductsByCategory } from '@/lib/data';
import { ProductCard } from '@/components/ProductCard';
import { notFound } from 'next/navigation';

export const revalidate = 60;

const KNOWN = new Set(['kabelky', 'kufry']);

const TITLE: Record<string, string> = {
  kabelky: 'Kabelky',
  kufry: 'Kufry',
};

const SUBTITLE: Record<string, string> = {
  kabelky: 'Pro každý den i pro výjimečné chvíle.',
  kufry: 'Cestovní zavazadla pro letiště i víkend.',
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!KNOWN.has(category)) notFound();
  const products = await getProductsByCategory(category);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Kategorie</p>
      <h1 className="font-display mt-2 text-5xl font-medium md:text-6xl">{TITLE[category]}</h1>
      <p className="mt-3 max-w-xl text-neutral-600">{SUBTITLE[category]}</p>

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
