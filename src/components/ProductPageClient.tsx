'use client';

import { useRef, useState } from 'react';
import { ProductImage } from './ProductImage';
import { ProductBuyBox } from './ProductBuyBox';
import { ProductCard } from './ProductCard';
import { Eyebrow } from './ui';
import type { ProductSummaryView, ProductView, VariantView } from '@/lib/data';

function ProductGallery({
  images,
  alt,
  placeholder,
}: {
  images: (string | null)[];
  alt: string;
  placeholder?: ProductView['placeholder'];
}) {
  const [idx, setIdx] = useState(0);
  const canPrev = idx > 0;
  const canNext = idx < images.length - 1;

  // Touch-swipe state for mobile gallery navigation.
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  function onTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
  }

  function onTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    // Only treat as swipe if horizontal movement dominates and exceeds threshold.
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0 && canNext) setIdx((i) => Math.min(images.length - 1, i + 1));
    else if (dx > 0 && canPrev) setIdx((i) => Math.max(0, i - 1));
  }

  return (
    <div>
      {/* Main image with nav arrows */}
      <div
        className="relative overflow-hidden touch-pan-y"
        style={{
          background: 'var(--color-cream)',
          borderRadius: 'var(--radius-xl)',
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <ProductImage
          src={images[idx]}
          alt={alt}
          placeholder={placeholder}
          sizes="(min-width: 768px) 50vw, 100vw"
          priority
          aspect="1/1"
          className="!rounded-none"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="btn-icon absolute left-3 top-1/2 -translate-y-1/2"
              data-on-image="true"
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              aria-label="Předchozí foto"
              aria-disabled={!canPrev}
              disabled={!canPrev}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className="btn-icon absolute right-3 top-1/2 -translate-y-1/2"
              data-on-image="true"
              onClick={() => setIdx((i) => Math.min(images.length - 1, i + 1))}
              aria-label="Další foto"
              aria-disabled={!canNext}
              disabled={!canNext}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-label={`Foto ${i + 1}`}
                  className="h-1.5 rounded-full transition-all duration-200"
                  style={{
                    width: i === idx ? '18px' : '6px',
                    background: i === idx ? '#fff' : 'rgba(255,255,255,0.45)',
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Zobrazit foto ${i + 1}`}
              className="overflow-hidden transition-opacity duration-150"
              style={{
                background: 'var(--color-cream)',
                opacity: i === idx ? 1 : 0.55,
                outline: i === idx ? '2px solid var(--color-forest)' : 'none',
                outlineOffset: '2px',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <ProductImage
                src={src}
                alt={`${alt} ${i + 1}`}
                placeholder={placeholder}
                sizes="(min-width: 768px) 12vw, 25vw"
                aspect="1/1"
                className="!rounded-none"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductPageClient({
  product,
  related = [],
}: {
  product: ProductView;
  related?: ProductSummaryView[];
}) {
  const [selected, setSelected] = useState<VariantView>(product.variants[0]);

  const displayImages =
    selected.imageUrls && selected.imageUrls.length > 0
      ? selected.imageUrls
      : product.imageUrls;

  const images = displayImages.length > 0 ? displayImages : [null];

  return (
    <>
      {/* ── Gallery ── */}
      <div key={selected.sku} className="page-transition">
        <ProductGallery images={images} alt={product.title} placeholder={product.placeholder} />
      </div>

      {/* ── Info panel ── */}
      <div className="md:sticky md:self-start" style={{ top: 'calc(88px + 1.5rem)' }}>
        {/* Eyebrow */}
        <Eyebrow tone="forest" serif size="md">
          {product.category?.title ?? 'Produkt'}
        </Eyebrow>

        {/* Title */}
        <h1
          className="font-poppins-semibold mt-2 leading-[1.05]"
          style={{
            fontSize: 'var(--text-h1)',
            letterSpacing: '-0.03em',
            color: 'var(--color-ink)',
          }}
        >
          {product.title}
        </h1>

        {/* Short description */}
        {product.shortDescription && (
          <p
            className="font-poppins-light mt-3 leading-relaxed"
            style={{
              fontSize: 'var(--text-body)',
              color: 'var(--color-text-muted)',
              maxWidth: '46ch',
            }}
          >
            {product.shortDescription}
          </p>
        )}

        <ProductBuyBox
          product={product}
          selectedVariant={selected}
          onVariantChange={setSelected}
        />

        {product.descriptionText && (
          <p
            className="font-poppins-regular mt-10 leading-relaxed"
            style={{
              fontSize: 'var(--text-small)',
              color: 'var(--color-text-muted)',
              borderTop: '1px solid var(--color-border-subtle)',
              paddingTop: '1.5rem',
            }}
          >
            {product.descriptionText}
          </p>
        )}
      </div>

      {/* ── Community voice (testimonial stub) — spans both columns ───── */}
      <CommunityVoice />

      {/* ── Related products — spans both columns ─────────────────── */}
      {related.length > 0 && (
        <RelatedProducts items={related} category={product.category?.title} />
      )}
    </>
  );
}

/* ─── Community voice block ──────────────────────────────────────────── */

const VOICES = [
  {
    name: 'Klára M.',
    location: 'Praha',
    text:
      'Kabelka přišla zabalená jako dárek a kvalita kůže předčila moje očekávání. Nosím ji každý den, sluší úplně ke všemu.',
  },
  {
    name: 'Petra V.',
    location: 'Brno',
    text:
      'Objednávala jsem kufr před cestou na Kanáry — dorazil druhý den a kolečka fungují i po čtyřech přesunech letadlem.',
  },
  {
    name: 'Adéla J.',
    location: 'Olomouc',
    text:
      'Příjemná komunikace přes Instagram a holky mi pomohly vybrat barvu. Až teď jsem zjistila, že je to česká značka — paráda.',
  },
];

function CommunityVoice() {
  return (
    <section
      className="md:col-span-2"
      style={{ paddingTop: 'var(--section-py)' }}
    >
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <Eyebrow tone="forest" serif size="md">
            Z naší komunity
          </Eyebrow>
          <h2
            className="font-poppins-semibold mt-1 leading-[1.1]"
            style={{
              fontSize: 'var(--text-h2)',
              letterSpacing: '-0.025em',
              color: 'var(--color-ink)',
            }}
          >
            Co píšou zákaznice
          </h2>
        </div>
        <a
          href="https://instagram.com/levstra"
          target="_blank"
          rel="noreferrer"
          className="font-poppins-medium hidden hover:underline md:inline-block"
          style={{ fontSize: 'var(--text-small)', color: 'var(--color-forest)' }}
        >
          @levstra na Instagramu →
        </a>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-5">
        {VOICES.map((v) => (
          <figure
            key={v.name}
            className="flex flex-col justify-between p-6"
            style={{
              background: 'var(--color-cream)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <svg
              width="22"
              height="18"
              viewBox="0 0 22 18"
              fill="var(--color-forest)"
              aria-hidden="true"
              className="opacity-30"
            >
              <path d="M0 18V11C0 5 3 1 9 0v3c-3 1-5 4-5 7h5v8H0Zm12 0v-7c0-6 3-10 9-11v3c-3 1-5 4-5 7h5v8h-9Z" />
            </svg>
            <blockquote
              className="font-serif mt-3 leading-relaxed"
              style={{
                fontSize: 'var(--text-body)',
                color: 'var(--color-ink)',
              }}
            >
              „{v.text}"
            </blockquote>
            <figcaption
              className="font-poppins-semibold mt-4"
              style={{ fontSize: 'var(--text-small)', color: 'var(--color-forest)' }}
            >
              {v.name}
              <span
                className="font-poppins-regular ml-2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                · {v.location}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ─── Related products row ──────────────────────────────────────────── */

function RelatedProducts({
  items,
  category,
}: {
  items: ProductSummaryView[];
  category?: string;
}) {
  return (
    <section
      className="md:col-span-2"
      style={{ paddingTop: 'var(--section-py)', paddingBottom: '2rem' }}
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <Eyebrow tone="forest" serif size="md">
            Mohlo by se vám líbit
          </Eyebrow>
          <h2
            className="font-poppins-semibold mt-1 leading-[1.1]"
            style={{
              fontSize: 'var(--text-h2)',
              letterSpacing: '-0.025em',
              color: 'var(--color-ink)',
            }}
          >
            Další {category?.toLowerCase() ?? 'kousky'}
          </h2>
        </div>
      </div>

      <div
        className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((p) => (
          <div
            key={p._id}
            className="w-[62vw] shrink-0 md:w-auto"
            style={{ scrollSnapAlign: 'start' }}
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
