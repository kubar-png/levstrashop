'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

// 6s per slide is the sweet spot — long enough to take in the photo,
// short enough that the page never feels static.
const SLIDE_MS = 6000;
const TRANSITION_MS = 1100;

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

  useEffect(() => {
    if (paused || images.length <= 1) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % images.length);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [paused, images.length]);

  const n = images.length;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((src, i) => {
        // forward distance from the current slide: 0 = current,
        // 1..n-2 = waiting offscreen to the right, n-1 = just exited left.
        const forward = (i - idx + n) % n;
        const translateX = forward === 0 ? 0 : forward === n - 1 ? -100 : 100;
        // Only animate the slide entering and the one leaving; the others
        // reposition silently while offscreen so there's no flying-across.
        const animated = forward === 0 || forward === n - 1;

        return (
          <div
            key={src}
            className="absolute inset-0"
            style={{
              transform: `translate3d(${translateX}%, 0, 0)`,
              transition: animated
                ? `transform ${TRANSITION_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`
                : 'none',
              willChange: animated ? 'transform' : undefined,
            }}
          >
            <Image
              src={src}
              alt={alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition }}
            />
          </div>
        );
      })}

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
                width: i === idx ? '28px' : '6px',
                background: i === idx ? '#fff' : 'rgba(255,255,255,0.5)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
