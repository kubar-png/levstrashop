'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductImage } from './ProductImage';
import { formatPrice, colorToSlug } from '@/lib/format';
import { useCart } from '@/lib/cart';
import type { ProductSummaryView } from '@/lib/data';

type Cat = 'all' | 'kabelky' | 'kufry';

/** One catalog tile = a product in a specific colour, ready to add to cart. */
type ColorCard = {
  key: string;
  productId: string;
  slug: string;
  title: string;
  color?: string;
  /** Variant SKU to add to the cart; undefined when nothing is purchasable. */
  sku?: string;
  stock: number;
  priceCents: number;
  imageUrl: string | null;
  placeholder?: ProductSummaryView['placeholder'];
  href: string;
};

/** Expand a product into one card per photographed colour (hero colour first).
 *  Products without per-colour photos fall back to a single card. */
function cardsForProduct(p: ProductSummaryView): ColorCard[] {
  const base = `/shop/p/${p.slug}`;
  const real = (p.colorVariants ?? []).filter((v) => v.imageUrl && !v.isPlaceholder);

  if (real.length === 0) {
    // No per-colour photo: one fallback card. Pick the cheapest in-stock
    // variant (else cheapest) so the quick-add adds a sensible default.
    const pick = [...(p.colorVariants ?? [])].sort(
      (a, b) =>
        (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0) || a.priceCents - b.priceCents,
    )[0];
    const href = p.heroColor ? `${base}?barva=${colorToSlug(p.heroColor)}` : base;
    return [
      {
        key: p._id,
        productId: p._id,
        slug: p.slug,
        title: p.title,
        color: pick?.color ?? p.heroColor,
        sku: pick?.sku,
        stock: pick?.stock ?? p.totalStock ?? 0,
        priceCents: pick?.priceCents ?? p.minPriceCents,
        imageUrl: p.imageUrl,
        placeholder: p.placeholder,
        href,
      },
    ];
  }

  const ordered = [...real].sort((a, b) => {
    const ah = p.heroColor && a.color === p.heroColor ? 0 : 1;
    const bh = p.heroColor && b.color === p.heroColor ? 0 : 1;
    return ah - bh;
  });

  return ordered.map((v) => ({
    key: `${p._id}-${v.sku}`,
    productId: p._id,
    slug: p.slug,
    title: p.title,
    color: v.color,
    sku: v.sku,
    stock: v.stock,
    priceCents: v.priceCents,
    imageUrl: v.imageUrl,
    placeholder: p.placeholder,
    href: v.color ? `${base}?barva=${colorToSlug(v.color)}` : base,
  }));
}
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

/* ── Hero, rendered client-side so it swaps with the category without a
   full page navigation (no scroll jump, only the band + cards change). ── */
const WIX = 'https://static.wixstatic.com/media';
const HERO: Record<Cat, string> = {
  all:     `${WIX}/f0cf6b_510434021b004f2abcfcc53a3a965203~mv2.jpg`,
  kabelky: `${WIX}/f0cf6b_0fb65fabc4d54b149a2b6213e5153e9e~mv2.jpg`,
  kufry:   `${WIX}/f0cf6b_510434021b004f2abcfcc53a3a965203~mv2.jpg`,
};
const HERO_TEXT: Record<Cat, { title: string; sub: string }> = {
  all:     { title: 'Všechny naše produkty', sub: 'Kabelky a kufry pro každou cestu.' },
  kabelky: { title: 'Kabelky',               sub: 'Pro každý den i pro výjimečné chvíle.' },
  kufry:   { title: 'Kufry',                 sub: 'Cestovní zavazadla pro letiště i víkend.' },
};

function ShopHero({ category }: { category: Cat }) {
  const heroSrc = HERO[category];
  const { title, sub } = HERO_TEXT[category];
  return (
    <section className="mx-auto max-w-7xl px-4 pt-4 md:px-6 md:pt-6">
      <div
        className="relative w-full overflow-hidden aspect-[2/1] sm:aspect-[16/6] md:aspect-[16/4]"
        style={{ borderRadius: 'var(--radius-2xl)' }}
      >
        {/* `key` swaps the image cleanly when the category changes. */}
        <Image
          key={heroSrc}
          src={heroSrc}
          alt={title}
          fill
          priority
          sizes="(min-width: 1280px) 1280px, 100vw"
          className="object-cover object-[50%_30%]"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(0,0,0,0.32) 86%, rgba(0,0,0,0.62) 100%)',
          }}
        />
        <div className="absolute inset-0 flex items-end pb-7 md:pb-10 px-7 md:px-10">
          <div key={title} className="page-transition">
            <h1
              className="font-poppins-semibold leading-[1.0]"
              style={{
                fontSize: 'var(--text-h1)',
                letterSpacing: '-0.03em',
                color: 'var(--color-cream)',
              }}
            >
              {title}
            </h1>
            <p
              className="font-serif mt-1.5"
              style={{ fontSize: 'var(--text-lead)', color: 'rgba(242,240,235,0.88)' }}
            >
              {sub}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Quick add-to-cart button shown on each catalog card. ── */
