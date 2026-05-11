import { getProductsByCategory } from '@/lib/data';
import { ProductCard } from '@/components/ProductCard';
import { Eyebrow } from '@/components/ui';
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
    <div
      className="mx-auto max-w-7xl px-6"
      style={{
        paddingTop: 'var(--section-py)',
        paddingBottom: 'var(--section-py)',
      }}
    >
      <Eyebrow>Kategorie</Eyebrow>
      <h1
        className="mt-2 font-poppins-semibold"
        style={{
          fontSize: 'var(--text-h1)',
          color: 'var(--color-forest)',
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
        }}
      >
        {TITLE[category]}
      </h1>
      <p
        className="font-serif mt-3 max-w-xl"
        style={{
          fontSize: 'var(--text-lead)',
          color: 'var(--color-text-muted)',
          lineHeight: 1.45,
        }}
      >
        {SUBTITLE[category]}
      </p>

      {products.length === 0 ? (
        <p
          className="mt-12"
          style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-body)' }}
        >
          Pro zvolené filtry jsme nenašli žádné produkty.
        </p>
      ) : (
        <div className="mt-12 grid gap-5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
