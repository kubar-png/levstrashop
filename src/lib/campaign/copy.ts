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
