import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { sanityWriteClient } from '@/sanity/client';

export const runtime = 'nodejs';

/** Stripe renamed `shipping_details` over time. Read it loosely. */
function extractShipping(session: Stripe.Checkout.Session) {
  const s = session as unknown as {
    shipping_details?: { name?: string; phone?: string; address?: Record<string, string> };
    collected_information?: { shipping_details?: { name?: string; address?: Record<string, string> } };
  };
  const ship = s.shipping_details ?? s.collected_information?.shipping_details;
  return {
    name: ship?.name ?? session.customer_details?.name ?? undefined,
    phone: session.customer_details?.phone ?? undefined,
    street: ship?.address?.line1 ?? undefined,
    city: ship?.address?.city ?? undefined,
    zip: ship?.address?.postal_code ?? undefined,
    country: ship?.address?.country ?? undefined,
  };
}

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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
      expand: ['data.price.product'],
    });

    const items = lineItems.data.map((li) => {
      const product = li.price?.product as Stripe.Product | undefined;
      return {
        sku: product?.metadata?.sku ?? '',
        title: product?.name ?? '',
        qty: li.quantity ?? 0,
        priceCents: li.amount_total ?? 0,
      };
    });

    /* Decrement stock per SKU in Sanity. */
    await Promise.all(
      items.map(async ({ sku, qty }) => {
        if (!sku || !qty) return;
        try {
          await sanityWriteClient
            .patch({ query: `*[_type=="product" && variants[sku=="${sku}"]]` })
            .dec({ [`variants[sku=="${sku}"].stock`]: qty })
            .commit({ autoGenerateArrayKeys: true });
        } catch (err) {
          console.error('Stock decrement failed for', sku, err);
        }
      }),
    );

    /* Persist order document. */
    try {
      await sanityWriteClient.create({
        _type: 'order',
        stripeSessionId: session.id,
        stripePaymentIntent:
          typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
        status: 'paid',
        email: session.customer_details?.email ?? undefined,
        totalCents: session.amount_total ?? 0,
        currency: session.currency ?? 'czk',
        items,
        shipping: {
          ...extractShipping(session),
          pplParcelShopId: session.metadata?.parcelShopId || undefined,
        },
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Order creation failed', err);
    }
  }

  return NextResponse.json({ received: true });
}
