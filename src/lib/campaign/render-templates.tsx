import React from 'react';
import type { VariantSpec } from './types';
import { DIMENSIONS } from './types';
import { salePercent } from './copy';

// Shared building blocks ----------------------------------------------------

function CtaPill({ label, bg, ink }: { label: string; bg: string; ink: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', alignSelf: 'flex-start', background: bg, color: ink, fontFamily: 'Poppins', fontWeight: 600, fontSize: 38, padding: '22px 46px', borderRadius: 999 }}>
      {label}
    </div>
  );
}

function PriceRow({ spec }: { spec: VariantSpec }) {
  const pct = salePercent(spec.product);
  const shadow = '0 2px 14px rgba(0,0,0,0.75)';
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, fontFamily: 'Poppins', color: '#ffffff' }}>
      {spec.product.compareAtCents && pct ? (
        <div style={{ display: 'flex', fontSize: 32, fontWeight: 600, textDecoration: 'line-through', opacity: 0.8, textShadow: shadow }}>
          {(spec.product.compareAtCents / 100).toLocaleString('cs-CZ')} Kč
        </div>
      ) : null}
      <div style={{ display: 'flex', fontWeight: 700, fontSize: 50, textShadow: shadow }}>
        {(spec.product.priceCents / 100).toLocaleString('cs-CZ')} Kč
      </div>
    </div>
  );
}

// Root ----------------------------------------------------------------------

export function renderVariant(spec: VariantSpec): React.ReactElement {
  const { width, height } = DIMENSIONS[spec.format];
  const tall = spec.format === '9x16';
  const padX = 90;
  const padTop = tall ? 96 : 56;
  const padBottom = tall ? 300 : 96;
  const pal = spec.palette;
  const pct = salePercent(spec.product);

  // Full-bleed background: the model photo for lifestyle archetypes, otherwise
  // the product photo itself fills the whole frame.
  const onModel = spec.archetype === 'lifestyle' || spec.archetype === 'productLifestyle';
  const bgUrl = onModel ? spec.lifestyleUrl : spec.product.imageUrl;

  return (
    <div style={{ width, height, display: 'flex', position: 'relative', background: pal.bg, fontFamily: 'Poppins', overflow: 'hidden' }}>
      {/* Full-bleed background photo */}
      {bgUrl ? (
        <img src={bgUrl} width={width} height={height} style={{ position: 'absolute', inset: 0, objectFit: 'cover' }} />
      ) : null}

      {/* Top scrim — keeps the wordmark / badge legible on light photos */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 280, display: 'flex', backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.48) 0%, rgba(0,0,0,0) 100%)' }} />

      {/* Bottom shade — the dark backing behind the headline block */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: tall ? 1000 : 580, display: 'flex', backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.88) 100%)' }} />

      {/* productLifestyle: product photo as a framed thumbnail */}
      {spec.archetype === 'productLifestyle' ? (
        <div style={{ position: 'absolute', top: padTop + 78, right: padX, display: 'flex', width: 300, height: 300, borderRadius: 24, overflow: 'hidden', border: '6px solid #ffffff' }}>
          <img src={spec.product.imageUrl} width={300} height={300} style={{ objectFit: 'cover' }} />
        </div>
      ) : null}

      {/* Top bar: wordmark + optional sale badge */}
      <div style={{ position: 'absolute', top: padTop, left: padX, right: padX, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', fontFamily: 'Poppins', fontWeight: 700, fontSize: 36, letterSpacing: 1, color: '#ffffff', textShadow: '0 1px 10px rgba(0,0,0,0.6)' }}>
          Ciaobag
        </div>
        {spec.archetype === 'sale' && pct ? (
          <div style={{ display: 'flex', background: pal.accent, color: pal.ctaInk, fontFamily: 'Poppins', fontWeight: 700, fontSize: 42, padding: '14px 30px', borderRadius: 18 }}>
            −{pct} %
          </div>
        ) : null}
      </div>

      {/* Bottom content: bold headline + price + CTA */}
      <div style={{ position: 'absolute', left: padX, right: padX, bottom: padBottom, display: 'flex', flexDirection: 'column', gap: 26 }}>
        <div style={{ display: 'flex', fontFamily: 'Poppins', fontWeight: 700, fontSize: tall ? 88 : 74, lineHeight: 1.05, color: '#ffffff', maxWidth: 920, textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
          {spec.headline}
        </div>
        {spec.archetype !== 'lifestyle' ? <PriceRow spec={spec} /> : null}
        <CtaPill label={spec.cta} bg={pal.cta} ink={pal.ctaInk} />
      </div>
    </div>
  );
}
