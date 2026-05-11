import { NextResponse } from 'next/server';
import { groq } from 'next-sanity';
import { sanityClient } from '@/sanity/client';
import { stripe, STRIPE_CURRENCY } from '@/lib/stripe';
import type { CartItem } from '@/lib/cart';

export const runtime = 'nodejs';

const variantLookupQuery = groq`
  *[_type == "product" && _id == $productId][0] {
    title,
    "slug": slug.current,
    "variant": variants[sku == $sku][0] {
      sku, priceCents, stock, size, color
    }
  }
`;

export async function POST(req: Request) {
  try {
    const { items }: { items: CartItem[] } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    /* Re-validate every line item against Sanity — never trust client prices. */
    const verifiedItems = await Promise.all(
      items.map(async (item) => {
        const data = await sanityClient.fetch<{
          title: string;
          slug: string;
          variant: { sku: string; priceCents: number; stock: number; size?: string; color?: string } | null;
        } | null>(variantLookupQuery, { productId: item.productId, sku: item.variantSku });

        if (!data || !data.variant) throw new Error(`Variant not found: ${item.variantSku}`);
        if (data.variant.stock < item.qty) {
          throw new Error(`Insufficient stock for ${data.title} (${item.variantSku})`);
        }
        return {
          title: data.title,
          slug: data.slug,
          sku: data.variant.sku,
          size: data.variant.size,
          color: data.variant.color,
          priceCents: data.variant.priceCents,
          qty: item.qty,
          image: item.image,
        };
      }),
    );

    const origin =
      req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: verifiedItems.map((i) => ({
        price_data: {
          currency: STRIPE_CURRENCY,
          unit_amount: i.priceCents,
          product_data: {
            name: i.title,
            description: [i.size, i.color].filter(Boolean).join(' · ') || undefined,
            images: i.image ? [i.image] : undefined,
            metadata: { sku: i.sku },
          },
        },
        quantity: i.qty,
      })),
      shipping_address_collection: { allowed_countries: ['CZ', 'SK', 'DE', 'AT', 'PL'] },
      phone_number_collection: { enabled: true },
      /* Free shipping placeholder — replace once PPL pricing is wired up. */
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 12900, currency: STRIPE_CURRENCY },
            display_name: 'PPL ParcelShop (CZ)',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 3 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 19900, currency: STRIPE_CURRENCY },
            display_name: 'PPL Home Delivery (CZ)',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 2 },
            },
          },
        },
      ],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        items: JSON.stringify(
          verifiedItems.map((i) => ({ sku: i.sku, qty: i.qty, priceCents: i.priceCents })),
        ),
      },
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
