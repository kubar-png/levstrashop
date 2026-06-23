# Meta Campaign Graphic Generator — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A hidden, near-zero-input page that auto-generates on-brand Ciaobag ad creatives (1:1 and 9:16) and downloads each as a pixel-exact PNG.

**Architecture:** A pure, seeded variant engine (TypeScript) builds `VariantSpec` objects from live Sanity products + a curated lifestyle-photo pool + a CZ copy library. Each spec is base64url-encoded into the URL of a `next/og` `ImageResponse` route that renders it to an exact-size PNG via Satori. The page renders each variant as `<img src="…/render?s=…">`, so the preview *is* the downloaded file.

**Tech Stack:** Next.js 16 App Router, React 19, `next/og` (Satori), TypeScript, Sanity (existing data layer), `node:test` via `tsx` for unit tests. No new runtime dependencies.

## Global Constraints

- Next.js **16.2.6**, App Router, React 19. This is a modified Next — before writing the ImageResponse route, **read** `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/image-response.md` and `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md` and follow their API/font recipe verbatim.
- Existing working `ImageResponse` example to mirror: `src/app/opengraph-image.tsx` (`export const runtime = 'nodejs'`, JSX with inline styles, gradients, inline SVG).
- Hidden slug (fixed): **`studio-kampane-9f3k7q2x`**. All route paths below use it.
- **Never** add the slug to `src/app/robots.ts` or `src/app/sitemap.ts` (that would leak the URL). Obscurity = the slug + `robots: { index: false }` page metadata + no inbound links.
- Formats only: `1x1` → 1080×1080, `9x16` → 1080×1920.
- Brand hexes (from `src/app/globals.css`): ink `#2b312f`, forest `#2d5143`, forest-deep `#1f4537`, lime `#e1f861`, sky `#a0c8ff`, sky-light `#c7dfff`, orange `#ee7734`, cream `#f2f0eb`, blush `#ddbfb7`, red `#b43e2e`, bg `#eeeeee`.
- Brand fonts: Poppins (200 / 600), Forum (400). All copy in Czech.
- Reuse `formatPrice` from `src/lib/format.ts` for prices. Currency CZK, locale cs-CZ.
- Products: `getShopProducts('all')` from `src/lib/data.ts`. Use only entries with a real `imageUrl` and `isPlaceholder !== true`.

---

### Task 1: Campaign types + spec encode/decode

**Files:**
- Create: `src/lib/campaign/types.ts`
- Create: `src/lib/campaign/codec.ts`
- Test: `src/lib/campaign/codec.test.ts`

**Interfaces:**
- Produces:
  - `type Format = '1x1' | '9x16'`
  - `const DIMENSIONS: Record<Format, { width: number; height: number }>`
  - `type Archetype = 'lifestyle' | 'productOnColor' | 'productLifestyle' | 'sale'`
  - `type Palette = { bg: string; ink: string; accent: string; cta: string; ctaInk: string }`
  - `type CampaignProduct = { id: string; title: string; category?: string; priceCents: number; compareAtCents?: number; imageUrl: string }`
  - `type VariantSpec = { format: Format; archetype: Archetype; product: CampaignProduct; lifestyleUrl?: string; headline: string; cta: string; palette: Palette }`
  - `encodeSpec(spec: VariantSpec): string` and `decodeSpec(s: string): VariantSpec` (UTF-8-safe base64url, must round-trip Czech diacritics)

- [ ] **Step 1: Write `src/lib/campaign/types.ts`**

```ts
export type Format = '1x1' | '9x16';

export const DIMENSIONS: Record<Format, { width: number; height: number }> = {
  '1x1': { width: 1080, height: 1080 },
  '9x16': { width: 1080, height: 1920 },
};

export type Archetype = 'lifestyle' | 'productOnColor' | 'productLifestyle' | 'sale';

export type Palette = {
  bg: string;
  ink: string;
  accent: string;
  cta: string;
  ctaInk: string;
};

export type CampaignProduct = {
  id: string;
  title: string;
  category?: string;
  priceCents: number;
  compareAtCents?: number; // present only when the product is on sale
  imageUrl: string;
};

export type VariantSpec = {
  format: Format;
  archetype: Archetype;
  product: CampaignProduct;
  lifestyleUrl?: string; // background / secondary photo
  headline: string;
  cta: string;
  palette: Palette;
};
```

