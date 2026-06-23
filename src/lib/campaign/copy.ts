import type { CampaignProduct } from './types';
import { formatPrice } from '@/lib/format';

export function salePercent(p: CampaignProduct): number | null {
  if (!p.compareAtCents || p.compareAtCents <= p.priceCents) return null;
  return Math.round(((p.compareAtCents - p.priceCents) / p.compareAtCents) * 100);
}

// Each template is a function of the product so prices/percentages stay correct.
type Tmpl = (p: CampaignProduct) => string;

const GENERAL: Tmpl[] = [
  (p) => `${p.title}`,
  (p) => `Novinka: ${p.title}`,
  () => `Cestujte se stylem`,
  () => `Sbalte se se stylem`,
  (p) => `${p.title} na každou cestu`,
  () => `Klasika, která vydrží`,
  () => `Vezměte si styl s sebou`,
  (p) => `${p.title} už od ${formatPrice(p.priceCents)}`,
];

const SALE: Tmpl[] = [
  (p) => `Sleva ${salePercent(p) ?? 0} % na ${p.title}`,
  (p) => `${p.title} teď za ${formatPrice(p.priceCents)}`,
  () => `Cestovní výprodej`,
  (p) => `−${salePercent(p) ?? 0} % právě teď`,
];

// Neutral CTAs only — nothing that assumes the product's gender or number
// (so "Chci ji" can't land on "Set 3"). "Chci to" works for anything.
const CTAS = ['Nakupovat', 'Koupit teď', 'Objevit kolekci', 'Prohlédnout', 'Do košíku', 'Chci to'];

// Brand-level promises, safe for any product (used by features / USP templates).
const BENEFITS = [
  'Doprava zdarma',
  'Cestujte se stylem',
  'Prémiové materiály',
  'Pro každou cestu',
  'Nadčasový design',
  'Stylový společník',
];

/** Pick a headline. `opts.sale` biases to discount copy (used by the sale
 *  template); otherwise on-sale products may still draw a sale headline. */
export function pickHeadline(
  product: CampaignProduct,
  pick: (n: number) => number,
  opts?: { sale?: boolean },
): string {
  const onSale = salePercent(product) !== null;
  let pool: Tmpl[];
  if (opts?.sale && onSale) pool = SALE;
  else if (onSale) pool = [...GENERAL, ...SALE];
  else pool = GENERAL;
  return pool[pick(pool.length)](product);
}

export function pickCta(pick: (n: number) => number): string {
  return CTAS[pick(CTAS.length)];
}

/** Pick `n` distinct benefit lines deterministically. */
export function pickBenefits(pick: (n: number) => number, n = 3): string[] {
  const pool = [...BENEFITS];
  const out: string[] = [];
  for (let i = 0; i < n && pool.length > 0; i++) {
    out.push(pool.splice(pick(pool.length), 1)[0]);
  }
  return out;
}
