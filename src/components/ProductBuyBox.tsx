'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import type { ProductView, VariantView } from '@/lib/data';

export function ProductBuyBox({
  product,
  selectedVariant,
  onVariantChange,
}: {
  product: ProductView;
  selectedVariant: VariantView;
  onVariantChange: (v: VariantView) => void;
}) {
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
    if (match) onVariantChange(match);
  }

  function handleAdd() {
    add({
      productId: product._id,
      variantSku: selectedVariant.sku,
      title: product.title,
      image: product.imageUrls[0],
      size: selectedVariant.size,
      color: selectedVariant.color,
      priceCents: selectedVariant.priceCents,
      qty: 1,
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const outOfStock = selectedVariant.stock <= 0;
  const hasSiblings = product.colorSiblings && product.colorSiblings.length > 0;

  const sizeLabel = (s: string) => {
    if (s.startsWith('cabin-'))  return `Kabinový ${s.split('-')[1]} cm`;
    if (s.startsWith('medium-')) return `Střední ${s.split('-')[1]} cm`;
    if (s.startsWith('large-'))  return `Velký ${s.split('-')[1]} cm`;
    if (s === 'one-size') return 'Univerzální';
    return s;
  };

  return (
    <div className="mt-6 space-y-6">

      {/* ── Price ── */}
      <p
        className="font-serif leading-none"
        style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', color: 'var(--color-forest)' }}
      >
        {formatPrice(selectedVariant.priceCents)}
      </p>

      {/* ── Sibling color navigation (separate product per color) ── */}
      {hasSiblings && (
        <div>
          <p
            className="font-poppins-semibold mb-3"
            style={{ fontSize: '11px', letterSpacing: '0.07em', color: 'var(--color-gray-warm)', textTransform: 'uppercase' }}
          >
            Barva — <span className="font-poppins-regular normal-case">{product.variants[0]?.color}</span>
          </p>
          <div className="flex flex-wrap gap-2.5">
            <span
              title={product.variants[0]?.color}
              className="h-8 w-8 rounded-full"
              style={{
                background: product.colorHex ?? '#ccc',
                boxShadow: `0 0 0 2.5px white, 0 0 0 4px ${product.colorHex ?? '#ccc'}`,
              }}
            />
            {product.colorSiblings!.map((sib) => (
              <Link
                key={sib.slug}
                href={`/shop/p/${sib.slug}`}
                title={sib.title}
                className="block h-8 w-8 rounded-full transition-transform hover:scale-110"
                style={{
                  background: sib.colorHex,
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.12)',
                }}
              >
                <span className="sr-only">{sib.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Within-product color swatches ── */}
      {!hasSiblings && colors.length > 1 && (
        <div>
          <p
            className="font-poppins-semibold mb-3"
            style={{ fontSize: '11px', letterSpacing: '0.07em', color: 'var(--color-gray-warm)', textTransform: 'uppercase' }}
          >
            Barva — <span className="font-poppins-regular normal-case">{selectedVariant.color}</span>
          </p>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((color) => {
              const variant = product.variants.find((v) => v.color === color);
              const hex = variant?.colorHex ?? '#ccc';
              const isSelected = selectedVariant.color === color;
              return (
                <button
                  key={color}
                  onClick={() => pickVariant(selectedVariant.size, color)}
                  title={color}
                  className="h-8 w-8 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: hex,
                    boxShadow: isSelected
                      ? `0 0 0 2.5px white, 0 0 0 4px ${hex}`
                      : '0 0 0 1px rgba(0,0,0,0.15)',
                  }}
                >
                  <span className="sr-only">{color}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Size picker ── */}
      {sizes.length > 0 && (
        <div>
          <p
            className="font-poppins-semibold mb-3"
            style={{ fontSize: '11px', letterSpacing: '0.07em', color: 'var(--color-gray-warm)', textTransform: 'uppercase' }}
          >
            Velikost
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const active = selectedVariant.size === size;
              return (
                <button
                  key={size}
                  onClick={() => pickVariant(size, selectedVariant.color)}
                  className="rounded-xl border-2 px-4 py-2 font-poppins-semibold transition-all duration-200"
                  style={{
                    fontSize: '12px',
                    borderColor: active ? 'var(--color-forest)' : 'rgba(43,49,47,0.15)',
                    background: active ? 'var(--color-forest)' : 'transparent',
                    color: active ? '#fff' : 'var(--color-ink)',
                  }}
                >
                  {sizeLabel(size)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <div className="space-y-3 pt-2">
        <button
          onClick={handleAdd}
          disabled={outOfStock || added}
          className="marina-btn w-full rounded-2xl border-2 py-4 font-poppins-semibold disabled:opacity-50"
          style={{
            borderColor: outOfStock ? 'rgba(43,49,47,0.2)' : 'var(--color-ink)',
            fontSize: '15px',
            letterSpacing: '-0.01em',
          }}
        >
          <span
            className="marina-btn-text"
            style={{ color: outOfStock ? 'var(--color-gray-warm)' : 'var(--color-ink)' }}
          >
            {outOfStock ? 'Vyprodáno' : added ? '✓ Přidáno do košíku' : 'Přidat do košíku'}
          </span>
        </button>

        {/* Stock nudge */}
        {!outOfStock && selectedVariant.stock <= 5 && (
          <p
            className="font-poppins-regular text-center"
            style={{ fontSize: '12px', color: 'var(--color-orange)' }}
          >
            Zbývá již jen {selectedVariant.stock} {selectedVariant.stock === 1 ? 'kus' : 'kusy'}
          </p>
        )}
      </div>

      {/* ── Meta ── */}
      <div
        className="rounded-2xl px-5 py-4 space-y-1.5"
        style={{ background: 'var(--color-cream)' }}
      >
        <div className="flex justify-between">
          <span className="font-poppins-regular" style={{ fontSize: '12px', color: 'var(--color-gray-warm)' }}>SKU</span>
          <span className="font-poppins-semibold tabular-nums" style={{ fontSize: '12px', color: 'var(--color-ink)' }}>{selectedVariant.sku}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-poppins-regular" style={{ fontSize: '12px', color: 'var(--color-gray-warm)' }}>Skladem</span>
          <span className="font-poppins-semibold tabular-nums" style={{ fontSize: '12px', color: 'var(--color-ink)' }}>{selectedVariant.stock} ks</span>
        </div>
        {selectedVariant.weightGrams && (
          <div className="flex justify-between">
            <span className="font-poppins-regular" style={{ fontSize: '12px', color: 'var(--color-gray-warm)' }}>Hmotnost</span>
            <span className="font-poppins-semibold tabular-nums" style={{ fontSize: '12px', color: 'var(--color-ink)' }}>{(selectedVariant.weightGrams / 1000).toFixed(2)} kg</span>
          </div>
        )}
      </div>

      {/* ── Shipping note ── */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: 'var(--color-lime)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 13l4 4L19 7" stroke="var(--color-ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="font-poppins-regular" style={{ fontSize: '13px', color: 'var(--color-gray-warm)' }}>
          Doprava zdarma při objednávce nad 1 500 Kč
        </p>
      </div>

    </div>
  );
}
