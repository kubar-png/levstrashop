import type { CampaignProduct, Format, Palette, TemplateId, VariantSpec } from './types';
import { LIFESTYLE_TEMPLATES } from './types';
import { LIFESTYLE_BACKGROUNDS, PALETTES } from './assets';
import { pickHeadline, pickCta, pickBenefits, salePercent } from './copy';

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

// Templates that show the product photo and work for any product.
const PRODUCT_TEMPLATES: TemplateId[] = ['banner', 'colorBlock', 'split', 'features', 'statement', 'sale'];

function buildVariant(rng: () => number, products: CampaignProduct[], format: Format, lockProductId?: string): VariantSpec {
  const pick = (n: number) => Math.floor(rng() * n);

  const pool = lockProductId ? products.filter((p) => p.id === lockProductId) : products;
  const product = (pool.length ? pool : products)[pick(pool.length ? pool.length : products.length)];

  // Lifestyle templates only when a model photo matches the product's category —
  // keeps the product on the photo consistent (no handbag model on a suitcase ad).
  const matchingBgs = LIFESTYLE_BACKGROUNDS.filter((b) => b.category === product.category);

  // 'sale' template only for a product that is actually discounted.
  const productPool = PRODUCT_TEMPLATES.filter((t) => t !== 'sale' || salePercent(product) !== null);
  const templates = matchingBgs.length > 0 ? [...productPool, ...LIFESTYLE_TEMPLATES] : productPool;
  const template = templates[pick(templates.length)];

  const lifestyleUrl = LIFESTYLE_TEMPLATES.includes(template)
    ? matchingBgs[pick(matchingBgs.length)].url
    : undefined;

  const palette: Palette = PALETTES[pick(PALETTES.length)];

  return {
    format,
    template,
    product,
    lifestyleUrl,
    headline: pickHeadline(product, pick, { sale: template === 'sale' }),
    cta: pickCta(pick),
    benefits: pickBenefits(pick, 3),
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
