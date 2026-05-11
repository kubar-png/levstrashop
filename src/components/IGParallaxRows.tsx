'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

const WIX = 'https://static.wixstatic.com/media';
const ROW1 = [
  `${WIX}/f0cf6b_0fb65fabc4d54b149a2b6213e5153e9e~mv2.jpg`,
  `${WIX}/f0cf6b_29b8ee8366484656828782c7267140df~mv2.jpg`,
  `${WIX}/f0cf6b_8a21028ccb924868a7824d820313a55c~mv2.jpg`,
  `${WIX}/f0cf6b_962f00502d2a46f5b535c2d1fbe3095e~mv2.jpg`,
];
const ROW2 = [
  `${WIX}/f0cf6b_447c2054b701497e93bbfa703008a619~mv2.jpg`,
  `${WIX}/f0cf6b_e8a295dffa64400a9a72b4d9c064f98a~mv2.jpg`,
  `${WIX}/f0cf6b_59b0236fe6ae4dd39ea9700a093c14e4~mv2.jpg`,
  `${WIX}/f0cf6b_dc69d4ff1b334f15866d84d2765dcf37~mv2.jpg`,
];

const MAX_SHIFT = 5; // percent — rows are 110% wide so 5% overhang on each side always covers

export function IGParallaxRows() {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const row1Ref  = useRef<HTMLDivElement>(null);
  const row2Ref  = useRef<HTMLDivElement>(null);
  const rafRef   = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const apply = () => {
      if (!wrapRef.current || !row1Ref.current || !row2Ref.current) return;
      const rect     = wrapRef.current.getBoundingClientRect();
      const vh       = window.innerHeight;
      // progress: -1 = section below viewport, 0 = centered, +1 = section above viewport
      const progress = (vh / 2 - (rect.top + rect.height / 2)) / vh;
      const t        = Math.max(-1, Math.min(1, progress));
      const shift    = t * MAX_SHIFT;
      row1Ref.current.style.transform = `translateX(${-shift}%)`;
      row2Ref.current.style.transform = `translateX(${shift}%)`;
    };

    const onScroll = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(apply);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    apply();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={wrapRef} className="overflow-hidden pb-12 md:pb-16">
      <div
        ref={row1Ref}
        className="flex gap-2 md:gap-3"
        style={{ width: '110%', marginLeft: '-5%', willChange: 'transform' }}
      >
        {ROW1.map((src, i) => (
          <a
            key={i}
            href="https://instagram.com/levstra"
            target="_blank"
            rel="noreferrer"
            className="relative block aspect-[4/3] flex-1 overflow-hidden rounded-xl bg-neutral-200"
          >
            <Image src={src} alt="" fill sizes="25vw" className="object-cover" />
          </a>
        ))}
      </div>

      <div
        ref={row2Ref}
        className="mt-2 flex gap-2 md:mt-3 md:gap-3"
        style={{ width: '110%', marginLeft: '-5%', willChange: 'transform' }}
      >
        {ROW2.map((src, i) => (
          <a
            key={i}
            href="https://instagram.com/levstra"
            target="_blank"
            rel="noreferrer"
            className="relative block aspect-[4/3] flex-1 overflow-hidden rounded-xl bg-neutral-200"
          >
            <Image src={src} alt="" fill sizes="25vw" className="object-cover" />
          </a>
        ))}
      </div>
    </div>
  );
}
