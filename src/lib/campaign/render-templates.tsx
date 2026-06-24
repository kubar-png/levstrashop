import React from 'react';
import type { VariantSpec } from './types';
import { DIMENSIONS } from './types';
import { salePercent } from './copy';

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

const czk = (cents: number) => `${Math.round(cents / 100).toLocaleString('cs-CZ')} Kč`;

function Sparkle({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill={color}>
      <path d="M16 2c1.5 5.2 4.3 8 9.5 9.5C20.3 13 17.5 15.8 16 21c-1.5-5.2-4.3-8-9.5-9.5C11.7 10 14.5 7.2 16 2Z" />
      <path d="M16 11c1.5 5.2 4.3 8 9.5 9.5C20.3 22 17.5 24.8 16 30c-1.5-5.2-4.3-8-9.5-9.5C11.7 19 14.5 16.2 16 11Z" />
    </svg>
  );
}

// Brand lockup: sparkle mark + lowercase "ciaobag" wordmark (serif), matching the site logo.
function BrandLockup({ color, accent, shadow, size = 40 }: { color: string; accent: string; shadow: boolean; size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(size * 0.26) }}>
      <Sparkle size={size} color={accent} />
      <div style={{ display: 'flex', fontFamily: 'Forum', fontSize: size, color, letterSpacing: 0.5, textShadow: shadow ? '0 1px 3px rgba(0,0,0,0.3)' : 'none' }}>
        ciaobag
      </div>
    </div>
  );
}

function CtaPill({ label, bg, ink, size = 36 }: { label: string; bg: string; ink: string; size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', alignSelf: 'flex-start', background: bg, color: ink, fontFamily: 'Poppins', fontWeight: 600, fontSize: size, padding: `${Math.round(size * 0.56)}px ${Math.round(size * 1.2)}px`, borderRadius: 16 }}>
      {label}
    </div>
  );
}

function SaleBadge({ pct, bg, ink, big }: { pct: number; bg: string; ink: string; big?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, color: ink, fontFamily: 'Poppins', fontWeight: 700, fontSize: big ? 92 : 42, padding: big ? '20px 34px' : '12px 26px', borderRadius: 20, lineHeight: 1 }}>
      −{pct} %
    </div>
  );
}

function PriceLine({ spec, color, shadow, size = 48 }: { spec: VariantSpec; color: string; shadow: boolean; size?: number }) {
  const pct = salePercent(spec.product);
  const ts = shadow ? '0 1px 3px rgba(0,0,0,0.32)' : 'none';
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, fontFamily: 'Poppins', color }}>
      {spec.product.compareAtCents && pct ? (
        <div style={{ display: 'flex', fontSize: Math.round(size * 0.62), fontWeight: 600, textDecoration: 'line-through', opacity: 0.75, textShadow: ts }}>
          {czk(spec.product.compareAtCents)}
        </div>
      ) : null}
      <div style={{ display: 'flex', fontWeight: 700, fontSize: size, textShadow: ts }}>{czk(spec.product.priceCents)}</div>
    </div>
  );
}

function ProductTile({ url, w, h, radius = 28 }: { url: string; w: number; h: number; radius?: number }) {
  return (
    <div style={{ display: 'flex', width: w, height: h, borderRadius: radius, overflow: 'hidden' }}>
      <img src={url} width={w} height={h} style={{ objectFit: 'cover' }} />
    </div>
  );
}

type Ctx = {
  spec: VariantSpec;
  width: number;
  height: number;
  tall: boolean;
  padX: number;
  padTop: number;
  padBottom: number;
  pal: VariantSpec['palette'];
  pct: number | null;
};

const WHITE = '#ffffff';

// ---------------------------------------------------------------------------
// Photo templates (white text over the photo, with scrims)
// ---------------------------------------------------------------------------

function PhotoScrims() {
  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 280, display: 'flex', backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0) 100%)' }} />
      {/* Soft fade behind the text — does the readability work instead of a hard glyph shadow. */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '74%', display: 'flex', backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.26) 38%, rgba(0,0,0,0.58) 66%, rgba(0,0,0,0.84) 100%)' }} />
    </>
  );
}

