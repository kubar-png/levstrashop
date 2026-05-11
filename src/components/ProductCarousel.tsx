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
    <section className="reveal-on-scroll px-4 py-16 md:px-6 md:py-20">
      {/* ── Header row ── */}
      <div className="mb-10 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-extrabold tracking-tight md:text-4xl">
          Nejoblíbenější kousky
        </h2>

        <div className="flex items-center gap-2.5">
          {/* Left arrow — fades in after scrolling */}
          <NavArrow dir="left" visible={canLeft} onClick={() => scroll('left')} />
          {/* Right arrow — always shown initially */}
          <NavArrow dir="right" visible={canRight} onClick={() => scroll('right')} />

          <Link
            href="/shop"
            className="ml-2 inline-flex items-center rounded-xl border-2 px-5 py-2 text-sm font-semibold transition hover:opacity-70"
            style={{ borderColor: '#2D5143', color: '#2D5143' }}
          >
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
          // Build colorGroup swatches from inline siblings (this product + its siblings)
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
    </section>
  );
}

function NavArrow({
  dir,
  visible,
  onClick,
}: {
  dir: 'left' | 'right';
  visible: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={dir === 'left' ? 'Posunout doleva' : 'Posunout doprava'}
      className={[
        'flex h-9 w-9 items-center justify-center rounded-full',
        'transition-all duration-300',
        'hover:brightness-110 active:scale-90',
        visible
          ? 'opacity-100 scale-100 pointer-events-auto'
          : 'opacity-0 scale-75 pointer-events-none',
      ].join(' ')}
      style={{ background: '#2D5143' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {dir === 'left' ? (
          <path d="M15 18l-6-6 6-6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 18l6-6-6-6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}
