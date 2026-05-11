/**
 * PPL myAPI integration stub.
 *
 * PPL (Professional Parcel Logistic, CZ) exposes a REST API under
 *   https://api.dhl.com/parcel/cz/myapi/v4    (post DHL acquisition)
 * historically also: https://myapi.ppl.cz/v3
 *
 * You need:
 *   - PPL_CLIENT_ID
 *   - PPL_CLIENT_SECRET
 *   - PPL_CUSTOMER_REF (your zákaznické číslo)
 *
 * This file isolates auth + the two endpoints we actually need:
 *   1. listParcelShops(zip)   — pickup points around a postcode
 *   2. createShipment(order)  — create a label and return tracking number
 *
 * Replace the placeholder URLs/payloads with whatever PPL gives you
 * in their partner docs once you have credentials.
 */

const PPL_BASE = process.env.PPL_API_BASE || 'https://api.dhl.com/parcel/cz/myapi/v4';

type Token = { token: string; expiresAt: number };
let cached: Token | null = null;

async function getAccessToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now() + 30_000) return cached.token;

  const clientId = process.env.PPL_CLIENT_ID;
  const clientSecret = process.env.PPL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('PPL_CLIENT_ID / PPL_CLIENT_SECRET not configured');
  }

  const res = await fetch(`${PPL_BASE}/login/getAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, clientSecret }),
  });
  if (!res.ok) throw new Error(`PPL auth failed: ${res.status}`);
  const data: { accessToken: string; expiresIn: number } = await res.json();
  cached = { token: data.accessToken, expiresAt: Date.now() + data.expiresIn * 1000 };
  return cached.token;
}

export type ParcelShop = {
  id: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  openingHours?: string;
};

export async function listParcelShops(zip: string): Promise<ParcelShop[]> {
  const token = await getAccessToken();
  const res = await fetch(`${PPL_BASE}/parcelshop?zipCode=${encodeURIComponent(zip)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`PPL parcelshop lookup failed: ${res.status}`);
  const data: { items: Array<Record<string, unknown>> } = await res.json();
  return data.items.map((s) => ({
    id: String(s.code ?? s.id),
    name: String(s.name),
    street: String(s.street),
    city: String(s.city),
    zip: String(s.zipCode),
    openingHours: s.openingHours ? String(s.openingHours) : undefined,
  }));
}

export type ShipmentRequest = {
  orderId: string;
  recipient: {
    name: string;
    phone: string;
    email: string;
    street: string;
    city: string;
    zip: string;
    country: string;
  };
  parcelShopId?: string;
  weightGrams: number;
  cashOnDelivery?: { amountCents: number; currency: 'CZK' | 'EUR' };
};

export type ShipmentResult = {
  shipmentNumber: string;
  labelUrl: string;
};

export async function createShipment(req: ShipmentRequest): Promise<ShipmentResult> {
  const token = await getAccessToken();
  const customerRef = process.env.PPL_CUSTOMER_REF;
  if (!customerRef) throw new Error('PPL_CUSTOMER_REF not configured');

  const body = {
    shipments: [
      {
        referenceId: req.orderId,
        productType: req.parcelShopId ? 'PPL_PARCEL_CZ_BUSINESS_PS' : 'PPL_PARCEL_CZ_PRIVATE',
        senderEqualToPayer: true,
        recipient: {
          name: req.recipient.name,
          phone: req.recipient.phone,
          email: req.recipient.email,
          address: {
            street: req.recipient.street,
            city: req.recipient.city,
            zipCode: req.recipient.zip,
            country: req.recipient.country,
          },
        },
        externalNumber: req.orderId,
        weight: req.weightGrams / 1000,
        cashOnDelivery: req.cashOnDelivery
          ? {
              amount: req.cashOnDelivery.amountCents / 100,
              currency: req.cashOnDelivery.currency,
            }
          : undefined,
        parcelShopCode: req.parcelShopId,
        senderRef: customerRef,
      },
    ],
  };

  const res = await fetch(`${PPL_BASE}/shipment`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PPL shipment create failed: ${res.status} ${await res.text()}`);
  const data: { shipments: Array<{ shipmentNumber: string; labelUrl: string }> } = await res.json();
  const first = data.shipments[0];
  return { shipmentNumber: first.shipmentNumber, labelUrl: first.labelUrl };
}
