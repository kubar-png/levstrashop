/**
 * ComGate payment gateway integration.
 * Docs: https://apidoc.comgate.cz/
 *
 * Required env vars:
 *   COMGATE_MERCHANT_ID   — merchant ID from ComGate portal
 *   COMGATE_SECRET        — secret key from ComGate portal
 *   COMGATE_TEST          — set to "true" for test payments (optional)
 */

const COMGATE_BASE = 'https://payments.comgate.cz/v1.0';

export type ComGateCreateParams = {
  price: number;       // total in haléře (e.g. 29900 = 299 Kč)
  refId: string;       // your internal order reference
  email: string;       // customer e-mail
  label: string;       // short order description shown to customer (max 127 chars)
  returnUrl: string;   // redirect after successful payment — use {transId} placeholder
  cancelUrl: string;   // redirect after cancelled/failed payment
  notifyUrl: string;   // server-to-server notification URL
  curr?: string;       // currency, default 'CZK'
  country?: string;    // country, default 'CZ'
  method?: string;     // payment method, default 'ALL'
};

export type ComGateCreateResult = {
  transId: string;
  redirect: string;
};

export type ComGateNotification = {
  transId: string;
  refId: string;
  state: 'PAID' | 'CANCELLED' | 'PENDING';
  price: string;
  curr: string;
  email?: string;
  method?: string;
  test?: string;
};

function getCredentials() {
  const merchantId = process.env.COMGATE_MERCHANT_ID;
  const secret = process.env.COMGATE_SECRET;
  if (!merchantId || !secret) {
    throw new Error('COMGATE_MERCHANT_ID / COMGATE_SECRET not configured');
  }
  return { merchantId, secret };
}

export async function createPayment(params: ComGateCreateParams): Promise<ComGateCreateResult> {
  const { merchantId, secret } = getCredentials();

  const body = new URLSearchParams({
    merchant: merchantId,
    secret,
    price: String(params.price),
    curr: params.curr ?? 'CZK',
    country: params.country ?? 'CZ',
    method: params.method ?? 'ALL',
    label: params.label.slice(0, 127),
    refId: params.refId,
    email: params.email,
    prepareOnly: 'true',
    returnUrl: params.returnUrl,
    cancelUrl: params.cancelUrl,
    notifyUrl: params.notifyUrl,
    ...(process.env.COMGATE_TEST === 'true' ? { test: 'true' } : {}),
  });

  const res = await fetch(`${COMGATE_BASE}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const parsed = Object.fromEntries(new URLSearchParams(await res.text()));

  if (parsed.code !== '0') {
    throw new Error(`ComGate chyba ${parsed.code}: ${parsed.message}`);
  }

  return { transId: parsed.transId, redirect: parsed.redirect };
}

export function verifyNotification(data: Record<string, string>): boolean {
  const { secret } = getCredentials();
  return data.secret === secret;
}
