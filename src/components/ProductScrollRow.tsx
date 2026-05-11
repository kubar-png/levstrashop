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

      {/* Left arrow — visible only after user has scrolled */}
      <ArrowButton
        visible={canScrollLeft}
        dir="left"
        onClick={() => scroll('left')}
        label="Posunout doleva"
      />

      {/* Right arrow — always visible initially */}
      <ArrowButton
        visible={canScrollRight}
        dir="right"
        onClick={() => scroll('right')}
        label="Posunout doprava"
      />
    </div>
  );
}

function ArrowButton({
  visible,
  dir,
  onClick,
  label,
}: {
  visible: boolean;
  dir: 'left' | 'right';
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={[
        'absolute top-[38%] z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full',
        'shadow-[0_4px_18px_-6px_rgba(0,0,0,0.22)] ring-1 ring-black/8',
        'transition-all duration-300 hover:scale-105 active:scale-95',
        dir === 'left' ? '-left-3 md:-left-5' : '-right-3 md:-right-5',
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      ].join(' ')}
      style={{ background: 'var(--color-pill-bg)' }}
    >
      {dir === 'left' ? <ChevronLeft /> : <ChevronRight />}
    </button>
  );
}

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="#2B312F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18l6-6-6-6" stroke="#2B312F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