function photoTemplate(ctx: Ctx, bgUrl: string, opts: { bigSale?: boolean; benefits?: boolean }) {
  const { spec, width, height, tall, padX, padTop, padBottom, pal, pct } = ctx;
  return (
    <div style={{ width, height, display: 'flex', position: 'relative', background: pal.bg, fontFamily: 'Poppins', overflow: 'hidden' }}>
      <img src={bgUrl} width={width} height={height} style={{ position: 'absolute', inset: 0, objectFit: 'cover' }} />
      <PhotoScrims />

      <div style={{ position: 'absolute', top: padTop, left: padX, right: padX, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <BrandLockup color={WHITE} accent="#e1f861" shadow />
        {pct && opts.bigSale ? <SaleBadge pct={pct} bg={pal.accent} ink={pal.ctaInk} big /> : pct ? <SaleBadge pct={pct} bg={pal.accent} ink={pal.ctaInk} /> : null}
      </div>

      <div style={{ position: 'absolute', left: padX, right: padX, bottom: padBottom, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {opts.benefits ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 6 }}>
            {spec.benefits.slice(0, 3).map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Sparkle size={30} color="#e1f861" />
                <div style={{ display: 'flex', fontFamily: 'Poppins', fontWeight: 600, fontSize: 34, color: WHITE, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>{b}</div>
              </div>
            ))}
          </div>
        ) : null}
        <div style={{ display: 'flex', fontFamily: 'Poppins', fontWeight: 700, fontSize: tall ? 86 : 72, lineHeight: 1.05, color: WHITE, maxWidth: 920, textShadow: '0 1px 4px rgba(0,0,0,0.32)' }}>
          {spec.headline}
        </div>
        <PriceLine spec={spec} color={WHITE} shadow />
        <CtaPill label={spec.cta} bg={pal.cta} ink={pal.ctaInk} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Colour templates (ink text on a solid brand colour)
// ---------------------------------------------------------------------------

function colorBlockTemplate(ctx: Ctx) {
  const { spec, width, height, tall, padX, padTop, padBottom, pal, pct } = ctx;
  const tile = tall ? 760 : 520;
  return (
    <div style={{ width, height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: pal.bg, fontFamily: 'Poppins', overflow: 'hidden', position: 'relative', paddingTop: tall ? 210 : 150, paddingBottom: tall ? 560 : 340 }}>
      <div style={{ position: 'absolute', top: padTop, left: padX, right: padX, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <BrandLockup color={pal.ink} accent={pal.accent} shadow={false} />
        {pct ? <SaleBadge pct={pct} bg={pal.accent} ink={pal.ctaInk} /> : null}
      </div>
      <ProductTile url={spec.product.imageUrl} w={tile} h={tile} radius={36} />
      <div style={{ position: 'absolute', left: padX, right: padX, bottom: padBottom, display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', fontFamily: 'Poppins', fontWeight: 700, fontSize: tall ? 80 : 66, lineHeight: 1.04, color: pal.ink, maxWidth: 900 }}>{spec.headline}</div>
        <PriceLine spec={spec} color={pal.ink} shadow={false} />
        <CtaPill label={spec.cta} bg={pal.cta} ink={pal.ctaInk} />
      </div>
    </div>
  );
}

function splitTemplate(ctx: Ctx) {
  const { spec, width, height, tall, padX, padTop, pal, pct } = ctx;
  const photoH = Math.round(height * (tall ? 0.56 : 0.6));
  return (
    <div style={{ width, height, display: 'flex', flexDirection: 'column', background: pal.bg, fontFamily: 'Poppins', overflow: 'hidden' }}>
      <div style={{ display: 'flex', position: 'relative', width, height: photoH }}>
        <img src={spec.product.imageUrl} width={width} height={photoH} style={{ position: 'absolute', inset: 0, objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 220, display: 'flex', backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)' }} />
        <div style={{ position: 'absolute', top: padTop, left: padX, right: padX, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <BrandLockup color={WHITE} accent="#e1f861" shadow />
          {pct ? <SaleBadge pct={pct} bg={pal.accent} ink={pal.ctaInk} /> : null}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', padding: `${tall ? 60 : 50}px ${padX}px`, gap: 22 }}>
        <div style={{ display: 'flex', fontFamily: 'Poppins', fontWeight: 700, fontSize: tall ? 72 : 60, lineHeight: 1.05, color: pal.ink, maxWidth: 900 }}>{spec.headline}</div>
        <PriceLine spec={spec} color={pal.ink} shadow={false} />
        <CtaPill label={spec.cta} bg={pal.cta} ink={pal.ctaInk} />
      </div>
    </div>
  );
}

function featuresTemplate(ctx: Ctx) {
  const { spec, width, height, tall, padX, padTop, padBottom, pal, pct } = ctx;
  const tile = tall ? 900 : 470;
  return (
    <div style={{ width, height, display: 'flex', flexDirection: 'column', background: pal.bg, fontFamily: 'Poppins', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: padTop, left: padX, right: padX, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <BrandLockup color={pal.ink} accent={pal.accent} shadow={false} />
        {pct ? <SaleBadge pct={pct} bg={pal.accent} ink={pal.ctaInk} /> : null}
      </div>

      {/* product + benefits: stacked on 9:16, side-by-side on 1:1 */}
      <div style={{ display: 'flex', flexDirection: tall ? 'column' : 'row', alignItems: 'center', gap: tall ? 56 : 64, flexGrow: 1, padding: `${tall ? padTop + 120 : padTop + 80}px ${padX}px ${tall ? padBottom + 220 : 260}px`, justifyContent: 'center' }}>
        <ProductTile url={spec.product.imageUrl} w={tile} h={tile} radius={32} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 30, maxWidth: tall ? 920 : 420 }}>
          {spec.benefits.slice(0, 3).map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <Sparkle size={42} color={pal.accent} />
              <div style={{ display: 'flex', fontFamily: 'Poppins', fontWeight: 600, fontSize: 42, color: pal.ink }}>{b}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', left: padX, right: padX, bottom: padBottom, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', fontFamily: 'Poppins', fontWeight: 700, fontSize: tall ? 60 : 50, lineHeight: 1.05, color: pal.ink, maxWidth: 900 }}>{spec.headline}</div>
        <CtaPill label={spec.cta} bg={pal.cta} ink={pal.ctaInk} />
      </div>
    </div>
  );
}

function statementTemplate(ctx: Ctx) {
  const { spec, width, height, tall, padX, padTop, padBottom, pal, pct } = ctx;
  const tile = tall ? 440 : 300;
  return (
    <div style={{ width, height, display: 'flex', background: pal.bg, fontFamily: 'Poppins', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: padTop, left: padX, right: padX, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <BrandLockup color={pal.ink} accent={pal.accent} shadow={false} />
        {pct ? <SaleBadge pct={pct} bg={pal.accent} ink={pal.ctaInk} /> : null}
      </div>
      {/* big statement headline, anchored to the top region */}
      <div style={{ position: 'absolute', top: padTop + 140, left: padX, right: padX, display: 'flex' }}>
        <div style={{ display: 'flex', fontFamily: 'Poppins', fontWeight: 700, fontSize: tall ? 104 : 78, lineHeight: 1.03, color: pal.ink, maxWidth: 900 }}>{spec.headline}</div>
      </div>
      {/* product tile + price + CTA along the bottom */}
      <div style={{ position: 'absolute', left: padX, right: padX, bottom: padBottom, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 30 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
          <PriceLine spec={spec} color={pal.ink} shadow={false} />
          <CtaPill label={spec.cta} bg={pal.cta} ink={pal.ctaInk} />
        </div>
        <ProductTile url={spec.product.imageUrl} w={tile} h={tile} radius={28} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

export function renderVariant(spec: VariantSpec): React.ReactElement {
  const { width, height } = DIMENSIONS[spec.format];
  const tall = spec.format === '9x16';
  const ctx: Ctx = {
    spec,
    width,
    height,
    tall,
    padX: 90,
    padTop: tall ? 96 : 56,
    padBottom: tall ? 300 : 96,
    pal: spec.palette,
    pct: salePercent(spec.product),
  };

  switch (spec.template) {
    case 'colorBlock':
      return colorBlockTemplate(ctx);
    case 'split':
      return splitTemplate(ctx);
    case 'features':
      return featuresTemplate(ctx);
    case 'statement':
      return statementTemplate(ctx);
    case 'sale':
      return photoTemplate(ctx, spec.product.imageUrl, { bigSale: true });
    case 'lifestyle':
      return photoTemplate(ctx, spec.lifestyleUrl ?? spec.product.imageUrl, {});
    case 'lifestyleFeatures':
      return photoTemplate(ctx, spec.lifestyleUrl ?? spec.product.imageUrl, { benefits: true });
    case 'banner':
    default:
      return photoTemplate(ctx, spec.product.imageUrl, {});
  }
}
