'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ProductImage } from './ProductImage';
import { Eyebrow } from '@/components/ui';
import { formatPrice } from '@/lib/format';
import { useCart, type CartItem } from '@/lib/cart';
import type { RecommendationView, VariantView } from '@/lib/data';

function variantLabel(v: VariantView): string {
  return [v.size, v.color].filter(Boolean).join(' · ') || v.sku;
}

export function UpsellSection() {
  const cartItems = useCart((s) => s.items);
  const add = useCart((s) => s.add);
  const openDrawer = useCart((s) => s.openDrawer);

  const ids = useMemo(
    () => Array.from(new Set(cartItems.map((i) => i.productId))).sort(),
    [cartItems],
  );
  const idsKey = ids.join(',');

  const [items, setItems] = useState<RecommendationView[]>([]);

  useEffect(() => {
    if (!idsKey) return;
    let cancelled = false;
    fetch(`/api/recommend?ids=${encodeURIComponent(idsKey)}&limit=4`)
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data: { items: RecommendationView[] }) => {
        if (!cancelled) setItems(data.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  if (!idsKey || items.length === 0) return null;

  function addVariant(product: RecommendationView, variant: VariantView) {
    const item: CartItem = {
      productId: product._id,
      variantSku: variant.sku,
      title: product.title,
      image: product.imageUrl ?? undefined,
      size: variant.size,
      color: variant.color,
      priceCents: variant.priceCents,
      qty: 1,
      slug: product.slug,
    };
    add(item);
    openDrawer();
  }

  return (
    <section style={{ paddingTop: 'var(--section-py)', paddingBottom: '1rem' }}>
      <div className="mb-8">
        <Eyebrow tone="forest" serif size="md">
          Mohlo by se vám líbit
        </Eyebrow>
        <h2
          className="font-poppins-semibold mt-1 leading-[1.1]"
          style={{
            fontSize: 'var(--text-h2)',
            letterSpacing: '-0.025em',
            color: 'var(--color-ink)',
          }}
        >
          Doplňte to k tomu
        </h2>
      </div>

      <div
        className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((p) => {
          const inStock = p.variants.filter((v) => v.stock > 0);
          const single = inStock.length === 1;
          return (
            <div
              key={p._id}
              className="w-[62vw] shrink-0 md:w-auto"
              style={{ scrollSnapAlign: 'start' }}
            >
              <Link href={`/shop/p/${p.slug}`} className="group block">
                <ProductImage
                  src={p.imageUrl}
                  alt={p.title}
                  placeholder={p.placeholder}
                  sizes="(min-width: 768px) 25vw, 62vw"
                />
                <div className="mt-3 flex flex-col gap-1 px-1">
                  <h3
                    className="font-poppins-semibold leading-snug transition-colors group-hover:text-[var(--color-forest)]"
                    style={{ fontSize: 'var(--text-body)', color: 'var(--color-ink)' }}
                  >
                    {p.title}
                  </h3>
                  <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}>
                    {formatPrice(p.minPriceCents)}
                  </p>
                </div>
              </Link>

              {/* Add to cart — one click if single variant, else pick a variant. */}
              <div className="mt-2.5 px-1">
                {single ? (
                  <button
                    type="button"
                    onClick={() => addVariant(p, inStock[0])}
                    className="font-poppins-semibold w-full transition-opacity hover:opacity-85"
                    style={{
                      background: 'var(--color-forest)',
                      color: '#fff',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-small)',
                      padding: '0.6rem 1rem',
                      minHeight: 44,
                    }}
                  >
                    Přidat do košíku
                  </button>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <span
                      style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}
                    >
                      Vyberte variantu:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {inStock.map((v) => (
                        <button
                          key={v.sku}
                          type="button"
                          onClick={() => addVariant(p, v)}
                          className="font-poppins-medium transition-colors hover:bg-[var(--color-forest)] hover:text-white"
                          style={{
                            fontSize: 'var(--text-micro)',
                            color: 'var(--color-ink)',
                            background: '#fff',
                            border: '1.5px solid var(--color-border-strong)',
                            borderRadius: '999px',
                            padding: '0.4rem 0.8rem',
                            minHeight: 36,
                          }}
                        >
                          {variantLabel(v)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
