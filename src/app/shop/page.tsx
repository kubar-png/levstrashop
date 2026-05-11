import { getAllProducts } from '@/lib/data';
import { ProductCard } from '@/components/ProductCard';

export const revalidate = 60;
export const metadata = { title: 'E-shop — Levstra' };

export default async function ShopPage() {
  const products = await getAllProducts();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Kolekce</p>
      <h1 className="font-display mt-2 text-5xl font-medium md:text-6xl">E-shop</h1>
      <p className="mt-3 text-neutral-600">Všechny kabelky a kufry.</p>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
