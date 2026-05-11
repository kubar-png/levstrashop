'use client';

import { useState } from 'react';
import { ProductImage } from './ProductImage';
import { ProductBuyBox } from './ProductBuyBox';
import { Eyebrow } from './ui';
import type { ProductView, VariantView } from '@/lib/data';

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

  return (
    <div>
      {/* Main image with nav arrows */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'var(--color-cream)',
          borderRadius: 'var(--radius-xl)',
        }}
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

export function ProductPageClient({ product }: { product: ProductView }) {
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
    </>
  );
}
