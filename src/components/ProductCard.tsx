import Link from 'next/link';
import { ProductImage } from './ProductImage';
import { formatPrice, colorToSlug } from '@/lib/format';
import type { ProductSummaryView } from '@/lib/data';

type ColorSwatch = { slug: string; colorHex: string; isCurrent: boolean };

export function ProductCard({
  product,
  colorSwatches,
}: {
  product: ProductSummaryView;
  colorSwatches?: ColorSwatch[];
}) {
  const href = product.heroColor
    ? `/shop/p/${product.slug}?barva=${colorToSlug(product.heroColor)}`
    : `/shop/p/${product.slug}`;

  return (
    <Link href={href} className="group block">
      <ProductImage
        src={product.imageUrl}
        alt={product.title}
        placeholder={product.placeholder}
        sizes="(min-width: 1024px) 25vw, 50vw"
      />
      <div className="mt-3 flex flex-col gap-1.5 px-1">
        <h3
          className="font-poppins-semibold leading-snug transition-colors group-hover:text-[var(--color-forest)]"
          style={{
            fontSize: 'var(--text-body)',
            color: 'var(--color-ink)',
          }}
        >
          {product.title}
        </h3>
        <p
          style={{
            fontSize: 'var(--text-small)',
            color: 'var(--color-text-muted)',
          }}
        >
          {formatPrice(product.minPriceCents)}
        </p>

        {/* Color group swatches (Riga-type siblings: clickable links) */}
        {colorSwatches && colorSwatches.length > 1 && (
          <div className="flex gap-1.5 mt-1">
            {colorSwatches.slice(0, 6).map((sw) =>
              sw.isCurrent ? (
                <span
                  key={sw.slug}
                  className="h-4 w-4 rounded-full"
                  style={{
                    background: sw.colorHex,
                    boxShadow: `0 0 0 1.5px white, 0 0 0 2.5px ${sw.colorHex}`,
                  }}
                />
              ) : (
                <Link
                  key={sw.slug}
                  href={`/shop/p/${sw.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 rounded-full transition hover:scale-110"
                  style={{
                    background: sw.colorHex,
                    boxShadow: '0 0 0 1px var(--color-border-strong)',
                    display: 'block',
                  }}
                  title={sw.slug}
                />
              ),
            )}
          </div>
        )}

        {/* Variant color dots (kabelky: static visual indicators) */}
        {(!colorSwatches || colorSwatches.length <= 1) &&
          product.variantColorHexes &&
          product.variantColorHexes.length > 1 && (
            <div className="flex gap-1.5 mt-1">
              {product.variantColorHexes.slice(0, 6).map((hex, i) => (
                <span
                  key={i}
                  className="h-4 w-4 rounded-full"
                  style={{
                    background: hex,
                    boxShadow: '0 0 0 1px var(--color-border-strong)',
                  }}
                />
              ))}
            </div>
          )}
      </div>
    </Link>
  );
}
