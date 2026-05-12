'use client';

import Link from 'next/link';
import { useRef, useState, useEffect, useCallback } from 'react';
import { ProductCard } from './ProductCard';
import type { ProductSummaryView } from '@/lib/data';

export function ProductCarousel({ products }: { products: ProductSummaryView[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    update();
    return () => el.removeEventListener('scroll', update);
  }, [update]);

  const scroll = (dir: 'left' | 'right') => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector('[data-card]') as HTMLElement | null;
    const amount = card ? card.offsetWidth + 16 : 340;
    el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <section
      className="reveal-on-scroll px-4 md:px-6"
      style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}
    >
      {/* ── Header row ── */}
      <div className="mb-10 flex items-center justify-between gap-4">
        <h2
          className="font-poppins-semibold leading-[1.1]"
          style={{
            fontSize: 'var(--text-h2)',
            color: 'var(--color-forest)',
            letterSpacing: '-0.025em',
          }}
        >
          Nejoblíbenější kousky
        </h2>

        <div className="ml-auto flex items-center gap-1.5 md:gap-2.5">
          <button
            type="button"
            className="carousel-arrow"
            aria-label="Posunout doleva"
            onClick={() => scroll('left')}
            aria-disabled={!canLeft}
            disabled={!canLeft}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className="carousel-arrow"
            aria-label="Posunout doprava"
            onClick={() => scroll('right')}
            aria-disabled={!canRight}
            disabled={!canRight}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <Link href="/shop" className="btn-secondary ml-2 hidden md:inline-flex">
            Zobrazit vše
          </Link>
        </div>
      </div>

      {/* ── Scroll track ── */}
      <div
        ref={ref}
        className="no-scrollbar flex gap-3 overflow-x-auto md:gap-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {products.map((p) => {
          const swatches =
            p.colorGroup && p.colorHex && p.colorSiblings?.length
              ? [
                  { slug: p.slug, colorHex: p.colorHex, isCurrent: true },
                  ...p.colorSiblings.map((s) => ({
                    slug: s.slug,
                    colorHex: s.colorHex,
                    isCurrent: false,
                  })),
                ]
              : undefined;
          return (
            <div
              key={p._id}
              data-card
              className="w-[62vw] shrink-0 md:w-[22vw]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <ProductCard product={p} colorSwatches={swatches} />
            </div>
          );
        })}
      </div>

      {/* Mobile "Zobrazit vše" CTA below the row */}
      <div className="mt-6 flex justify-center sm:hidden">
        <Link href="/shop" className="btn-secondary">
          Zobrazit vše
        </Link>
      </div>
    </section>
  );
}
