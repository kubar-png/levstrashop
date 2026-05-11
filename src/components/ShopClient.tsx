'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ProductCard } from './ProductCard';
import { formatPrice } from '@/lib/format';
import type { ProductSummaryView } from '@/lib/data';

type ColorSwatch = { slug: string; colorHex: string; isCurrent: boolean };

type Cat = 'all' | 'kabelky' | 'kufry';
type Sort = 'default' | 'price-asc' | 'price-desc';

const CATS = [
  { value: 'all',     label: 'Vše',     href: '/shop' },
  { value: 'kabelky', label: 'Kabelky', href: '/shop?category=kabelky' },
  { value: 'kufry',   label: 'Kufry',   href: '/shop?category=kufry' },
] as const;

const SUBCATS: Record<string, { value: string; label: string }[]> = {
  kabelky: [
    { value: 'kozene',    label: 'Kožené' },
    { value: 'kozenkove', label: 'Koženkové' },
  ],
  kufry: [
    { value: 'palubni',    label: 'Palubní' },
    { value: 'k-odbaveni', label: 'K odbavení' },
  ],
};

export function ShopClient({
  products,
  activeCategory,
  globalMin,
  globalMax,
}: {
  products: ProductSummaryView[];
  activeCategory: Cat;
  globalMin: number;
  globalMax: number;
}) {
  const [sort, setSort]       = useState<Sort>('default');
  const [maxPrice, setMaxPrice] = useState(globalMax);
  const [subcat, setSubcat]   = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const subcatOptions = SUBCATS[activeCategory] ?? [];

  const displayed = useMemo(() => {
    let list = products.filter((p) => p.minPriceCents <= maxPrice);
    if (subcat) list = list.filter((p) => p.subcategory === subcat);
    if (sort === 'price-asc')  list = [...list].sort((a, b) => a.minPriceCents - b.minPriceCents);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.minPriceCents - a.minPriceCents);
    return list;
  }, [products, maxPrice, subcat, sort]);

  const colorGroupMap = useMemo(() => {
    const map = new Map<string, { slug: string; colorHex: string }[]>();
    products.forEach((p) => {
      if (p.colorGroup && p.colorHex) {
        const group = map.get(p.colorGroup) ?? [];
        if (!group.find((g) => g.slug === p.slug)) {
          group.push({ slug: p.slug, colorHex: p.colorHex });
          map.set(p.colorGroup, group);
        }
      }
    });
    return map;
  }, [products]);

  const sliderPct = globalMax > globalMin
    ? ((maxPrice - globalMin) / (globalMax - globalMin)) * 100
    : 100;

  const count = displayed.length;
  const countLabel = count === 1 ? 'produkt' : count < 5 ? 'produkty' : 'produktů';

  const filterLabelStyle = {
    fontSize: 'var(--text-micro)',
    color: 'var(--color-text-muted)',
    letterSpacing: '0.18em',
  } as const;

  return (
    <div className="mt-8 pb-16 md:flex md:gap-10">

      {/* ══ SIDEBAR ═══════════════════════════════════════════════════ */}
      <div className="mb-4 md:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="btn-secondary"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Filtry
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"
            style={{ transform: filtersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <aside
        className={[
          'shrink-0 md:w-56',
          'md:block',
          'md:sticky md:self-start',
          filtersOpen ? 'block mb-6' : 'hidden',
        ].join(' ')}
        style={{ top: 'calc(88px + 1.5rem)' }}
      >
        {/* Category */}
        <div className="mb-8">
          <p className="mb-3 font-poppins-semibold uppercase" style={filterLabelStyle}>
            Kategorie
          </p>
          <nav className="flex flex-col gap-1">
            {CATS.map((c) => {
              const active = activeCategory === c.value;
              return (
                <Link
                  key={c.value}
                  href={c.href}
                  onClick={() => setSubcat(null)}
                  className="flex cursor-pointer items-center gap-2.5 font-poppins-semibold transition-colors duration-150"
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-small)',
                    background: active ? 'var(--color-forest)' : 'transparent',
                    color: active ? '#fff' : 'var(--color-ink)',
                  }}
                >
                  {active && (
                    <span
                      className="block h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ background: 'var(--color-lime)' }}
                    />
                  )}
                  {c.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Subcategory */}
        {subcatOptions.length > 0 && (
          <div className="mb-8">
            <p className="mb-3 font-poppins-semibold uppercase" style={filterLabelStyle}>
              Typ produktu
            </p>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setSubcat(null)}
                className="flex cursor-pointer items-center gap-2.5 font-poppins-semibold transition-colors duration-150 text-left"
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-small)',
                  background: subcat === null ? 'rgba(45,81,67,0.10)' : 'transparent',
                  color: 'var(--color-ink)',
                }}
              >
                Vše
              </button>
              {subcatOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSubcat(subcat === opt.value ? null : opt.value)}
                  className="flex cursor-pointer items-center gap-2.5 font-poppins-semibold transition-colors duration-150 text-left"
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-small)',
                    background: subcat === opt.value ? 'rgba(45,81,67,0.10)' : 'transparent',
                    color: subcat === opt.value ? 'var(--color-forest)' : 'var(--color-ink)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        <div>
          <p className="mb-3 font-poppins-semibold uppercase" style={filterLabelStyle}>
            Cena
          </p>
          <p
            className="mb-2 font-poppins-semibold"
            style={{ color: 'var(--color-forest)', fontSize: 'var(--text-small)' }}
          >
            do {formatPrice(maxPrice)}
          </p>
          <input
            type="range"
            min={globalMin}
            max={globalMax}
            step={1000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="price-range w-full cursor-pointer"
            style={{ '--slider-pct': `${sliderPct}%` } as React.CSSProperties}
            aria-label="Maximální cena"
          />
          <div
            className="mt-1 flex justify-between"
            style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-micro)' }}
          >
            <span>{formatPrice(globalMin)}</span>
            <span>{formatPrice(globalMax)}</span>
          </div>
        </div>
      </aside>

      {/* ══ MAIN CONTENT ═════════════════════════════════════════════ */}
      <div className="min-w-0 flex-1">

        {/* Sort bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
            {count} {countLabel}
          </span>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="appearance-none cursor-pointer bg-transparent font-poppins-semibold outline-none transition-colors duration-200"
              style={{
                paddingLeft: '1rem',
                paddingRight: '2rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                borderRadius: '999px',
                border: '1.5px solid var(--color-forest)',
                color: 'var(--color-forest)',
                fontSize: 'var(--text-small)',
                minHeight: 40,
              }}
            >
              <option value="default">Řazení</option>
              <option value="price-asc">Cena: od nejnižší</option>
              <option value="price-desc">Cena: od nejvyšší</option>
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" stroke="var(--color-forest)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Grid */}
        {displayed.length === 0 ? (
          <div className="py-20 text-center">
            <p
              className="font-poppins-semibold"
              style={{ color: 'var(--color-forest)', fontSize: 'var(--text-lead)' }}
            >
              Pro zvolené filtry jsme nenašli žádné produkty.
            </p>
            <button
              type="button"
              onClick={() => { setMaxPrice(globalMax); setSubcat(null); setSort('default'); }}
              className="btn-tertiary mt-3"
            >
              Zrušit filtry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-5">
            {displayed.map((p) => {
              const swatches: ColorSwatch[] = p.colorGroup
                ? (colorGroupMap.get(p.colorGroup) ?? []).map((s) => ({
                    ...s,
                    isCurrent: s.slug === p.slug,
                  }))
                : [];
              return (
                <ProductCard key={p._id} product={p} colorSwatches={swatches} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
