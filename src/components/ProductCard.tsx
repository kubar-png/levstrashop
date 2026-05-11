import Link from 'next/link';
import { ProductImage } from './ProductImage';
import { formatPrice } from '@/lib/format';
import type { ProductSummaryView } from '@/lib/data';

export function ProductCard({ product }: { product: ProductSummaryView }) {
  return (
    <Link href={`/shop/p/${product.slug}`} className="group block">
      <ProductImage
        src={product.imageUrl}
        alt={product.title}
        placeholder={product.placeholder}
        sizes="(min-width: 1024px) 25vw, 50vw"
      />
      <div className="mt-3 flex flex-col gap-1 px-1">
        <h3 className="text-sm font-semibold text-neutral-900">{product.title}</h3>
        <p className="text-sm text-neutral-700">{formatPrice(product.minPriceCents)}</p>
      </div>
    </Link>
  );
}
