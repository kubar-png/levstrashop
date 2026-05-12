import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
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

export const runtime = 'nodejs';

/**
 * Stripe webhook — secondary payment provider.
 *
 * Comgate is the primary CZ flow; Stripe is wired here so the same
 * order pipeline (Sanity → Resend → Ecomail) works if/when a Stripe
 * Checkout session is used. The session's metadata.refId must be set
 * by whatever code creates the session.
 */
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const refId = session.metadata?.refId;

      if (!refId) {
        console.warn('[stripe webhook] session.metadata.refId missing — cannot link to order');
        return NextResponse.json({ received: true });
      }

      const order = await markOrderPaid(refId, {
        stripeSessionId: session.id,
        stripePaymentIntent: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
        paymentMethod: session.payment_method_types?.[0] ?? 'card',
        isTest: session.livemode === false,
        paidAt: new Date().toISOString(),
      });

      if (order && order.status === 'paid') return NextResponse.json({ received: true });

      const fresh = order ?? (await findOrderByRefId(refId));
      if (fresh) {
        await decrementStockForOrder(fresh.items);

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
            items: fresh.items.map((it) => ({ title: it.title, qty: it.qty, priceCents: it.priceCents })),
          });
        }
      }
    } else if (
      event.type === 'checkout.session.expired' ||
      event.type === 'checkout.session.async_payment_failed'
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const refId = session.metadata?.refId;
      if (refId) await markOrderFailed(refId, `Stripe event: ${event.type}`);
    }
  } catch (err) {
    console.error('[stripe webhook] handler error:', err);
  }

  return NextResponse.json({ received: true });
}
