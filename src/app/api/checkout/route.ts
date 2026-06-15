import { NextResponse } from 'next/server';
import { groq } from 'next-sanity';
import { sanityClient } from '@/sanity/client';
import { createPayment } from '@/lib/comgate';
import { mockProducts } from '@/lib/mock-data';
import type { CartItem } from '@/lib/cart';
import type { SelectedParcelShop } from '@/components/ParcelShopPicker';
import {
  attachTransIdToOrder,
  createPendingOrder,
  generateRefId,
  type OrderBilling,
  type OrderCustomer,
  type OrderDiscount,
  type OrderItem,
  type OrderShipping,
} from '@/lib/orders';
import { isSanityConfigured } from '@/sanity/env';
import { validateDiscount } from '@/lib/discount';

export const runtime = 'nodejs';

const FREE_SHIPPING_THRESHOLD_CENTS = 150000; // 1 500 Kč
const HOME_SHIPPING_CENTS = 19900;
const PARCEL_SHIPPING_CENTS = 12900;

const variantLookupQuery = groq`
  *[_type == "product" && _id == $productId][0] {
    title,
    "slug": slug.current,
    "image": images[0].asset->url,
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
  return { title: p.title, slug: p.slug, image: undefined, variant: v };
}

type CheckoutBody = {
  items: CartItem[];
  email: string;
  shippingMode?: 'home' | 'parcelshop';
  parcelShop?: SelectedParcelShop | null;
  discountCode?: string;
  customer?: OrderCustomer;
  shippingAddress?: {
    street?: string;
    city?: string;
    zip?: string;
    country?: string;
  };
  billing?: OrderBilling;
};

export async function POST(req: Request) {
  try {
    const {
      items,
      email,
      shippingMode = 'home',
      parcelShop,
      discountCode,
      customer,
      shippingAddress,
      billing,
    }: CheckoutBody = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Košík je prázdný' }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Zadejte platný e-mail' }, { status: 400 });
    }
    if (shippingMode === 'parcelshop' && !parcelShop) {
      return NextResponse.json({ error: 'Vyberte výdejnu PPL ParcelShop' }, { status: 400 });
    }

    /* Server-side guards for recipient details — UI validates these too but
       never trust the client. PPL needs a recipient name + phone for both
       home delivery and parcel-shop pickup. */
    if (!customer?.firstName?.trim() || !customer?.lastName?.trim()) {
      return NextResponse.json({ error: 'Zadejte jméno a příjmení.' }, { status: 400 });
    }
    if (!customer?.phone?.trim()) {
      return NextResponse.json({ error: 'Zadejte telefon (PPL ho potřebuje pro SMS).' }, { status: 400 });
    }
    if (shippingMode === 'home') {
      if (!shippingAddress?.street?.trim() || !shippingAddress?.city?.trim() || !shippingAddress?.zip?.trim()) {
        return NextResponse.json({ error: 'Vyplňte celou doručovací adresu.' }, { status: 400 });
      }
    }

    /* ── Re-validate each line against Sanity (or mocks) ─────────── */
    const verifiedItems: OrderItem[] = await Promise.all(
      items.map(async (item) => {
        let data: {
          title: string;
          slug: string;
          image?: string;
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
        if (!data || !data.variant) data = lookupMock(item.productId, item.variantSku) as typeof data;
        if (!data || !data.variant) throw new Error(`Varianta nenalezena: ${item.variantSku}`);
        if (data.variant.stock < item.qty) throw new Error(`Nedostatek zásob: ${data.title}`);

        return {
          productId: item.productId,
          slug: data.slug,
          title: data.title,
          sku: data.variant.sku,
          size: data.variant.size,
          color: data.variant.color,
          image: data.image ?? item.image,
          qty: item.qty,
          priceCents: data.variant.priceCents,
        };
      }),
    );

    const subtotal = verifiedItems.reduce((s, i) => s + i.priceCents * i.qty, 0);
    const thresholdHit = subtotal >= FREE_SHIPPING_THRESHOLD_CENTS;
    const baseShipping = shippingMode === 'parcelshop' ? PARCEL_SHIPPING_CENTS : HOME_SHIPPING_CENTS;

    /* ── Server-side discount re-validation ───────────────────────── */
    let discountCents = 0;
    let orderDiscount: OrderDiscount | undefined;
    let forcesFreeShipping = false;

    if (discountCode && discountCode.trim()) {
      const result = await validateDiscount(discountCode, subtotal, baseShipping, email);
      if (!result.ok) {
        return NextResponse.json({ error: `Slevový kód: ${result.error}` }, { status: 400 });
      }
      forcesFreeShipping = result.forcesFreeShipping;
      discountCents = result.type === 'free-shipping' ? 0 : result.discountCents;
      orderDiscount = {
        code: result.code,
        type: result.type,
        value: result.value,
        discountRef: { _type: 'reference', _ref: result.docId },
      };
    }

    const freeShipping = thresholdHit || forcesFreeShipping;
    const shippingCents = freeShipping ? 0 : baseShipping;
    const totalCents = Math.max(0, subtotal + shippingCents - discountCents);

    const refId = generateRefId();
    const label = verifiedItems
      .map((i) => `${i.title} ×${i.qty}`)
      .join(', ')
      .slice(0, 127);

    /* ── Persist a pending order BEFORE payment redirect ─────────── */
    const recipientName = `${customer.firstName.trim()} ${customer.lastName.trim()}`.trim();

    const shipping: OrderShipping =
      shippingMode === 'parcelshop' && parcelShop
        ? {
            name: recipientName,
            phone: customer.phone,
            city: parcelShop.city,
            zip: parcelShop.zip,
            country: 'CZ',
            parcelShopId: parcelShop.id,
            parcelShopType: parcelShop.type,
            parcelShopName: parcelShop.name,
            parcelShopAddress: [parcelShop.street, parcelShop.city].filter(Boolean).join(', '),
          }
        : {
            name: recipientName,
            phone: customer.phone,
            street: shippingAddress?.street?.trim(),
            city: shippingAddress?.city?.trim(),
            zip: shippingAddress?.zip?.trim(),
            country: shippingAddress?.country ?? 'CZ',
          };

    await createPendingOrder({
      refId,
      paymentProvider: 'comgate',
      email,
      customer: {
        firstName: customer.firstName.trim(),
        lastName: customer.lastName.trim(),
        phone: customer.phone,
      },
      billing: billing && billing.companyName?.trim() ? billing : undefined,
      subtotalCents: subtotal,
      shippingCents,
      discountCents,
      totalCents,
      currency: 'CZK',
      shippingMode,
      shipping,
      items: verifiedItems,
      discount: orderDiscount,
    });

    /* Comgate v2.0 — return/cancel/notify URLs live in the Portal, NOT per-payment.
       Configure once at https://portal.comgate.cz/ → Integrace → Propojení obchodu. */
    const fullName = `${customer.firstName.trim()} ${customer.lastName.trim()}`.trim();
    const { transId, redirect } = await createPayment({
      price: totalCents,                                  // already in haléře (smallest unit)
      refId,
      email: email.trim(),
      fullName,
      phone: customer.phone,
      label,
    });

    /* Persist transId on the order BEFORE the payer hits Comgate — the PUSH
       webhook can otherwise arrive before our order doc knows it owns this transId. */
    await attachTransIdToOrder(refId, transId);

    return NextResponse.json({ url: redirect, transId, refId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chyba při platbě';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
