/**
 * Comgate v2.0 PUSH notification handler.
 *
 * Wire:
 *   - Comgate POSTs JSON to the URL configured in the Portal (Integrace →
 *     Propojení obchodu → URL pro PUSH notifikace).
 *   - We constant-time compare body.secret to env COMGATE_SECRET.
 *   - We then call GET /v2.0/payment/transId/{transId}.json — that's the
 *     authoritative state, not the body status (defense in depth against
 *     replayed / forged notifications).
 *   - Idempotency: markOrderPaid is a no-op if order is already in a
 *     post-paid state.
 *   - Return 200 only after the work succeeds (or already done); Comgate
 *     retries up to 1000× on non-2xx.
 *
 * IP allowlist (optional, second layer): https://payments.comgate.cz/ips-v4
 */

import { getPaymentStatus, redactSecret, verifyWebhookSecret, type ComgateNotification } from '@/lib/comgate';
import {
  createShipmentForOrder,
  decrementStockForOrder,
  findOrderByRefId,
  markEmailSent,
  markOrderFailed,
  markOrderPaid,
  setEcomailContactId,
} from '@/lib/orders';
import { sendOrderConfirmation } from '@/lib/resend';
import { notifyEcomailOfOrder, trackPurchase } from '@/lib/ecomail';
import { incrementRedemption } from '@/lib/discount';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  /* 1. Read raw body — Comgate v2.0 sends application/json.
        We use req.text() so we never miss a body for parser-quirky middlewares. */
  const raw = await req.text();
  let body: ComgateNotification;
  try {
    body = JSON.parse(raw) as ComgateNotification;
  } catch {
    /* Comgate v1.0 used form-encoded — defensive fallback for legacy notifications
       that might still be in transit during the migration. */
    body = Object.fromEntries(new URLSearchParams(raw)) as unknown as ComgateNotification;
  }

  /* 2. Constant-time secret echo check. */
  if (!verifyWebhookSecret(body.secret)) {
    console.warn('[comgate webhook] secret mismatch', { refId: body.refId });
    return new Response('Unauthorized', { status: 401 });
  }

  const { transId, refId } = body;
  if (!refId || !transId) {
    console.warn('[comgate webhook] missing refId/transId', redactSecret(body));
    /* 200 so Comgate doesn't retry forever on malformed input we can't fix. */
    return new Response('OK', { status: 200 });
  }

  try {
    /* 3. Canonical re-fetch — Comgate official guidance: never trust body alone. */
    let canonical;
    try {
      canonical = await getPaymentStatus(transId);
    } catch (err) {
      console.error('[comgate webhook] status fetch failed:', err);
      /* Non-2xx will trigger Comgate retry. */
      return new Response('Status fetch failed', { status: 502 });
    }

    if (canonical.status !== body.status) {
      console.warn('[comgate webhook] body/canonical mismatch — trusting canonical', {
        refId,
        bodyStatus: body.status,
        canonicalStatus: canonical.status,
      });
    }

    if (canonical.status === 'PAID' || canonical.status === 'AUTHORIZED') {
      const order = await markOrderPaid(refId, {
        comgateTransId: transId,
        paymentMethod: canonical.method ?? body.method,
        isTest: body.test === 'true' || body.test === '1',
        paidAt: new Date().toISOString(),
      });

      /* Already-processed branch — markOrderPaid returns the existing doc
         unchanged when status is already in a post-paid state. */
      if (order && order.emailsSent?.confirmation) {
        /* Already fully processed — but self-heal if a previous PPL attempt
           failed and Comgate is re-notifying. Best-effort, never blocks. */
        if (!order.fulfilment?.pplShipmentNumber) {
          try {
            await createShipmentForOrder(order);
          } catch (err) {
            console.error('[comgate webhook] PPL shipment retry failed:', err);
          }
        }
        return new Response('OK', { status: 200 });
      }

      const fresh = order ?? (await findOrderByRefId(refId));
      if (!fresh) {
        console.error('[comgate webhook] PAID for unknown refId', { refId, transId });
        /* 200 — Comgate retries don't help if our DB doesn't have the order. */
        return new Response('OK', { status: 200 });
      }

      await decrementStockForOrder(fresh.items);

      if (fresh.discount?.discountRefId) {
        await incrementRedemption(fresh.discount.discountRefId);
      }

      if (!fresh.emailsSent?.confirmation) {
        const result = await sendOrderConfirmation(fresh);
        if (result.ok) await markEmailSent(fresh._id, 'confirmation');
      }

      if (fresh.email) {
        const eco = await notifyEcomailOfOrder({
          email: fresh.email,
          orderRefId: fresh.refId,
          orderTotalCents: fresh.totalCents,
        });
        if (eco.ok && eco.id) await setEcomailContactId(fresh._id, String(eco.id));

        await trackPurchase({
          email: fresh.email,
          orderId: fresh.refId,
          totalCents: fresh.totalCents,
          items: fresh.items.map((it) => ({
            title: it.title,
            qty: it.qty,
            priceCents: it.priceCents,
          })),
        });
      }

      /* Auto-create the PPL shipment so the order lands in PPL right after
         payment. Best-effort: a PPL failure must never block the webhook —
         the order is left for the /api/ppl/ship retry route. */
      try {
        await createShipmentForOrder(fresh);
      } catch (err) {
        console.error('[comgate webhook] PPL shipment create failed:', err);
      }
    } else if (canonical.status === 'CANCELLED') {
      await markOrderFailed(refId, canonical.paymentErrorReason ?? 'Comgate: CANCELLED');
    }
    /* PENDING → no-op, wait for the next PUSH delivery. */
  } catch (err) {
    /* Unexpected error — log but still return 200 so Comgate doesn't
       hammer-retry. Anything that should be retried (network errors talking
       to Comgate itself) is handled above with a non-2xx. */
    console.error('[comgate webhook] handler error:', err);
  }

  return new Response('OK', { status: 200 });
}
