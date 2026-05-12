/**
 * Comgate payment gateway integration — REST v2.0 (JSON, Basic auth).
 *
 * Docs:
 *   - https://help.comgate.cz/v2/docs/cs/protokol-rest-api-v20
 *   - https://api-doc.comgate.cz/
 *
 * Required env vars:
 *   COMGATE_MERCHANT   — shop identifier from Comgate portal (Integrace → Propojení obchodu)
 *   COMGATE_SECRET     — API password (per-link secret). NEVER hardcode.
 *   COMGATE_TEST       — "1" = sandbox / test mode, "0" = production
 *
 * Webhook URL is configured in the Comgate Portal (Integrace → Propojení obchodu →
 * URL pro PUSH notifikace), NOT passed per-payment as in v1.0.
 */

import { timingSafeEqual } from 'node:crypto';

const COMGATE_BASE = 'https://payments.comgate.cz';

/* ── Types ────────────────────────────────────────────────────────── */

export type ComgateCreateParams = {
  /** Amount in the smallest currency unit (haléře for CZK, cents for EUR). */
  price: number;
  /** Internal order ID — Comgate echoes this as refId in webhooks. */
  refId: string;
  /** Payer email — required unless `phone` is given. */
  email: string;
  /** Full name of the payer, e.g. "Jan Novák". */
  fullName?: string;
  /** Phone in `+420...` format — required if `email` missing. */
  phone?: string;
  /** Short description shown to the payer (1–16 chars per spec — we trim). */
  label: string;
  /** ISO 4217 currency code; defaults to CZK. */
  curr?: 'CZK' | 'EUR' | 'PLN' | 'HUF' | 'USD' | 'GBP';
  /** ISO 3166 country code; defaults to CZ. */
  country?: string;
  /** Payment method code or 'ALL'. Defaults to 'ALL' (payer chooses). */
  method?: string;
  /** UI language for the gateway page; defaults to cs. */
  lang?: string;
};

export type ComgateCreateResult = {
  transId: string;
  redirect: string;
};

export type ComgatePaymentStatus = {
  transId: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'AUTHORIZED';
  price: number;
  curr: string;
  refId: string;
  method?: string;
  paymentErrorReason?: string;
};

/** PUSH notification body shape. v2.0 sends JSON; field names match v1.0 form keys. */
export type ComgateNotification = {
  transId: string;
  merchant: string;
  /** Strings, not booleans — Comgate sends "true"/"false". */
  test: string;
  price: string;
  curr: string;
  label: string;
  refId: string;
  method?: string;
  email?: string;
  fullName?: string;
  secret: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'AUTHORIZED';
};

/* ── Internals ────────────────────────────────────────────────────── */

function getCredentials() {
  const merchant = process.env.COMGATE_MERCHANT;
  const secret = process.env.COMGATE_SECRET;
  if (!merchant || !secret) {
    throw new Error('COMGATE_MERCHANT / COMGATE_SECRET not configured');
  }
  return { merchant, secret };
}

function isTestMode(): boolean {
  /* Defaults to true in dev, false only when COMGATE_TEST=0 explicitly. */
  return process.env.COMGATE_TEST !== '0' && process.env.COMGATE_TEST !== 'false';
}

function basicAuthHeader(): string {
  const { merchant, secret } = getCredentials();
  return `Basic ${Buffer.from(`${merchant}:${secret}`).toString('base64')}`;
}

/**
 * Redacts the `secret` field from any object before logging. Use this on every
 * console.log of a Comgate body. Never log raw bodies.
 */
export function redactSecret<T extends { secret?: string }>(obj: T): T {
  if (!obj || typeof obj !== 'object' || !('secret' in obj)) return obj;
  return { ...obj, secret: '[REDACTED]' };
}

/**
 * Major → smallest unit converter.
 * - 10.00 CZK → 1000 (haléře)
 * - 10.00 EUR → 1000 (cents)
 *
 * Use `Math.round`, NOT `Math.floor`, so 19.99 → 1999, not 1998.
 *
 * NOTE: Levstra's order layer already stores amounts in haléře/cents
 * (priceCents fields), so this helper is mainly for documentation; the
 * checkout API passes pre-converted minor units directly.
 */
export function toMinorUnit(major: number, _currency: 'CZK' | 'EUR' | 'USD' | string = 'CZK'): number {
  void _currency;
  return Math.round(major * 100);
}

/* ── createPayment — POST /v2.0/payment.json ──────────────────────── */

export async function createPayment(params: ComgateCreateParams): Promise<ComgateCreateResult> {
  const body = {
    price: params.price,                                    // smallest currency unit (haléře)
    curr: params.curr ?? 'CZK',
    country: params.country ?? 'CZ',
    method: params.method ?? 'ALL',
    label: params.label.slice(0, 16),                       // v2.0 spec says 1–16 chars
    refId: params.refId,
    email: params.email,
    fullName: params.fullName,
    phone: params.phone,
    lang: params.lang ?? 'cs',
    test: isTestMode(),
  };

  const res = await fetch(`${COMGATE_BASE}/v2.0/payment.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: basicAuthHeader(),
    },
    body: JSON.stringify(body),
  });

  /* Comgate uses HTTP 200 for both success and business errors; the actual
     result is in the body's `code` field. Non-200 = transport / auth issue. */
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Comgate HTTP ${res.status}: ${text}`);
  }

  const data = (await res.json()) as {
    code: number;
    message?: string;
    transId?: string;
    redirect?: string;
  };

  if (data.code !== 0 || !data.transId || !data.redirect) {
    throw new Error(`Comgate ${data.code}: ${data.message ?? 'unknown error'}`);
  }

  return { transId: data.transId, redirect: data.redirect };
}

/* ── getPaymentStatus — GET /v2.0/payment/transId/{transId}.json ──── */

/**
 * Canonical re-fetch of payment state. Always call this in the webhook
 * handler after the signature check passes — never trust the body alone.
 */
export async function getPaymentStatus(transId: string): Promise<ComgatePaymentStatus> {
  const res = await fetch(
    `${COMGATE_BASE}/v2.0/payment/transId/${encodeURIComponent(transId)}.json`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: basicAuthHeader(),
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Comgate status HTTP ${res.status}: ${text}`);
  }

  const data = (await res.json()) as ComgatePaymentStatus & { code?: number; message?: string };
  if (data.code !== undefined && data.code !== 0) {
    throw new Error(`Comgate status ${data.code}: ${data.message ?? 'unknown error'}`);
  }

  return {
    transId: data.transId,
    status: data.status,
    price: Number(data.price),
    curr: data.curr,
    refId: data.refId,
    method: data.method,
    paymentErrorReason: data.paymentErrorReason,
  };
}

/* ── verifyWebhookSecret — constant-time secret echo check ────────── */

/**
 * Constant-time comparison of the secret echoed in the PUSH body vs. our
 * configured COMGATE_SECRET. Length mismatch is rejected without ever
 * comparing — timingSafeEqual requires equal-length buffers.
 */
export function verifyWebhookSecret(received: string | undefined): boolean {
  const expected = process.env.COMGATE_SECRET;
  if (!expected || !received) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
