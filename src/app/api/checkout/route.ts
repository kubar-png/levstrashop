import { NextResponse } from 'next/server';
import { groq } from 'next-sanity';
import { sanityClient } from '@/sanity/client';
import { stripe, STRIPE_CURRENCY } from '@/lib/stripe';
import type { CartItem } from '@/lib/cart';
import type { SelectedParcelShop } from '@/components/ParcelShopPicker';

export const runtime = 'nodejs';

const FREE_SHIPPING_THRESHOLD_CENTS = 150000; // 1 500 Kč

const variantLookupQuery = groq`
  *[_type == "product" && _id == $productId][0] {
    title,
    "slug": slug.current,
    "variant": variants[sku == $sku][0] {
      sku, priceCents, stock, size, color
    }
  }
`;

type CheckoutBody = {
  items: CartItem[];
  shippingMode?: 'home' | 'parcelshop';
  parcelShop?: SelectedParcelShop | null;
};

export async function POST(req: Request) {
  try {
    const { items, shippingMode = 'home', parcelShop }: CheckoutBody = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Košík je prázdný' }, { status: 400 });
    }

    const verifiedItems = await Promise.all(
      items.map(async (item) => {
        const data = await sanityClient.fetch<{
          title: string;
          slug: string;
          variant: { sku: string; priceCents: number; stock: number; size?: string; color?: string } | null;
        } | null>(variantLookupQuery, { productId: item.productId, sku: item.variantSku });

        if (!data || !data.variant) throw new Error(`Variant nenalezena: ${item.variantSku}`);
        if (data.variant.stock < item.qty) {
          throw new Error(`Skladem už není dostatek kusů: ${data.title} (${item.variantSku})`);
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

    const subtotal = verifiedItems.reduce((s, i) => s + i.priceCents * i.qty, 0);
    const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD_CENTS;

    const shippingPriceCents = freeShipping
      ? 0
      : shippingMode === 'parcelshop'
        ? 12900
        : 19900;

    const shippingLabel =
      shippingMode === 'parcelshop'
        ? parcelShop
          ? `PPL ParcelShop · ${parcelShop.name}, ${parcelShop.city}`
          : 'PPL ParcelShop'
        : 'PPL na adresu';

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
      shipping_address_collection:
        shippingMode === 'home'
          ? { allowed_countries: ['CZ', 'SK'] }
          : undefined,
      phone_number_collection: { enabled: true },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: shippingPriceCents, currency: STRIPE_CURRENCY },
            display_name: shippingLabel,
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: {
                unit: 'business_day',
                value: shippingMode === 'parcelshop' ? 3 : 2,
              },
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
        shippingMode,
        parcelShopId: parcelShop?.id ?? '',
        parcelShopName: parcelShop?.name ?? '',
      },
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chyba při platbě';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