- [ ] **Step 2: Write the failing test `src/lib/campaign/codec.test.ts`**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeSpec, decodeSpec } from './codec.ts';
import type { VariantSpec } from './types.ts';

const sample: VariantSpec = {
  format: '9x16',
  archetype: 'sale',
  product: { id: 'p1', title: 'Kufr Příběh — žlutý', category: 'kufry', priceCents: 249900, compareAtCents: 299900, imageUrl: 'https://cdn.sanity.io/x.jpg' },
  lifestyleUrl: 'https://static.wixstatic.com/media/y.jpg',
  headline: 'Sleva 17 % na cestovní klasiku',
  cta: 'Koupit teď',
  palette: { bg: '#2d5143', ink: '#f2f0eb', accent: '#e1f861', cta: '#e1f861', ctaInk: '#2b312f' },
};

test('encodeSpec → decodeSpec round-trips, including Czech diacritics', () => {
  const out = decodeSpec(encodeSpec(sample));
  assert.deepEqual(out, sample);
});

test('encoded form is URL-safe (no +, /, =, or spaces)', () => {
  const s = encodeSpec(sample);
  assert.ok(!/[+/=\s]/.test(s), `unexpected char in ${s}`);
});
```

- [ ] **Step 3: Run it and confirm it fails**

Run: `npx tsx --test src/lib/campaign/codec.test.ts`
Expected: FAIL — `Cannot find module './codec.ts'`.

- [ ] **Step 4: Write `src/lib/campaign/codec.ts`**

```ts
import type { VariantSpec } from './types';

