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

  // Build a map of colorGroup -> all swatches for that group (from ALL products, not just displayed)
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

  return (
    <div className="mt-8 pb-16 md:flex md:gap-10">

      {/* ══ SIDEBAR ═══════════════════════════════════════════════════ */}
      {/* Mobile toggle */}
      <div className="mb-4 md:hidden">
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="flex cursor-pointer items-center gap-2 rounded-full border-2 px-5 py-2 text-sm font-poppins-semibold transition-colors duration-200"
          style={{ borderColor: '#2D5143', color: '#2D5143' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 6h16M7 12h10M10 18h4" stroke="#2D5143" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Filtry
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"
            style={{ transform: filtersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <path d="M6 9l6 6 6-6" stroke="#2D5143" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
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
          <p className="mb-3 text-xs font-poppins-semibold uppercase tracking-[0.18em]" style={{ color: '#9ca3af' }}>
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
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-poppins-semibold transition-colors duration-150"
                  style={{
                    background: active ? '#2D5143' : 'transparent',
                    color: active ? '#fff' : '#2B312F',
                  }}
                >
                  {active && (
                    <span className="block h-1.5 w-1.5 rounded-full bg-[#E1F861] shrink-0" />
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
            <p className="mb-3 text-xs font-poppins-semibold uppercase tracking-[0.18em]" style={{ color: '#9ca3af' }}>
              Typ
            </p>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setSubcat(null)}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-poppins-semibold transition-colors duration-150 text-left"
                style={{
                  background: subcat === null ? 'rgba(45,81,67,0.10)' : 'transparent',
                  color: '#2B312F',
                }}
              >
                Vše
              </button>
              {subcatOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSubcat(subcat === opt.value ? null : opt.value)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-poppins-semibold transition-colors duration-150 text-left"
                  style={{
                    background: subcat === opt.value ? 'rgba(45,81,67,0.10)' : 'transparent',
                    color: subcat === opt.value ? '#2D5143' : '#2B312F',
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
          <p className="mb-3 text-xs font-poppins-semibold uppercase tracking-[0.18em]" style={{ color: '#9ca3af' }}>
            Cena
          </p>
          <p className="mb-2 text-sm font-poppins-semibold" style={{ color: '#2D5143' }}>
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
          <div className="mt-1 flex justify-between text-xs" style={{ color: '#9ca3af' }}>
            <span>{formatPrice(globalMin)}</span>
            <span>{formatPrice(globalMax)}</span>
          </div>
        </div>
      </aside>

      {/* ══ MAIN CONTENT ═════════════════════════════════════════════ */}
      <div className="min-w-0 flex-1">

        {/* Sort bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <span className="text-sm" style={{ color: '#9ca3af' }}>
            {count} {countLabel}
          </span>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="appearance-none cursor-pointer rounded-full border-2 bg-transparent pl-4 pr-8 py-1.5 text-sm font-poppins-semibold outline-none transition-colors duration-200"
              style={{ borderColor: '#2D5143', color: '#2D5143' }}
            >
              <option value="default">Řazení</option>
              <option value="price-asc">Cena: nejlevnější</option>
              <option value="price-desc">Cena: nejdražší</option>
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" stroke="#2D5143" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Grid */}
        {displayed.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-poppins-semibold text-base" style={{ color: '#2D5143' }}>
              Žádné produkty neodpovídají filtru.
            </p>
            <button
              onClick={() => { setMaxPrice(globalMax); setSubcat(null); setSort('default'); }}
              className="mt-3 cursor-pointer text-sm underline"
              style={{ color: '#2D5143' }}
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
