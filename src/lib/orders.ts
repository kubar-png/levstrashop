/**
 * Order persistence helpers — single source of truth for Sanity order docs.
 *
 * Webhooks (Comgate + Stripe) and the checkout API import from here so order
 * state stays consistent regardless of payment provider.
 */

import { sanityWriteClient } from '@/sanity/client';
import { isSanityWritable } from '@/sanity/env';
import { groq } from 'next-sanity';

export type OrderItem = {
  productId: string;
  slug?: string;
  title: string;
  sku: string;
  size?: string;
  color?: string;
  image?: string;
  qty: number;
  priceCents: number;
};

export type OrderShipping = {
  name?: string;
  phone?: string;
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
  parcelShopId?: string;
  parcelShopName?: string;
  parcelShopAddress?: string;
};

export type OrderCustomer = {
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export type OrderBilling = {
  companyName?: string;
  ic?: string;
  dic?: string;
  sameAsShipping?: boolean;
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
};

export type OrderDiscount = {
  code: string;
  type: 'percent' | 'fixed' | 'free-shipping';
  value: number;
  discountRef?: { _type: 'reference'; _ref: string };
};

export type PendingOrderInput = {
  refId: string;
  paymentProvider: 'comgate' | 'stripe';
  email: string;
  customer?: OrderCustomer;
  billing?: OrderBilling;
  subtotalCents: number;
  shippingCents: number;
  discountCents?: number;
  totalCents: number;
  currency: string;
  shippingMode: 'home' | 'parcelshop';
  shipping: OrderShipping;
  items: OrderItem[];
  discount?: OrderDiscount;
};

export type PaidOrderUpdate = {
  comgateTransId?: string;
  stripeSessionId?: string;
  stripePaymentIntent?: string;
  paymentMethod?: string;
  isTest?: boolean;
  paidAt: string;
};

/* ── Queries ─────────────────────────────────────────────────────── */

const orderByRefIdQuery = groq`*[_type == "order" && refId == $refId][0]{
  _id, _rev, refId, status, email, totalCents, subtotalCents, shippingCents, discountCents, currency,
  paymentProvider, comgateTransId, stripeSessionId, paymentMethod, isTest,
  shippingMode, shipping, items, fulfilment, emailsSent, ecomailContactId,
  discount{ code, type, value, "discountRefId": discountRef._ref },
  createdAt, paidAt, shippedAt
}`;

export type OrderDoc = Omit<PendingOrderInput, 'discount'> & {
  _id: string;
  _rev: string;
  status: 'pending' | 'paid' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'failed';
  comgateTransId?: string;
  stripeSessionId?: string;
  paymentMethod?: string;
  isTest?: boolean;
  emailsSent?: {
    confirmation?: string;
    shipped?: string;
    paymentFailed?: string;
  };
  ecomailContactId?: string;
  discount?: {
    code?: string;
    type?: 'percent' | 'fixed' | 'free-shipping';
    value?: number;
    discountRefId?: string;
  };
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
};

export async function findOrderByRefId(refId: string): Promise<OrderDoc | null> {
  if (!isSanityWritable()) return null;
  return await sanityWriteClient.fetch<OrderDoc | null>(orderByRefIdQuery, { refId });
}

/* ── Generate refId ──────────────────────────────────────────────── */

export function generateRefId(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LEV-${y}${m}${day}-${rand}`;
}

/* ── Create pending order ───────────────────────────────────────── */

export async function createPendingOrder(input: PendingOrderInput): Promise<string | null> {
  if (!isSanityWritable()) {
    console.warn('[orders] Sanity write client not configured — order will not be persisted.');
    return null;
  }
  try {
    const doc = await sanityWriteClient.create({
      _type: 'order',
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...input,
    });
    return doc._id;
  } catch (err) {
    console.error('[orders] createPendingOrder failed:', err);
    return null;
  }
}

/* ── Mark paid (idempotent) ─────────────────────────────────────── */

export async function markOrderPaid(refId: string, update: PaidOrderUpdate): Promise<OrderDoc | null> {
  if (!isSanityWritable()) return null;
  try {
    const order = await findOrderByRefId(refId);
    if (!order) {
      console.warn(`[orders] markOrderPaid: order with refId=${refId} not found`);
      return null;
    }
    /* Idempotency — if already paid, return as-is. */
    if (order.status === 'paid' || order.status === 'packed' || order.status === 'shipped' || order.status === 'delivered') {
      return order;
    }
    const updated = await sanityWriteClient
      .patch(order._id)
      .set({
        status: 'paid',
        ...update,
      })
      .commit();
    return { ...order, ...updated } as OrderDoc;
  } catch (err) {
    console.error('[orders] markOrderPaid failed:', err);
    return null;
  }
}

/* ── Mark failed / cancelled ────────────────────────────────────── */

export async function markOrderFailed(refId: string, reason?: string): Promise<void> {
  if (!isSanityWritable()) return;
  try {
    const order = await findOrderByRefId(refId);
    if (!order) return;
    if (order.status !== 'pending') return; // don't overwrite a paid order
    await sanityWriteClient
      .patch(order._id)
      .set({
        status: 'failed',
        'fulfilment.note': reason ? `Platba selhala: ${reason}` : 'Platba selhala / zrušena.',
      })
      .commit();
  } catch (err) {
    console.error('[orders] markOrderFailed failed:', err);
  }
}

/* ── Stock decrement ─────────────────────────────────────────────── */

/**
 * Decrement stock for each item on the order. Best-effort:
 * one failure per SKU is logged but does not throw.
 *
 * Uses one patch per SKU because GROQ patch needs to match a single document.
 */
export async function decrementStockForOrder(items: OrderItem[]): Promise<void> {
  if (!isSanityWritable()) return;
  await Promise.all(
    items.map(async ({ sku, qty, productId }) => {
      if (!sku || !qty) return;
      try {
        await sanityWriteClient
          .patch(productId)
          .dec({ [`variants[sku=="${sku}"].stock`]: qty })
          .commit({ autoGenerateArrayKeys: true });
      } catch (err) {
        console.error(`[orders] stock decrement failed for sku=${sku}:`, err);
      }
    }),
  );
}

/* ── Email log helpers ──────────────────────────────────────────── */

export async function markEmailSent(
  orderId: string,
  key: 'confirmation' | 'shipped' | 'paymentFailed',
): Promise<void> {
  if (!isSanityWritable()) return;
  try {
    await sanityWriteClient
      .patch(orderId)
      .set({ [`emailsSent.${key}`]: new Date().toISOString() })
      .commit();
  } catch (err) {
    console.error(`[orders] markEmailSent(${key}) failed:`, err);
  }
}

/**
 * Save Comgate transId on the pending order after the payment session is
 * created. Must happen BEFORE the payer is redirected — otherwise the
 * webhook can arrive on an order doc that doesn't know which transId it owns.
 */
export async function attachTransIdToOrder(refId: string, transId: string): Promise<void> {
  if (!isSanityWritable()) return;
  try {
    const order = await findOrderByRefId(refId);
    if (!order) {
      console.warn(`[orders] attachTransIdToOrder: order with refId=${refId} not found`);
      return;
    }
    await sanityWriteClient.patch(order._id).set({ comgateTransId: transId }).commit();
  } catch (err) {
    console.error('[orders] attachTransIdToOrder failed:', err);
  }
}

export async function setEcomailContactId(orderId: string, contactId: string): Promise<void> {
  if (!isSanityWritable()) return;
  try {
    await sanityWriteClient.patch(orderId).set({ ecomailContactId: contactId }).commit();
  } catch (err) {
    console.error('[orders] setEcomailContactId failed:', err);
  }
}