// btoa/atob are global in Node 18+ and browsers; TextEncoder makes it UTF-8 safe.
function base64urlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(s: string): string {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeSpec(spec: VariantSpec): string {
  return base64urlEncode(JSON.stringify(spec));
}

export function decodeSpec(s: string): VariantSpec {
  return JSON.parse(base64urlDecode(s)) as VariantSpec;
}
```

- [ ] **Step 5: Run the test and confirm it passes**

Run: `npx tsx --test src/lib/campaign/codec.test.ts`
Expected: PASS (2/2).

- [ ] **Step 6: Commit**

```bash
git add src/lib/campaign/types.ts src/lib/campaign/codec.ts src/lib/campaign/codec.test.ts
git commit -m "feat(campaign): variant spec types + URL-safe codec"
```

---

### Task 2: Copy library (CZ headlines + CTAs)

**Files:**
- Create: `src/lib/campaign/copy.ts`
- Test: `src/lib/campaign/copy.test.ts`

**Interfaces:**
- Consumes: `CampaignProduct`, `Archetype` from `./types`; `formatPrice` from `@/lib/format`.
- Produces:
  - `pickHeadline(archetype: Archetype, product: CampaignProduct, pick: (n: number) => number): string` — `pick(n)` returns an integer in `[0, n)` (supplied by the engine's RNG so output is deterministic).
  - `pickCta(pick: (n: number) => number): string`
  - `salePercent(product: CampaignProduct): number | null` — rounded % off, or `null` if not on sale.

- [ ] **Step 1: Write the failing test `src/lib/campaign/copy.test.ts`**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickHeadline, pickCta, salePercent } from './copy.ts';
import type { CampaignProduct } from './types.ts';

const sale: CampaignProduct = { id: 'a', title: 'Kufr Příběh', priceCents: 249900, compareAtCents: 299900, imageUrl: 'x' };
const plain: CampaignProduct = { id: 'b', title: 'Kabelka Lucia', priceCents: 159900, imageUrl: 'x' };
const first = () => 0; // deterministic: always the first candidate

test('salePercent computes rounded discount or null', () => {
  assert.equal(salePercent(sale), 17); // (299900-249900)/299900 ≈ 16.7 → 17
  assert.equal(salePercent(plain), null);
});

test('sale headline mentions the discount and substitutes the title', () => {
  const h = pickHeadline('sale', sale, first);
  assert.match(h, /17/);
  assert.match(h, /Kufr Příběh/);
});

test('non-sale archetype substitutes the title and never invents a price off', () => {
  const h = pickHeadline('lifestyle', plain, first);
  assert.match(h, /Kabelka Lucia/);
  assert.doesNotMatch(h, /%/);
});

test('pickCta returns a non-empty Czech CTA', () => {
  assert.ok(pickCta(first).length > 0);
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx tsx --test src/lib/campaign/copy.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/campaign/copy.ts`**

```ts
import type { Archetype, CampaignProduct } from './types';
import { formatPrice } from '@/lib/format';

export function salePercent(p: CampaignProduct): number | null {
  if (!p.compareAtCents || p.compareAtCents <= p.priceCents) return null;
  return Math.round(((p.compareAtCents - p.priceCents) / p.compareAtCents) * 100);
}

// Each template is a function of the product so prices/percentages stay correct.
type Tmpl = (p: CampaignProduct) => string;

const HEADLINES: Record<Archetype, Tmpl[]> = {
  lifestyle: [
    (p) => `${p.title} na každou cestu`,
    () => `Sbalte se se stylem`,
    () => `Cestujte se stylem`,
    (p) => `${p.title} — vaše parťačka na cesty`,
  ],
  productOnColor: [
    (p) => `${p.title}`,
    (p) => `Novinka: ${p.title}`,
    () => `Klasika, která vydrží`,
    (p) => `${p.title} už od ${formatPrice(p.priceCents)}`,
  ],
  productLifestyle: [
    (p) => `${p.title} v akci`,
    () => `Vezměte si styl s sebou`,
    (p) => `${p.title} — udělaná na cesty`,
    () => `Méně starostí, víc stylu`,
  ],
  sale: [
    (p) => `Sleva ${salePercent(p) ?? 0} % na ${p.title}`,
    (p) => `${p.title} teď za ${formatPrice(p.priceCents)}`,
    (p) => `−${salePercent(p) ?? 0} % — ${p.title}`,
    () => `Cestovní výprodej`,
  ],
};

const CTAS = ['Nakupovat', 'Objevit kolekci', 'Prohlédnout', 'Koupit teď', 'Chci ji'];

export function pickHeadline(
  archetype: Archetype,
  product: CampaignProduct,
  pick: (n: number) => number,
): string {
  const pool = HEADLINES[archetype];
  return pool[pick(pool.length)](product);
}

export function pickCta(pick: (n: number) => number): string {
  return CTAS[pick(CTAS.length)];
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npx tsx --test src/lib/campaign/copy.test.ts`
Expected: PASS (4/4).

- [ ] **Step 5: Commit**

```bash
git add src/lib/campaign/copy.ts src/lib/campaign/copy.test.ts
git commit -m "feat(campaign): CZ headline/CTA copy library"
```

---

### Task 3: Background pool + palettes

**Files:**
- Create: `src/lib/campaign/assets.ts`

**Interfaces:**
- Produces:
  - `const LIFESTYLE_BACKGROUNDS: string[]` — absolute image URLs (lifestyle/model shots already used on the live site).
  - `const PALETTES: Palette[]` — brand-token colour combos.

This task is curated constants only (no test). Source the lifestyle URLs from the existing `WIX`/`HERO_IMAGES`/`marinaModel` constants in `src/app/page.tsx` — open that file and copy the real URLs.

- [ ] **Step 1: Write `src/lib/campaign/assets.ts`**

```ts
import type { Palette } from './types';

// Lifestyle / model photography already shipping on the live site.
// Copy the real URLs from src/app/page.tsx (WIX base + HERO_IMAGES + marinaModel).
// Extend this array later if a dedicated campaign-photo folder is provided.
const WIX = 'https://static.wixstatic.com/media';
export const LIFESTYLE_BACKGROUNDS: string[] = [
  `${WIX}/f0cf6b_0fb65fabc4d54b149a2b6213e5153e9e~mv2.jpg`, // Marina model
  // TODO-AT-IMPLEMENT: paste the remaining HERO_IMAGES URLs from src/app/page.tsx here.
];

// Brand-token combinations. Keep contrast high enough for white/cream text.
export const PALETTES: Palette[] = [
  { bg: '#2d5143', ink: '#f2f0eb', accent: '#e1f861', cta: '#e1f861', ctaInk: '#2b312f' }, // forest + lime
  { bg: '#1f4537', ink: '#f2f0eb', accent: '#a0c8ff', cta: '#e1f861', ctaInk: '#2b312f' }, // deep forest + sky
  { bg: '#f2f0eb', ink: '#2b312f', accent: '#ee7734', cta: '#2d5143', ctaInk: '#f2f0eb' }, // cream + forest CTA
  { bg: '#a0c8ff', ink: '#1f4537', accent: '#2d5143', cta: '#2d5143', ctaInk: '#f2f0eb' }, // sky + forest
  { bg: '#ddbfb7', ink: '#2b312f', accent: '#b43e2e', cta: '#2d5143', ctaInk: '#f2f0eb' }, // blush + forest
];
```

> Note: the `TODO-AT-IMPLEMENT` line is an explicit instruction to copy real URLs from `src/app/page.tsx` during this step — resolve it before committing; do not leave it in.

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: no errors from `src/lib/campaign/assets.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/campaign/assets.ts
git commit -m "feat(campaign): lifestyle background pool + brand palettes"
```

---

### Task 4: Variant engine (seeded, deterministic)

**Files:**
- Create: `src/lib/campaign/engine.ts`
- Test: `src/lib/campaign/engine.test.ts`

**Interfaces:**
- Consumes: `VariantSpec`, `CampaignProduct`, `Format`, `Archetype` from `./types`; `LIFESTYLE_BACKGROUNDS`, `PALETTES` from `./assets`; `pickHeadline`, `pickCta`, `salePercent` from `./copy`.
- Produces:
  - `buildBatch(seed: number, products: CampaignProduct[], format: Format, count: number, lockProductId?: string): VariantSpec[]`

Rules: deterministic in `(seed, products, format, count, lockProductId)`. The `sale` archetype is only used for a product where `salePercent(product) !== null`; otherwise re-roll to a non-sale archetype. `productLifestyle` and `lifestyle` archetypes require a `lifestyleUrl` (set from the pool); `productOnColor` and `sale` leave it undefined. If `lockProductId` is set, every variant uses that product.

- [ ] **Step 1: Write the failing test `src/lib/campaign/engine.test.ts`**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildBatch } from './engine.ts';
import { salePercent } from './copy.ts';
import type { CampaignProduct } from './types.ts';

