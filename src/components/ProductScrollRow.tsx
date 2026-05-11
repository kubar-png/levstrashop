'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { ProductCard } from './ProductCard';
import type { ProductSummaryView } from '@/lib/data';

export function ProductScrollRow({ products }: { products: ProductSummaryView[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    update();
    return () => el.removeEventListener('scroll', update);
  }, [update]);

  const scroll = (dir: 'left' | 'right') => {
    ref.current?.scrollBy({ left: dir === 'right' ? 340 : -340, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Scrollable track */}
      <div
        ref={ref}
        className="no-scrollbar flex gap-3 overflow-x-auto pb-1 md:gap-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {products.map((p) => (
          <div
            key={p._id}
            className="w-[55vw] shrink-0 md:w-[22vw]"
            style={{ scrollSnapAlign: 'start' }}
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn-icon absolute top-[38%] z-10 -translate-y-1/2 -left-3 md:-left-5 shadow-[0_4px_18px_-6px_rgba(0,0,0,0.22)]"
        onClick={() => scroll('left')}
        aria-label="Posunout doleva"
        aria-disabled={!canScrollLeft}
        disabled={!canScrollLeft}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        className="btn-icon absolute top-[38%] z-10 -translate-y-1/2 -right-3 md:-right-5 shadow-[0_4px_18px_-6px_rgba(0,0,0,0.22)]"
        onClick={() => scroll('right')}
        aria-label="Posunout doprava"
        aria-disabled={!canScrollRight}
        disabled={!canScrollRight}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
