import { verifyNotification } from '@/lib/comgate';
import {
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

/**
 * Comgate notifyUrl handler.
 * Comgate POSTs application/x-www-form-urlencoded. We MUST return plain "OK"
 * (200) within 5s or Comgate retries — so all email/Ecomail work happens
 * after that decision point, but we still await it for now (works on Fluid Compute).
 */
export async function POST(req: Request) {
  const text = await req.text();
  const data = Object.fromEntries(new URLSearchParams(text));

  if (!verifyNotification(data)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { transId, refId, state, price, curr, email, method, test } = data;

  if (!refId) {
    console.warn('[comgate webhook] missing refId, ignoring');
    return new Response('OK', { status: 200 });
  }

  try {
    if (state === 'PAID') {
      const order = await markOrderPaid(refId, {
        comgateTransId: transId,
        paymentMethod: method,
        isTest: test === '1' || test === 'true',
        paidAt: new Date().toISOString(),
      });

      if (order && order.status === 'paid') {
        /* These were already done on a previous webhook delivery — skip. */
        return new Response('OK', { status: 200 });
      }

      const fresh = order ?? (await findOrderByRefId(refId));
      if (fresh) {
        await decrementStockForOrder(fresh.items);

        if (fresh.discount?.discountRefId) {
          await incrementRedemption(fresh.discount.discountRefId);
        }

        if (!fresh.emailsSent?.confirmation) {
          const result = await sendOrderConfirmation(fresh);
          if (result.ok) await markEmailSent(fresh._id, 'confirmation');
        }

        /* Mirror order to Ecomail (best-effort, non-blocking on errors). */
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
            items: fresh.items.map((it) => ({ title: it.title, qty: it.qty, priceCents: it.priceCents })),
          });
        }
      } else {
        /* Order doc missing — log everything we know so we can reconcile later. */
        console.error('[comgate webhook] PAID for unknown refId', {
          refId,
          transId,
          price,
          curr,
          email,
        });
      }
    } else if (state === 'CANCELLED') {
      await markOrderFailed(refId, 'Comgate stav: CANCELLED');
    }
    /* state === 'PENDING' → no-op, wait for follow-up notification */
  } catch (err) {
    /* Log but still return 200 so Comgate doesn't hammer-retry indefinitely. */
    console.error('[comgate webhook] handler error:', err);
  }

  return new Response('OK', { status: 200 });
}
