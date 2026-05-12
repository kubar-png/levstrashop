/**
 * Promo-code validation + application.
 *
 * Used by:
 *   - /api/discount/validate    (preview the discount as the buyer types it)
 *   - /api/checkout             (server-side re-validation before payment)
 *   - webhooks                  (increment redemptionCount after PAID)
 *
 * Discount lives in Sanity (schema: `discount`). Validation is always
 * server-side — never trust a discountCents value coming from the client.
 */

import { groq } from 'next-sanity';
import { sanityClient, sanityWriteClient } from '@/sanity/client';
import { isSanityConfigured, isSanityWritable } from '@/sanity/env';

export type DiscountType = 'percent' | 'fixed' | 'free-shipping';

export type DiscountDoc = {
  _id: string;
  code: string;
  description?: string;
  active?: boolean;
  type: DiscountType;
  value?: number;
  minOrderCents?: number;
  maxRedemptions?: number;
  redemptionCount?: number;
  validFrom?: string;
  validUntil?: string;
};

export type DiscountValidationResult =
  | {
      ok: true;
      code: string;
      type: DiscountType;
      value: number;
      /** Amount removed from the order total, in haléře. May be 0 for free-shipping. */
      discountCents: number;
      /** True when free-shipping promo wins (shipping becomes 0 regardless of threshold). */
      forcesFreeShipping: boolean;
      docId: string;
    }
  | {
      ok: false;
      error: string;
    };

const HUMAN_REASONS: Record<string, string> = {
  unknown: 'Tento kód neznáme.',
  inactive: 'Tento kód není momentálně aktivní.',
  notStarted: 'Tento kód ještě nezačal platit.',
  expired: 'Platnost tohoto kódu vypršela.',
  exhausted: 'Tento kód byl už plně uplatněn.',
  minOrder: 'Pro tento kód je potřeba vyšší hodnota košíku.',
  notConfigured: 'Slevové kódy zatím nejsou k dispozici.',
};

const discountByCodeQuery = groq`*[_type == "discount" && lower(code) == lower($code)][0]{
  _id, code, description, active, type, value,
  minOrderCents, maxRedemptions, redemptionCount, validFrom, validUntil
}`;

/**
 * Validates a code against Sanity and computes the resulting discount.
 *
 * @param code        User-entered code (case-insensitive).
 * @param subtotalCents  Items subtotal (no shipping). Required so we can
 *                       compute percent discounts + enforce minOrder.
 * @param shippingCents  Current shipping cost (matters for free-shipping codes).
 */
export async function validateDiscount(
  code: string,
  subtotalCents: number,
  shippingCents: number,
): Promise<DiscountValidationResult> {
  const trimmed = (code ?? '').trim();
  if (!trimmed) return { ok: false, error: HUMAN_REASONS.unknown };

  if (!isSanityConfigured()) {
    return { ok: false, error: HUMAN_REASONS.notConfigured };
  }

  let doc: DiscountDoc | null = null;
  try {
    doc = await sanityClient.fetch<DiscountDoc | null>(discountByCodeQuery, { code: trimmed });
  } catch {
    return { ok: false, error: HUMAN_REASONS.unknown };
  }
  if (!doc) return { ok: false, error: HUMAN_REASONS.unknown };
  if (!doc.active) return { ok: false, error: HUMAN_REASONS.inactive };

  const now = Date.now();
  if (doc.validFrom && Date.parse(doc.validFrom) > now) {
    return { ok: false, error: HUMAN_REASONS.notStarted };
  }
  if (doc.validUntil && Date.parse(doc.validUntil) < now) {
    return { ok: false, error: HUMAN_REASONS.expired };
  }
  if (
    typeof doc.maxRedemptions === 'number' &&
    typeof doc.redemptionCount === 'number' &&
    doc.redemptionCount >= doc.maxRedemptions
  ) {
    return { ok: false, error: HUMAN_REASONS.exhausted };
  }
  if (typeof doc.minOrderCents === 'number' && subtotalCents < doc.minOrderCents) {
    return { ok: false, error: HUMAN_REASONS.minOrder };
  }

  /* ── Compute discount amount in haléře. ─────────────────────────── */
  let discountCents = 0;
  let forcesFreeShipping = false;
  const value = typeof doc.value === 'number' ? doc.value : 0;

  if (doc.type === 'percent') {
    discountCents = Math.round((subtotalCents * Math.min(value, 100)) / 100);
  } else if (doc.type === 'fixed') {
    /* User inputs Kč; convert to haléře, cap at subtotal. */
    discountCents = Math.min(value * 100, subtotalCents);
  } else if (doc.type === 'free-shipping') {
    forcesFreeShipping = true;
    discountCents = shippingCents;
  }

  return {
    ok: true,
    code: doc.code,
    type: doc.type,
    value,
    discountCents,
    forcesFreeShipping,
    docId: doc._id,
  };
}

/**
 * Increment the redemption counter after a paid order. Best-effort —
 * a failure does not invalidate the order.
 */
export async function incrementRedemption(discountDocId: string): Promise<void> {
  if (!isSanityWritable()) return;
  try {
    await sanityWriteClient
      .patch(discountDocId)
      .setIfMissing({ redemptionCount: 0 })
      .inc({ redemptionCount: 1 })
      .commit();
  } catch (err) {
    console.error('[discount] incrementRedemption failed:', err);
  }
}
