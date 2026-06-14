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
  const openDrawer = useCart((s) => s.openDrawer);

  const sizes = Array.from(
    new Set(product.variants.map((v) => v.size).filter((s): s is string => !!s)),
  );
  const colors = Array.from(
    new Set(product.variants.map((v) => v.color).filter((c): c is string => !!c)),
  );

  /** Find best variant matching the requested size/color.
   *  Prefers an in-stock match; falls back to any match. */
  function pickVariant(size?: string, color?: string) {
    const matches = product.variants.filter(
      (v) =>
        (size === undefined || v.size === size) &&
        (color === undefined || v.color === color),
    );
    if (matches.length === 0) return;
    const inStock = matches.find((v) => v.stock > 0);
    onVariantChange(inStock ?? matches[0]);
  }

  /** Does any variant exist with this (size, color) AND have stock > 0? */
  function hasStock(opts: { size?: string; color?: string }): boolean {
    return product.variants.some(
      (v) =>
        v.stock > 0 &&
        (opts.size === undefined || v.size === opts.size) &&
        (opts.color === undefined || v.color === opts.color),
    );
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
    setTimeout(() => setAdded(false), 1200);
    /* Slide the mini-cart in so the buyer sees confirmation + the next step. */
    openDrawer();
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
              const available = hasStock({ size: selectedVariant.size, color });
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => pickVariant(selectedVariant.size, color)}
                  title={available ? color : `${color} — vyprodáno`}
                  aria-label={available ? color : `${color}, vyprodáno`}
                  aria-pressed={isSelected}
                  style={{
                    ...swatchWrapper,
                    opacity: available || isSelected ? 1 : 0.45,
                  }}
                  className="transition-transform hover:scale-110"
                >
                  <span
                    className="relative h-8 w-8 rounded-full block"
                    style={{
                      background: hex,
                      boxShadow: isSelected
                        ? `0 0 0 2.5px white, 0 0 0 4px ${hex}`
                        : '0 0 0 1px var(--color-border-strong)',
                    }}
                  >
                    {!available && !isSelected && (
                      <span
                        aria-hidden="true"
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                        style={{
                          width: '120%',
                          height: '1.5px',
                          background: '#fff',
                          transform: 'translate(-50%,-50%) rotate(-45deg)',
                          boxShadow: '0 0 0 0.5px rgba(0,0,0,0.3)',
                        }}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Size picker (stock-aware) ── */}
      {sizes.length > 0 && (
        <div>
          <p className="font-poppins-semibold mb-3" style={variantLabelStyle}>
            Velikost
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const available = hasStock({ size, color: selectedVariant.color });
              const isSelected = selectedVariant.size === size;
              return (
                <Chip
                  key={size}
                  kind="size"
                  selected={isSelected}
                  onClick={() => pickVariant(size, selectedVariant.color)}
                  disabled={!available && !isSelected}
                  title={available ? undefined : 'Tato kombinace je vyprodaná'}
                  style={
                    !available && !isSelected
                      ? {
                          opacity: 0.45,
                          textDecoration: 'line-through',
                          cursor: 'not-allowed',
                        }
                      : undefined
                  }
                >
                  {sizeLabel(size)}
                </Chip>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <div className="space-y-3 pt-2">
        <BuyCta
          onClick={handleAdd}
          disabled={outOfStock || added}
          state={outOfStock ? 'out' : added ? 'added' : 'normal'}
        />

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

      {/* ── Trust signals — reassurance at the decision moment ── */}
      <ul
        className="grid grid-cols-1 gap-0 overflow-hidden"
        style={{
          background: 'var(--color-cream)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <TrustRow
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path d="M3 7h13l5 5v5h-3M6 17H3V7M9 17h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="7.5" cy="17.5" r="2" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="17.5" cy="17.5" r="2" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          }
          label="Doručení 1–2 dny"
          note="PPL na adresu i ParcelShop"
        />
        <TrustRow
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path d="M21 12c0 5-4 8-9 9-5-1-9-4-9-9V5l9-3 9 3v7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          label="Vrácení do 14 dní"
          note="Bez udání důvodu"
        />
        <TrustRow
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
              <path d="M7 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          }
          label="Bezpečná platba"
          note="Karta, Apple Pay, převod"
        />
        <TrustRow
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path d="M4 6h16l-1.5 12a2 2 0 0 1-2 1.8H7.5a2 2 0 0 1-2-1.8L4 6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M9 6V4.5A2.5 2.5 0 0 1 11.5 2h1A2.5 2.5 0 0 1 15 4.5V6" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          }
          label="Skladem v ČR"
          note="Expedice ze skladu Brno"
          last
        />
      </ul>

      {/* ── Free-shipping nudge ── */}
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
        <BuyCta
          compact
          onClick={handleAdd}
          disabled={outOfStock || added}
          state={outOfStock ? 'out' : added ? 'added' : 'normal'}
        />
      </div>

    </div>
  );
}

/** Solid-forest add-to-cart CTA mirroring the mini-cart's "K pokladně"
 *  button: filled green, label left, lime icon-circle right. The prominent
 *  conversion treatment the quiet outlined btn-primary lacked. */
function BuyCta({
  onClick,
  disabled,
  state,
  compact,
}: {
  onClick: () => void;
  disabled: boolean;
  state: 'normal' | 'added' | 'out';
  compact?: boolean;
}) {
  const isOut = state === 'out';
  const label = isOut
    ? 'Vyprodáno'
    : state === 'added'
      ? compact
        ? '✓ Přidáno'
        : '✓ Přidáno do košíku'
      : 'Přidat do košíku';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={`font-poppins-semibold flex items-center justify-between overflow-hidden transition-transform duration-200 active:scale-[0.985] ${
        isOut ? '' : 'cta-shine'
      } ${compact ? 'flex-1' : 'w-full'}`}
      style={{
        background: isOut ? 'var(--color-cream)' : 'var(--color-forest)',
        color: isOut ? 'var(--color-text-muted)' : '#fff',
        padding: compact ? '12px 14px 12px 18px' : '17px 18px 17px 22px',
        borderRadius: 'var(--radius-lg)',
        minHeight: compact ? 52 : 60,
        boxShadow: isOut ? 'none' : '0 10px 24px -10px rgba(45,81,67,0.55)',
        cursor: isOut ? 'not-allowed' : 'pointer',
        opacity: isOut ? 0.9 : 1,
      }}
    >
      <span style={{ fontSize: compact ? '0.95rem' : '1.05rem', lineHeight: 1.1 }}>
        {label}
      </span>
      {!isOut && (
        <span
          aria-hidden="true"
          className="cta-circle flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ background: 'var(--color-lime)', color: 'var(--color-ink)' }}
        >
          {state === 'added' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 7h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M9 7V5.5A3 3 0 0 1 15 5.5V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </span>
      )}
    </button>
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

function TrustRow({
  icon,
  label,
  note,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  note: string;
  last?: boolean;
}) {
  return (
    <li
      className="flex items-center gap-3 px-5 py-3.5"
      style={{
        borderBottom: last ? undefined : '1px solid rgba(43,49,47,0.07)',
      }}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ background: '#ffffff', color: 'var(--color-forest)' }}
      >
        {icon}
      </span>
      <div className="leading-tight">
        <p
          className="font-poppins-semibold"
          style={{ fontSize: 'var(--text-small)', color: 'var(--color-ink)' }}
        >
          {label}
        </p>
        <p
          className="font-poppins-regular"
          style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}
        >
          {note}
        </p>
      </div>
    </li>
  );
}
