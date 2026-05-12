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

      {/* Mobile full-width conversion CTA below the row.
          Same horizontal padding as the section, so the button spans the
          content column edge-to-edge. Visual language matches the
          mobile-menu CTA for brand consistency. */}
      <Link
        href="/shop"
        aria-label="Zobrazit celý e-shop"
        className="font-poppins-semibold mt-8 flex w-full items-center justify-between overflow-hidden transition-transform duration-200 active:scale-[0.985] md:hidden"
        style={{
          background: 'var(--color-forest)',
          color: '#ffffff',
          padding: '20px 22px',
          borderRadius: 'var(--radius-lg)',
          minHeight: 60,
          boxShadow: '0 10px 24px -10px rgba(45,81,67,0.55)',
        }}
      >
        <span className="flex flex-col items-start gap-0.5">
          <span
            className="font-poppins-regular"
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--color-lime)',
            }}
          >
            Celá kolekce
          </span>
          <span style={{ fontSize: '1.15rem', lineHeight: 1 }}>Zobrazit vše</span>
        </span>
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ background: 'var(--color-lime)', color: 'var(--color-ink)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12h13M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </Link>
    </section>
  );
}