const products: CampaignProduct[] = [
  { id: 'a', title: 'Kufr Příběh', priceCents: 249900, compareAtCents: 299900, imageUrl: 'a.jpg' },
  { id: 'b', title: 'Kabelka Lucia', priceCents: 159900, imageUrl: 'b.jpg' },
  { id: 'c', title: 'Batoh Aria', priceCents: 99900, imageUrl: 'c.jpg' },
];

test('same seed → identical batch (deterministic)', () => {
  assert.deepEqual(buildBatch(42, products, '1x1', 6), buildBatch(42, products, '1x1', 6));
});

test('different seed → different batch (very likely)', () => {
  const same = JSON.stringify(buildBatch(1, products, '1x1', 6)) === JSON.stringify(buildBatch(2, products, '1x1', 6));
  assert.equal(same, false);
});

test('batch has the requested length and the requested format', () => {
  const batch = buildBatch(7, products, '9x16', 8);
  assert.equal(batch.length, 8);
  assert.ok(batch.every((v) => v.format === '9x16'));
});

test('sale archetype only appears on a product that is actually on sale', () => {
  for (let seed = 0; seed < 50; seed++) {
    for (const v of buildBatch(seed, products, '1x1', 6)) {
      if (v.archetype === 'sale') assert.notEqual(salePercent(v.product), null);
    }
  }
});

test('lifestyle archetypes carry a lifestyleUrl; colour archetypes do not', () => {
  for (const v of buildBatch(13, products, '1x1', 12)) {
    if (v.archetype === 'lifestyle' || v.archetype === 'productLifestyle') assert.ok(v.lifestyleUrl);
    else assert.equal(v.lifestyleUrl, undefined);
  }
});

