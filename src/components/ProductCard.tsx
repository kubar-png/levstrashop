import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from '@/sanity/client';
import { formatPrice } from '@/lib/format';
import type { ProductSummary } from '@/sanity/types';

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Link href={`/shop/p/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-neutral-100">
        {product.image && (
          <Image
            src={urlFor(product.image).width(800).height(1000).url()}
            alt={product.image.alt || product.title}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition group-hover:scale-105"
          />
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-sm font-medium">{product.title}</h3>
        <p className="text-sm text-neutral-600">{formatPrice(product.minPriceCents)}</p>
      </div>
    </Link>
  );
}
