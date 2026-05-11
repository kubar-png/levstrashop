'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import { Chip } from './ui';
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

  const variantLabelStyle = {
    fontSize: 'var(--text-micro)',
    letterSpacing: '0.18em',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase' as const,
  };

  // Swatch wrapper: gives a 44×44 invisible tap target around the visible 32px circle.
  const swatchWrapper: React.CSSProperties = {
    width: 44,
    height: 44,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    background: 'transparent',
    border: 0,
    padding: 0,
    borderRadius: 999,
  };

  return (
    <div className="mt-6 space-y-6">

      {/* ── Price ── */}
      <p
        className="font-serif leading-none"
        style={{ fontSize: 'var(--text-h1)', color: 'var(--color-forest)' }}
      >
        {formatPrice(selectedVariant.priceCents)}
      </p>

      {/* ── Sibling color navigation (separate product per color) ── */}
      {hasSiblings && (
        <div>
          <p className="font-poppins-semibold mb-3" style={variantLabelStyle}>
            Barva — <span className="font-poppins-regular normal-case" style={{ letterSpacing: 0 }}>{product.variants[0]?.color}</span>
          </p>
          <div className="flex flex-wrap gap-1">
            <span style={swatchWrapper} title={product.variants[0]?.color}>
              <span
                className="h-8 w-8 rounded-full block"
                style={{
                  background: product.colorHex ?? '#ccc',
                  boxShadow: `0 0 0 2.5px white, 0 0 0 4px ${product.colorHex ?? '#ccc'}`,
                }}
              />
            </span>
            {product.colorSiblings!.map((sib) => (
              <Link
                key={sib.slug}
                href={`/shop/p/${sib.slug}`}
                title={sib.title}
                style={swatchWrapper}
                className="transition-transform hover:scale-110"
              >
                <span
                  className="h-8 w-8 rounded-full block"
                  style={{
                    background: sib.colorHex,
                    boxShadow: '0 0 0 1px var(--color-border-strong)',
                  }}
                />
                <span className="sr-only">{sib.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Within-product color swatches ── */}
      {!hasSiblings && colors.length > 1 && (
        <div>
          <p className="font-poppins-semibold mb-3" style={variantLabelStyle}>
            Barva — <span className="font-poppins-regular normal-case" style={{ letterSpacing: 0 }}>{selectedVariant.color}</span>
          </p>
          <div className="flex flex-wrap gap-1">
            {colors.map((color) => {
              const variant = product.variants.find((v) => v.color === color);
              const hex = variant?.colorHex ?? '#ccc';
              const isSelected = selectedVariant.color === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => pickVariant(selectedVariant.size, color)}
                  title={color}
                  aria-label={color}
                  aria-pressed={isSelected}
                  style={swatchWrapper}
                  className="transition-transform hover:scale-110"
                >
                  <span
                    className="h-8 w-8 rounded-full block"
                    style={{
                      background: hex,
                      boxShadow: isSelected
                        ? `0 0 0 2.5px white, 0 0 0 4px ${hex}`
                        : '0 0 0 1px var(--color-border-strong)',
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Size picker ── */}
      {sizes.length > 0 && (
        <div>
          <p className="font-poppins-semibold mb-3" style={variantLabelStyle}>
            Velikost
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <Chip
                key={size}
                kind="size"
                selected={selectedVariant.size === size}
                onClick={() => pickVariant(size, selectedVariant.color)}
              >
                {sizeLabel(size)}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock || added}
          aria-disabled={outOfStock || added}
          className="btn-primary w-full"
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          {outOfStock ? 'Vyprodáno' : added ? '✓ Přidáno do košíku' : 'Přidat do košíku'}
        </button>

        {/* Stock nudge — warning color + icon (passes WCAG AA) */}
        {!outOfStock && selectedVariant.stock <= 5 && (
          <p
            className="font-poppins-medium flex items-center justify-center gap-1.5"
            style={{ fontSize: 'var(--text-small)', color: 'var(--color-warning)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Posledních {selectedVariant.stock} {selectedVariant.stock === 1 ? 'kus' : 'kusů'} skladem
          </p>
        )}
      </div>

      {/* ── Meta ── */}
      <div
        className="px-5 py-4 space-y-1.5"
        style={{ background: 'var(--color-cream)', borderRadius: 'var(--radius-md)' }}
      >
        <MetaRow label="Skladem" value={`${selectedVariant.stock} ks`} />
        {selectedVariant.weightGrams && (
          <MetaRow
            label="Hmotnost"
            value={`${(selectedVariant.weightGrams / 1000).toFixed(2)} kg`}
          />
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
        <p
          className="font-poppins-regular"
          style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}
        >
          Doprava zdarma při objednávce nad 1 500 Kč
        </p>
      </div>

      {/* ── Mobile sticky mini buy bar (hidden on md+) ─────────────── */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 px-4 md:hidden"
        style={{
          padding: '0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom)) 1rem',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid var(--color-border-subtle)',
          boxShadow: '0 -4px 18px -8px rgba(0,0,0,0.15)',
        }}
      >
        <div className="flex flex-col leading-tight">
          <span
            className="font-poppins-regular"
            style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}
          >
            Cena
          </span>
          <span
            className="font-serif"
            style={{ fontSize: 'var(--text-h3)', color: 'var(--color-forest)', lineHeight: 1 }}
          >
            {formatPrice(selectedVariant.priceCents)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock || added}
          aria-disabled={outOfStock || added}
          className="btn-primary flex-1"
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          {outOfStock ? 'Vyprodáno' : added ? '✓ Přidáno' : 'Přidat do košíku'}
        </button>
      </div>

    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span
        className="font-poppins-regular"
        style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}
      >
        {label}
      </span>
      <span
        className="font-poppins-semibold tabular-nums"
        style={{ fontSize: 'var(--text-small)', color: 'var(--color-ink)' }}
      >
        {value}
      </span>
    </div>
  );
}