test('lockProductId forces every variant to that product', () => {
  for (const v of buildBatch(99, products, '1x1', 6, 'b')) assert.equal(v.product.id, 'b');
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx tsx --test src/lib/campaign/engine.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/campaign/engine.ts`**

```ts
import type { Archetype, CampaignProduct, Format, Palette, VariantSpec } from './types';
import { LIFESTYLE_BACKGROUNDS, PALETTES } from './assets';
import { pickHeadline, pickCta, salePercent } from './copy';

// Deterministic PRNG (mulberry32) so a seed reproduces a whole batch.
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ARCHETYPES: Archetype[] = ['lifestyle', 'productOnColor', 'productLifestyle', 'sale'];

function buildVariant(rng: () => number, products: CampaignProduct[], format: Format, lockProductId?: string): VariantSpec {
  const pick = (n: number) => Math.floor(rng() * n);

  const pool = lockProductId ? products.filter((p) => p.id === lockProductId) : products;
  const product = (pool.length ? pool : products)[pick(pool.length ? pool.length : products.length)];

  let archetype = ARCHETYPES[pick(ARCHETYPES.length)];
  // 'sale' only valid for an on-sale product; otherwise fall back deterministically.
  if (archetype === 'sale' && salePercent(product) === null) {
    archetype = (['lifestyle', 'productOnColor', 'productLifestyle'] as Archetype[])[pick(3)];
  }

  const usesLifestyle = archetype === 'lifestyle' || archetype === 'productLifestyle';
  const lifestyleUrl = usesLifestyle && LIFESTYLE_BACKGROUNDS.length
    ? LIFESTYLE_BACKGROUNDS[pick(LIFESTYLE_BACKGROUNDS.length)]
    : undefined;

  const palette: Palette = PALETTES[pick(PALETTES.length)];

  return {
    format,
    archetype,
    product,
    lifestyleUrl,
    headline: pickHeadline(archetype, product, pick),
    cta: pickCta(pick),
    palette,
  };
}

export function buildBatch(
  seed: number,
  products: CampaignProduct[],
  format: Format,
  count: number,
  lockProductId?: string,
): VariantSpec[] {
  const out: VariantSpec[] = [];
  for (let i = 0; i < count; i++) {
    // Offset the seed per tile so each variant differs but the batch stays reproducible.
    const rng = mulberry32(seed * 1000 + i * 97 + 1);
    out.push(buildVariant(rng, products, format, lockProductId));
  }
  return out;
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npx tsx --test src/lib/campaign/engine.test.ts`
Expected: PASS (6/6).

- [ ] **Step 5: Commit**

```bash
git add src/lib/campaign/engine.ts src/lib/campaign/engine.test.ts
git commit -m "feat(campaign): deterministic seeded variant engine"
```

---

### Task 5: Render templates (Satori JSX)

**Files:**
- Create: `src/lib/campaign/render-templates.tsx`

**Interfaces:**
- Consumes: `VariantSpec`, `DIMENSIONS` from `./types`; `salePercent` from `./copy`.
- Produces: `renderVariant(spec: VariantSpec): React.ReactElement` — a single root element sized to `DIMENSIONS[spec.format]`, ready to hand to `ImageResponse`.

Constraints (Satori): every element that has children must set `display: 'flex'`; use flexbox only (no CSS grid); background photos go on an absolutely-positioned `<img>` with `objectFit: 'cover'`; gradients via `backgroundImage: 'linear-gradient(...)'`. For **9:16**, keep all text/CTA inside a safe band: top padding ≥ 220px, bottom padding ≥ 320px (clear of Stories/Reels UI). For 1:1 use 90px padding.

- [ ] **Step 1: Write `src/lib/campaign/render-templates.tsx`**

```tsx
import type { VariantSpec } from './types';
import { DIMENSIONS } from './types';
import { salePercent } from './copy';

// Shared building blocks ----------------------------------------------------

function Wordmark({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', fontFamily: 'Poppins', fontWeight: 600, fontSize: 34, letterSpacing: 1, color }}>
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

function PriceRow({ spec, color }: { spec: VariantSpec; color: string }) {
  const pct = salePercent(spec.product);
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, fontFamily: 'Poppins', color }}>
      {spec.product.compareAtCents && pct ? (
        <div style={{ display: 'flex', fontSize: 30, textDecoration: 'line-through', opacity: 0.7 }}>
          {(spec.product.compareAtCents / 100).toLocaleString('cs-CZ')} Kč
        </div>
      ) : null}
      <div style={{ display: 'flex', fontWeight: 600, fontSize: 48 }}>
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
        <div style={{ position: 'absolute', inset: 0, display: 'flex', backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.65) 100%)' }} />
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
        <Wordmark color={onPhoto ? '#ffffff' : pal.ink} />
        {spec.archetype === 'sale' && salePercent(spec.product) ? (
          <div style={{ display: 'flex', background: pal.accent, color: pal.ctaInk, fontWeight: 600, fontSize: 40, padding: '14px 28px', borderRadius: 18 }}>
            −{salePercent(spec.product)} %
          </div>
        ) : null}
      </div>

      {/* Bottom content block: headline + price + CTA */}
      <div style={{ position: 'absolute', left: 90, right: 90, bottom: padBottom, display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ display: 'flex', fontFamily: 'Forum', fontSize: tall ? 92 : 76, lineHeight: 1.05, color: onPhoto ? '#ffffff' : pal.ink, maxWidth: 900 }}>
          {spec.headline}
        </div>
        {spec.archetype !== 'lifestyle' ? <PriceRow spec={spec} color={onPhoto ? '#ffffff' : pal.ink} /> : null}
        <CtaPill label={spec.cta} bg={pal.cta} ink={pal.ctaInk} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors in `render-templates.tsx`. (Visual correctness is verified in Task 6 once the route renders it.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/campaign/render-templates.tsx
git commit -m "feat(campaign): Satori render templates for the 4 archetypes"
```

---

### Task 6: ImageResponse render route (+ fonts)

**Files:**
- Create: `src/app/studio-kampane-9f3k7q2x/render/route.tsx`
- Create: `src/app/studio-kampane-9f3k7q2x/_fonts/Poppins-SemiBold.ttf`, `Poppins-ExtraLight.ttf`, `Forum-Regular.ttf` (downloaded)
- Read first: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/image-response.md` and `.../14-metadata-and-og-images.md`

**Interfaces:**
- Consumes: `decodeSpec` from `@/lib/campaign/codec`; `DIMENSIONS` from `@/lib/campaign/types`; `renderVariant` from `@/lib/campaign/render-templates`.
- Produces: `GET(request: Request): Promise<Response>` returning `image/png`. Reads `?s=<encoded spec>`.

- [ ] **Step 1: Download the three font files**

```bash
mkdir -p src/app/studio-kampane-9f3k7q2x/_fonts
curl -sL -o src/app/studio-kampane-9f3k7q2x/_fonts/Poppins-SemiBold.ttf  "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-SemiBold.ttf"
curl -sL -o src/app/studio-kampane-9f3k7q2x/_fonts/Poppins-ExtraLight.ttf "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-ExtraLight.ttf"
curl -sL -o src/app/studio-kampane-9f3k7q2x/_fonts/Forum-Regular.ttf      "https://github.com/google/fonts/raw/main/ofl/forum/Forum-Regular.ttf"
file src/app/studio-kampane-9f3k7q2x/_fonts/*.ttf   # confirm "TrueType Font", not an HTML error page
```

Expected: each `file` line reports a TrueType/OpenType font. If a URL 404s, find the correct path under `https://github.com/google/fonts/tree/main/ofl/<family>` and retry.

- [ ] **Step 2: Read the Next docs for the ImageResponse + font API**

Read `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/image-response.md`. Confirm: how `fonts: [{ name, data, weight, style }]` is passed, and the supported way to read a local font file in a route handler for THIS Next version (mirror whatever `src/app/opengraph-image.tsx` would use; `fs.readFile(join(process.cwd(), 'src/app/studio-kampane-9f3k7q2x/_fonts/…'))` is the baseline).

- [ ] **Step 3: Write `src/app/studio-kampane-9f3k7q2x/render/route.tsx`**

```tsx
import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { decodeSpec } from '@/lib/campaign/codec';
import { DIMENSIONS } from '@/lib/campaign/types';
import { renderVariant } from '@/lib/campaign/render-templates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FONT_DIR = join(process.cwd(), 'src/app/studio-kampane-9f3k7q2x/_fonts');
async function font(file: string) {
  return readFile(join(FONT_DIR, file));
}

export async function GET(request: Request): Promise<Response> {
  const s = new URL(request.url).searchParams.get('s');
  if (!s) return new Response('missing spec', { status: 400 });

  let spec;
  try {
    spec = decodeSpec(s);
  } catch {
    return new Response('bad spec', { status: 400 });
  }

  const { width, height } = DIMENSIONS[spec.format];
  const [poppinsSemi, poppinsLight, forum] = await Promise.all([
    font('Poppins-SemiBold.ttf'),
    font('Poppins-ExtraLight.ttf'),
    font('Forum-Regular.ttf'),
  ]);

  return new ImageResponse(renderVariant(spec), {
    width,
    height,
    fonts: [
      { name: 'Poppins', data: poppinsSemi, weight: 600, style: 'normal' },
      { name: 'Poppins', data: poppinsLight, weight: 200, style: 'normal' },
      { name: 'Forum', data: forum, weight: 400, style: 'normal' },
    ],
  });
}
```

- [ ] **Step 4: Manual render check (dev)**

Run `npm run dev`. Build one encoded spec and open it. In a Node REPL or scratch file:

```bash
npx tsx -e "import('./src/lib/campaign/engine.ts').then(async (e)=>{const {encodeSpec}=await import('./src/lib/campaign/codec.ts');const p=[{id:'a',title:'Kufr Příběh',priceCents:249900,compareAtCents:299900,imageUrl:'https://static.wixstatic.com/media/f0cf6b_0fb65fabc4d54b149a2b6213e5153e9e~mv2.jpg'}];const b=e.buildBatch(1,p,'1x1',1);console.log('http://localhost:3000/studio-kampane-9f3k7q2x/render?s='+encodeURIComponent(encodeSpec(b[0])));})"
```

Open the printed URL in a browser.
Expected: a 1080×1080 PNG renders with Poppins/Forum text, brand colours, the product image, and a lime CTA pill. Repeat with `'9x16'` and confirm 1080×1920 with text inside the safe band. If fonts don't apply, re-check Step 2's font API against the doc.

- [ ] **Step 5: Commit**

```bash
git add src/app/studio-kampane-9f3k7q2x/render/route.tsx src/app/studio-kampane-9f3k7q2x/_fonts
git commit -m "feat(campaign): ImageResponse PNG render route with brand fonts"
```

---

### Task 7: Generator page (UI) + hidden-route hardening

**Files:**
- Create: `src/app/studio-kampane-9f3k7q2x/page.tsx` (server component: fetch + map products, metadata)
- Create: `src/app/studio-kampane-9f3k7q2x/Generator.tsx` (client component: batch state + grid + download)
- Verify (no edits): `src/app/robots.ts`, `src/app/sitemap.ts` — confirm the slug is absent from both.

**Interfaces:**
- Consumes: `getShopProducts` from `@/lib/data`; `CampaignProduct`, `Format` from `@/lib/campaign/types`; `buildBatch` from `@/lib/campaign/engine`; `encodeSpec` from `@/lib/campaign/codec`.
- Produces: the page at `/studio-kampane-9f3k7q2x`.

- [ ] **Step 1: Write the server page `src/app/studio-kampane-9f3k7q2x/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { getShopProducts } from '@/lib/data';
import type { CampaignProduct } from '@/lib/campaign/types';
import Generator from './Generator';

export const metadata: Metadata = {
  title: 'Kampaně — generátor',
  robots: { index: false, follow: false }, // keep it out of search; do NOT add to robots.ts/sitemap.ts
};

export default async function Page() {
  const summaries = await getShopProducts('all');
  const products: CampaignProduct[] = summaries
    .filter((p) => p.imageUrl && p.isPlaceholder !== true)
    .map((p) => {
      // Prefer a real variant price; fall back to summary price fields as available.
      const v = (p.colorVariants ?? []).find((cv) => cv.imageUrl && cv.priceCents);
      return {
        id: p._id,
        title: p.title,
        category: p.category?.title,
        priceCents: v?.priceCents ?? p.minPriceCents ?? 0,
        compareAtCents: v?.compareAtCents ?? undefined,
        imageUrl: p.imageUrl as string,
      };
    })
    .filter((p) => p.priceCents > 0);

  return <Generator products={products} />;
}
```

> At implementation: open `src/lib/types.ts` (`ProductSummaryView`) and confirm the exact field names for price (`minPriceCents`) and `colorVariants[].priceCents/compareAtCents`. Adjust the mapping to the real field names — keep the resulting `CampaignProduct` shape identical.

- [ ] **Step 2: Write the client component `src/app/studio-kampane-9f3k7q2x/Generator.tsx`**

```tsx
'use client';

import { useMemo, useState } from 'react';
import type { CampaignProduct, Format } from '@/lib/campaign/types';
import { buildBatch } from '@/lib/campaign/engine';
import { encodeSpec } from '@/lib/campaign/codec';

const BATCH = 8;
const BASE = '/studio-kampane-9f3k7q2x/render';

export default function Generator({ products }: { products: CampaignProduct[] }) {
  const [format, setFormat] = useState<Format>('1x1');
  const [seed, setSeed] = useState(1);

  const batch = useMemo(
    () => (products.length ? buildBatch(seed, products, format, BATCH) : []),
    [products, seed, format],
  );

  async function download(url: string, name: string) {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-bg, #eee)', color: 'var(--color-ink, #2b312f)', padding: '32px clamp(1rem,4vw,2rem)', fontFamily: 'var(--font-sans)' }}>
      <header style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
        <h1 style={{ fontWeight: 600, fontSize: 24, marginRight: 'auto' }}>Generátor kampaní</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['1x1', '9x16'] as Format[]).map((f) => (
            <button key={f} onClick={() => setFormat(f)} className="btn-secondary" aria-pressed={format === f}
              style={{ fontWeight: format === f ? 600 : 400 }}>
              {f === '1x1' ? '1:1' : '9:16'}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={() => setSeed((s) => s + 1)}>Generovat další</button>
      </header>

      {products.length === 0 ? (
        <p>Žádné produkty s fotkou k dispozici.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, alignItems: 'start' }}>
          {batch.map((spec, i) => {
            const url = `${BASE}?s=${encodeURIComponent(encodeSpec(spec))}`;
            const name = `ciaobag-${spec.archetype}-${spec.format}-${seed}-${i}.png`;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <img src={url} alt={spec.headline}
                  style={{ width: '100%', aspectRatio: spec.format === '1x1' ? '1 / 1' : '9 / 16', objectFit: 'cover', borderRadius: 12, background: '#fff', border: '1px solid rgba(43,49,47,0.12)' }} />
                <button className="btn-add" onClick={() => download(url, name)}>Stáhnout PNG</button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Verify in dev**

Run `npm run dev`, open `http://localhost:3000/studio-kampane-9f3k7q2x`.
Expected: a grid of 8 brand-styled creatives renders. "Generovat další" swaps them for a new set. The format toggle switches all tiles between 1:1 and 9:16. "Stáhnout PNG" downloads a correctly-sized PNG. Confirm `view-source` of the page shows `<meta name="robots" content="noindex">`.

- [ ] **Step 4: Confirm the route is not indexed/listed**

Run: `grep -rn "studio-kampane" src/app/robots.ts src/app/sitemap.ts`
Expected: **no matches** (the slug must not appear in either file).

- [ ] **Step 5: Type-check the whole project**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/studio-kampane-9f3k7q2x/page.tsx src/app/studio-kampane-9f3k7q2x/Generator.tsx
git commit -m "feat(campaign): hidden generator page with format toggle + PNG download"
```

---

## Self-Review

**Spec coverage:**
- Hidden obscure URL + noindex + not linked → Tasks 6/7 (slug routes), Task 7 metadata + Step 4 check. ✓
- 1:1 + 9:16 only → `DIMENSIONS` (Task 1), used everywhere. ✓
- Auto-generate variants, minimal input → Task 7 (load = batch; only format toggle + "Generovat další" + download). ✓
- Template copy from product data, no API → Task 2. ✓
- Satori render → PNG, WYSIWYG → Tasks 5/6, page uses same route as `<img>`. ✓
- Product + lifestyle combo archetype → `productLifestyle` (Tasks 4/5). ✓
- Lifestyle/model background pool from existing site imagery → Task 3. ✓
- 9:16 safe zones → Task 5 padding rules. ✓
- Brand colours/fonts → palettes (Task 3), font loading (Task 6), templates (Task 5). ✓

**Placeholder scan:** The only `TODO`-style marker is the `TODO-AT-IMPLEMENT` in Task 3 Step 1, which is an explicit, scoped instruction (copy real URLs from `src/app/page.tsx`) with a note to resolve before commit — acceptable. No other placeholders.

**Type consistency:** `VariantSpec`/`CampaignProduct`/`Format`/`Archetype`/`Palette` defined in Task 1 and consumed unchanged in Tasks 2–7. `buildBatch`, `encodeSpec`/`decodeSpec`, `pickHeadline`/`pickCta`/`salePercent`, `renderVariant` signatures match across producer/consumer tasks. ✓

**Known follow-ups (not blockers):** product images from Sanity are framed photos, not transparent cut-outs, so `productOnColor` shows a contained photo (acceptable, brand-consistent). If the user later supplies cut-outs or a dedicated model-photo folder, extend `assets.ts` and the `productOnColor` template.
