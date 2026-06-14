'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { CartButton } from './CartButton';
import { MobileMenu } from './MobileMenu';
import { NavLinks } from './NavLinks';

/**
 * Auto-hide on scroll down, reveal on scroll up.
 * - Threshold of 6px prevents jitter during momentum scroll
 * - Always visible when within 80px of the top
 * - Always visible at the very bottom (rubber-band protection)
 */
export function SiteHeader() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;

        if (y < 80) {
          setHidden(false);
        } else if (delta > 6) {
          setHidden(true);
        } else if (delta < -6) {
          setHidden(false);
        }

        lastY.current = y;
        ticking.current = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-6 top-6 z-50 transition-transform duration-300 ease-out will-change-transform md:inset-x-8 md:top-8 ${
        hidden ? '-translate-y-[140%]' : 'translate-y-0'
      }`}
    >
      <div
        className="flex w-full items-center justify-between gap-6 px-4 py-2.5 shadow-[0_4px_22px_-8px_rgba(0,0,0,0.18)] ring-1 ring-black/5 backdrop-blur md:px-6 md:py-3"
        style={{
          background: 'var(--color-pill-bg)',
          /* Concentric corners: hero radius (32px) − gap to hero edge (8px) = 24px.
             Matches --radius-xl so the floating pill reads as the inner half of
             a nested rounded frame. */
          borderRadius: 'var(--radius-xl)',
        }}
      >
        {/* Left: logo + nav */}
        <div className="flex items-center gap-7">
          <Link href="/" className="flex items-center shrink-0 text-[var(--color-pill-ink)]">
            <BrandLogo className="text-xl md:text-2xl" />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <NavLinks />
          </nav>
        </div>

        {/* Right: cart + mobile menu trigger.
            Search will return when there's a real autocomplete implementation;
            a non-functional "Najít" affordance erodes first-impression trust. */}
        <div className="flex items-center gap-3">
          <CartButton />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}


