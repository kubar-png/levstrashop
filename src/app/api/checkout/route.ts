import { NextResponse } from 'next/server';
import { groq } from 'next-sanity';
import { sanityClient } from '@/sanity/client';
import { createPayment } from '@/lib/comgate';
import { mockProducts } from '@/lib/mock-data';
import type { CartItem } from '@/lib/cart';
import type { SelectedParcelShop } from '@/components/ParcelShopPicker';

export const runtime = 'nodejs';

const FREE_SHIPPING_THRESHOLD_CENTS = 150000; // 1 500 Kč

function isSanityConfigured() {
  const id = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  return !!id && id !== 'placeholder';
}

const variantLookupQuery = groq`
  *[_type == "product" && _id == $productId][0] {
    title,
    "slug": slug.current,
    "variant": variants[sku == $sku][0] {
      sku, "priceCents": price * 100, stock, size, color
    }
  }
`;

function lookupMock(productId: string, sku: string) {
  const p = mockProducts.find((x) => x._id === productId);
  if (!p) return null;
  const v = p.variants.find((x) => x.sku === sku);
  if (!v) return null;
  return { title: p.title, slug: p.slug, variant: v };
}

type CheckoutBody = {
  items: CartItem[];
  email: string;
  shippingMode?: 'home' | 'parcelshop';
  parcelShop?: SelectedParcelShop | null;
};

export async function POST(req: Request) {
  try {
    const { items, email, shippingMode = 'home', parcelShop }: CheckoutBody = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Košík je prázdný' }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Zadejte platný e-mail' }, { status: 400 });
    }
    if (shippingMode === 'parcelshop' && !parcelShop) {
      return NextResponse.json({ error: 'Vyberte výdejnu PPL ParcelShop' }, { status: 400 });
    }

    const verifiedItems = await Promise.all(
      items.map(async (item) => {
        let data: {
          title: string;
          slug: string;
          variant: { sku: string; priceCents: number; stock: number; size?: string; color?: string } | null;
        } | null = null;

        if (isSanityConfigured()) {
          try {
            data = await sanityClient.fetch(variantLookupQuery, {
              productId: item.productId,
              sku: item.variantSku,
            });
          } catch {}
        }
        if (!data || !data.variant) data = lookupMock(item.productId, item.variantSku);
        if (!data || !data.variant) throw new Error(`Varianta nenalezena: ${item.variantSku}`);
        if (data.variant.stock < item.qty) throw new Error(`Nedostatek zásob: ${data.title}`);

        return {
          title: data.title,
          sku: data.variant.sku,
          priceCents: data.variant.priceCents,
          qty: item.qty,
        };
      }),
    );

    const subtotal = verifiedItems.reduce((s, i) => s + i.priceCents * i.qty, 0);
    const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD_CENTS;
    const shippingCents = freeShipping ? 0 : shippingMode === 'parcelshop' ? 12900 : 19900;
    const totalCents = subtotal + shippingCents;

    const refId = `lev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const label = verifiedItems
      .map((i) => `${i.title} ×${i.qty}`)
      .join(', ')
      .slice(0, 127);

    const origin =
      req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const { transId, redirect } = await createPayment({
      price: totalCents,
      refId,
      email,
      label,
      returnUrl: `${origin}/checkout/success?transId={transId}&refId=${encodeURIComponent(refId)}`,
      cancelUrl: `${origin}/cart`,
      notifyUrl: `${origin}/api/webhooks/comgate`,
    });

    return NextResponse.json({ url: redirect, transId, refId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chyba při platbě';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