function AddToCartButton({ card }: { card: ColorCard }) {
  const add = useCart((s) => s.add);
  const openDrawer = useCart((s) => s.openDrawer);
  const [added, setAdded] = useState(false);

  const soldOut = !card.sku || card.stock <= 0;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut || !card.sku) return;
    add({
      productId: card.productId,
      variantSku: card.sku,
      title: card.title,
      image: card.imageUrl ?? undefined,
      color: card.color,
      priceCents: card.priceCents,
      qty: 1,
      slug: card.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
    openDrawer();
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={soldOut}
      aria-disabled={soldOut}
      data-added={added || undefined}
      className="btn-add mt-2.5"
      aria-label={`Přidat ${card.title}${card.color ? ` – ${card.color}` : ''} do košíku`}
    >
      {soldOut ? (
        'Vyprodáno'
      ) : added ? (
        '✓ Přidáno'
      ) : (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 7h14l-1.2 9.5a2 2 0 0 1-2 1.7H8.2a2 2 0 0 1-2-1.7L5 7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="M9 7V5.5A3 3 0 0 1 15 5.5V7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          Do košíku
        </>
      )}
    </button>
  );
}

export function ShopClient({
  products,
  initialCategory,
}: {
  products: ProductSummaryView[];
  initialCategory: Cat;
}) {
  const [category, setCategory] = useState<Cat>(initialCategory);
  const [sort, setSort]       = useState<Sort>('default');
  const [subcat, setSubcat]   = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Price bounds are global (across all products) so the slider doesn't jump
  // around as you switch categories.
  const [globalMin, globalMax] = useMemo(() => {
    const prices = products.map((p) => p.minPriceCents);
    return prices.length ? [Math.min(...prices), Math.max(...prices)] : [0, 1000000];
  }, [products]);

  const [maxPrice, setMaxPrice] = useState(globalMax);

  const subcatOptions = SUBCATS[category] ?? [];

  /** Switch category client-side: update the URL for shareability/SSR on
   *  reload, but skip the navigation so only the hero + cards re-render. */
  function chooseCategory(c: Cat) {
    if (c === category) return;
    setCategory(c);
    setSubcat(null);
    setMaxPrice(globalMax);
    const url = CATS.find((x) => x.value === c)!.href;
    window.history.replaceState(null, '', url);
  }

  const cards = useMemo(() => {
    let list = products.filter(
      (p) => category === 'all' || p.category?.slug === category,
    );
    list = list.filter((p) => p.minPriceCents <= maxPrice);
    if (subcat) list = list.filter((p) => p.subcategory === subcat);

    // Products still awaiting photos (only an SVG placeholder) always go
    // absolutely last — after every photographed card, in both sort modes.
    // Otherwise the colour "waves" below would re-scatter them mid-catalog.
    const photographed = list.filter((p) => !p.isPlaceholder).map(cardsForProduct);
    const placeholders = list.filter((p) => p.isPlaceholder).flatMap(cardsForProduct);

    if (sort === 'price-asc' || sort === 'price-desc') {
      const dir = (a: ColorCard, b: ColorCard) =>
        sort === 'price-asc' ? a.priceCents - b.priceCents : b.priceCents - a.priceCents;
      return [...photographed.flat().sort(dir), ...placeholders.sort(dir)];
    }

    // Waves: every product's primary colour first, then the 2nd colour of each, …
    const maxLen = photographed.reduce((m, c) => Math.max(m, c.length), 0);
    const waves: ColorCard[] = [];
    for (let i = 0; i < maxLen; i++) {
      for (const c of photographed) if (c[i]) waves.push(c[i]);
    }
    return [...waves, ...placeholders];
  }, [products, category, maxPrice, subcat, sort]);

  const sliderPct = globalMax > globalMin
    ? ((maxPrice - globalMin) / (globalMax - globalMin)) * 100
    : 100;

  const count = cards.length;
  const countLabel = count === 1 ? 'produkt' : count < 5 ? 'produkty' : 'produktů';

  const filterLabelStyle = {
    fontSize: 'var(--text-micro)',
    color: 'var(--color-text-muted)',
    letterSpacing: '0.18em',
  } as const;

  return (
    <>
      <ShopHero category={category} />

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mt-8 pb-24 md:flex md:gap-10 md:pb-32">

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
            data-open={filtersOpen || undefined}
            className={[
              'shrink-0 md:w-56 md:sticky md:self-start',
              // Mobile: collapse with smooth max-height + opacity transition.
              'max-h-0 overflow-hidden opacity-0 transition-all duration-300 ease-out',
              'data-[open]:max-h-[1600px] data-[open]:opacity-100 data-[open]:mb-6',
              // Desktop: always visible regardless of mobile-toggle state.
              'md:!max-h-none md:!overflow-visible md:!opacity-100 md:!mb-0',
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
                  const active = category === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => chooseCategory(c.value)}
                      className="flex cursor-pointer items-center gap-2.5 text-left font-poppins-semibold transition-colors duration-150"
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
                    </button>
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
            {cards.length === 0 ? (
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
                {cards.map((c) => (
                  <div key={c.key} className="group flex flex-col">
                    <Link href={c.href} className="block">
                      <ProductImage
                        src={c.imageUrl}
                        alt={c.color ? `${c.title} – ${c.color}` : c.title}
                        placeholder={c.placeholder}
                        sizes="(min-width: 1024px) 25vw, 50vw"
                      />
                      <div className="mt-3 flex flex-col gap-1 px-1">
                        <h3
                          className="font-poppins-semibold leading-snug transition-colors group-hover:text-[var(--color-forest)]"
                          style={{ fontSize: 'var(--text-body)', color: 'var(--color-ink)' }}
                        >
                          {c.title}
                        </h3>
                        {c.color && (
                          <span style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                            {c.color}
                          </span>
                        )}
                        <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}>
                          {formatPrice(c.priceCents)}
                        </p>
                      </div>
                    </Link>
                    <div className="mt-auto px-1 pt-1">
                      <AddToCartButton card={c} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
