'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import { urlFor } from '@/sanity/client';
import type { Product, Variant } from '@/sanity/types';

export function ProductBuyBox({ product }: { product: Product }) {
  const [selected, setSelected] = useState<Variant>(product.variants[0]);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);

  const sizes = Array.from(
    new Set(product.variants.map((v) => v.size).filter((s): s is string => !!s)),
  );
  const colors = Array.from(
    new Set(product.variants.map((v) => v.color).filter((c): c is string => !!c)),
  );

  function pickVariant(size?: string, color?: string) {
    const match = product.variants.find(
      (v) =>
        (size === undefined || v.size === size) &&
        (color === undefined || v.color === color),
    );
    if (match) setSelected(match);
  }

  async function handleAdd() {
    add({
      productId: product._id,
      variantSku: selected.sku,
      title: product.title,
      image: product.images[0] ? urlFor(product.images[0]).width(200).url() : undefined,
      size: selected.size,
      color: selected.color,
      priceCents: selected.priceCents,
      qty: 1,
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const outOfStock = selected.stock <= 0;

  return (
    <div className="mt-6">
      <p className="text-2xl font-semibold">{formatPrice(selected.priceCents)}</p>

      {sizes.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 text-sm font-medium">Velikost</div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => pickVariant(size, selected.color)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  selected.size === size
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-300 hover:border-neutral-900'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 text-sm font-medium">Barva</div>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => pickVariant(selected.size, color)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  selected.color === color
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-300 hover:border-neutral-900'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleAdd}
        disabled={outOfStock}
        className="mt-8 w-full rounded-full bg-neutral-900 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {outOfStock ? 'Vyprodáno' : added ? 'Přidáno ✓' : 'Přidat do košíku'}
      </button>

      <p className="mt-3 text-xs text-neutral-500">
SKU: {selected.sku} · skladem {selected.stock} ks
      </p>
    </div>
  );
}
