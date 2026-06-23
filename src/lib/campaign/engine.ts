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
