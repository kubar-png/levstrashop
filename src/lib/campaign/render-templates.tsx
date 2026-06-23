import React from 'react';
import type { VariantSpec } from './types';
import { DIMENSIONS } from './types';
import { salePercent } from './copy';

// Shared building blocks ----------------------------------------------------

function Wordmark({ color, shadow }: { color: string; shadow?: boolean }) {
  return (
    <div style={{ display: 'flex', fontFamily: 'Poppins', fontWeight: 600, fontSize: 34, letterSpacing: 1, color, textShadow: shadow ? '0 1px 8px rgba(0,0,0,0.5)' : 'none' }}>
      Ciaobag
    </div>
  );
}

function CtaPill({ label, bg, ink }: { label: string; bg: string; ink: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', alignSelf: 'flex-start', background: bg, color: ink, fontFamily: 'Poppins', fontWeight: 600, fontSize: 38, padding: '22px 46px', borderRadius: 999 }}>
      {label}
    </div>
  );
}

function PriceRow({ spec, color, shadow }: { spec: VariantSpec; color: string; shadow?: boolean }) {
  const pct = salePercent(spec.product);
  const shadowStyle = shadow ? '0 2px 14px rgba(0,0,0,0.6)' : 'none';
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, fontFamily: 'Poppins', color }}>
      {spec.product.compareAtCents && pct ? (
        <div style={{ display: 'flex', fontSize: 30, textDecoration: 'line-through', opacity: 0.7, textShadow: shadowStyle }}>
          {(spec.product.compareAtCents / 100).toLocaleString('cs-CZ')} Kč
        </div>
      ) : null}
      <div style={{ display: 'flex', fontWeight: 600, fontSize: 48, textShadow: shadowStyle }}>
        {(spec.product.priceCents / 100).toLocaleString('cs-CZ')} Kč
      </div>
    </div>
  );
}

// Root ----------------------------------------------------------------------

export function renderVariant(spec: VariantSpec): React.ReactElement {
  const { width, height } = DIMENSIONS[spec.format];
  const tall = spec.format === '9x16';
  const padTop = tall ? 220 : 90;
  const padBottom = tall ? 320 : 90;
  const { palette: pal } = spec;
  const onPhoto = spec.archetype === 'lifestyle' || spec.archetype === 'productLifestyle';

  return (
    <div style={{ width, height, display: 'flex', flexDirection: 'column', position: 'relative', background: pal.bg, fontFamily: 'Poppins', overflow: 'hidden' }}>
      {/* Background photo for lifestyle archetypes */}
      {onPhoto && spec.lifestyleUrl ? (
        <img src={spec.lifestyleUrl} width={width} height={height} style={{ position: 'absolute', inset: 0, objectFit: 'cover' }} />
      ) : null}

      {/* Readability gradient over photo */}
      {onPhoto ? (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0.45) 62%, rgba(0,0,0,0.82) 100%)' }} />
      ) : null}

      {/* productOnColor / productLifestyle: product photo card */}
      {(spec.archetype === 'productOnColor' || spec.archetype === 'sale') ? (
        <div style={{ position: 'absolute', top: tall ? height * 0.16 : 0, left: 0, right: 0, bottom: tall ? padBottom + 280 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={spec.product.imageUrl} width={tall ? 760 : 620} height={tall ? 760 : 620} style={{ objectFit: 'contain' }} />
        </div>
      ) : null}
      {spec.archetype === 'productLifestyle' ? (
        <div style={{ position: 'absolute', top: padTop, right: 70, display: 'flex', width: 300, height: 300, borderRadius: 24, overflow: 'hidden', border: `6px solid ${pal.ink}` }}>
          <img src={spec.product.imageUrl} width={300} height={300} style={{ objectFit: 'cover' }} />
        </div>
      ) : null}

      {/* Top bar: wordmark + optional sale badge */}
      <div style={{ position: 'absolute', top: padTop - (tall ? 120 : 30), left: 90, right: 90, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Wordmark color={onPhoto ? '#ffffff' : pal.ink} shadow={onPhoto} />
        {spec.archetype === 'sale' && salePercent(spec.product) ? (
          <div style={{ display: 'flex', background: pal.accent, color: pal.ctaInk, fontWeight: 600, fontSize: 40, padding: '14px 28px', borderRadius: 18 }}>
            −{salePercent(spec.product)} %
          </div>
        ) : null}
      </div>

      {/* Bottom content block: headline + price + CTA */}
      <div style={{ position: 'absolute', left: 90, right: 90, bottom: padBottom, display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ display: 'flex', fontFamily: 'Forum', fontSize: tall ? 92 : 76, lineHeight: 1.05, color: onPhoto ? '#ffffff' : pal.ink, maxWidth: 900, textShadow: onPhoto ? '0 2px 16px rgba(0,0,0,0.6)' : 'none' }}>
          {spec.headline}
        </div>
        {spec.archetype !== 'lifestyle' ? <PriceRow spec={spec} color={onPhoto ? '#ffffff' : pal.ink} shadow={onPhoto} /> : null}
        <CtaPill label={spec.cta} bg={pal.cta} ink={pal.ctaInk} />
      </div>
    </div>
  );
}
