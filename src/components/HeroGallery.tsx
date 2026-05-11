'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const INTERVAL_MS = 5500;

export function HeroGallery({
  images,
  alt,
  objectPosition = '50% 20%',
}: {
  images: string[];
  alt: string;
  objectPosition?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (paused || images.length <= 1) return;
    timerRef.current = window.setInterval(() => {
      setIdx((i) => (i + 1) % images.length);
    }, INTERVAL_MS);
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, [paused, images.length]);

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={alt}
          fill
          priority={i === 0}
          sizes="100vw"
          className="object-cover"
          style={{
            objectPosition,
            opacity: i === idx ? 1 : 0,
            transition: 'opacity 900ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      ))}

      {images.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Foto ${i + 1} z ${images.length}`}
              aria-current={i === idx ? 'true' : undefined}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === idx ? '24px' : '6px',
                background: i === idx ? '#fff' : 'rgba(255,255,255,0.5)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
