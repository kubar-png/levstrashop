/**
 * Sanity GROQ webhook → trigger transactional emails on status change.
 *
 * Configure in https://sanity.io/manage:
 *   Project → API → Webhooks → Create webhook
 *     - URL:  https://levstra.cz/api/webhooks/sanity-order
 *     - Dataset: production
 *     - Trigger on: Create + Update
 *     - Filter (GROQ):  _type == "order"
 *     - Projection:     {_id, _type, refId, status, "before": before(), "after": after()}
 *     - HTTP method: POST
 *     - Secret: paste into env as SANITY_ORDER_WEBHOOK_SECRET
 *     - Enable signature: yes (Sanity signs with x-sanity-webhook-signature header)
 *
 * The handler fires the appropriate email exactly once per transition by
 * checking the order's emailsSent flag — so accidental re-fires from
 * Sanity (manual republish, doc revert + redo, etc.) don't re-send mail.
 */

import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { findOrderByRefId, markEmailSent } from '@/lib/orders';
import { sendOrderShipped } from '@/lib/resend';

export const runtime = 'nodejs';

type WebhookBody = {
  _id?: string;
  _type?: string;
  refId?: string;
  status?: string;
  /** Sanity's optional "before/after" projection — we only need after. */
  after?: { status?: string; refId?: string };
};

/** Verifies Sanity's x-sanity-webhook-signature header.
 *
 *  Format: "t=<unix-seconds>, v1=<hex-hmac-sha256>"
 *  HMAC body: "<unix-seconds>.<raw-request-body>" with SANITY_ORDER_WEBHOOK_SECRET.
 */
function verifySanitySignature(req: Request, rawBody: string): boolean {
  const secret = process.env.SANITY_ORDER_WEBHOOK_SECRET;
  if (!secret) {
    /* No secret configured → reject in production, allow in local dev. */
    return process.env.NODE_ENV !== 'production';
  }

  const header = req.headers.get('sanity-webhook-signature') || req.headers.get('x-sanity-webhook-signature');
  if (!header) return false;

  const parts = Object.fromEntries(
    header.split(',').map((kv) => kv.trim().split('=').map((s) => s.trim())),
  );
  const ts = parts.t;
  const sig = parts.v1;
  if (!ts || !sig) return false;

  const expected = createHmac('sha256', secret).update(`${ts}.${rawBody}`).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  if (!verifySanitySignature(req, rawBody)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let body: WebhookBody;
  try {
    body = JSON.parse(rawBody) as WebhookBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (body._type && body._type !== 'order') {
    return NextResponse.json({ ok: true, skipped: 'not an order' });
  }

  const refId = body.refId ?? body.after?.refId;
  const status = body.status ?? body.after?.status;

  if (!refId) {
    return NextResponse.json({ ok: true, skipped: 'no refId' });
  }

  /* Only react to "shipped" for now — confirmation e-mail is sent by the
     Comgate webhook on first PAID transition, not here. */
  if (status !== 'shipped') {
    return NextResponse.json({ ok: true, skipped: `status=${status}` });
  }

  const order = await findOrderByRefId(refId);
  if (!order) {
    return NextResponse.json({ ok: false, error: 'order not found' }, { status: 404 });
  }

  if (order.emailsSent?.shipped) {
    return NextResponse.json({ ok: true, skipped: 'already sent' });
  }

  /* fulfilment fields are filled in Studio by the operator. */
  type FulfilmentShape = { pplShipmentNumber?: string; trackingUrl?: string };
  const fulfilment = (order as unknown as { fulfilment?: FulfilmentShape }).fulfilment;
  const trackingNumber = fulfilment?.pplShipmentNumber;
  const trackingUrl =
    fulfilment?.trackingUrl ||
    (trackingNumber ? `https://www.dhl.com/cz-cs/home/tracking.html?tracking-id=${trackingNumber}` : undefined);

  const result = await sendOrderShipped(order, { trackingNumber, trackingUrl });
  if (result.ok) {
    await markEmailSent(order._id, 'shipped');
    return NextResponse.json({ ok: true, sent: true });
  }
  return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
}
