'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Site-wide JS smooth-scroll. Mounted once in the root layout.
 *
 * - Respects prefers-reduced-motion (does nothing in that case).
 * - Lenis lets the browser keep handling scroll-snap (carousels) and
 *   sticky positioning; we only smooth the wheel/keyboard scroll rate.
 * - touchMultiplier: 1.4 — touch scrolling stays close to native feel.
 */
export function SmoothScrollProvider() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
      wheelMultiplier: 1,
    });

    let frame: number;
    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
