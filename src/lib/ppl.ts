/**
 * PPL myAPI2 (a.k.a. CPL) REST client.
 *
 *   Base:  https://api.dhl.com/ecs/ppl/myapi2          (production)
 *          https://api-dev.dhl.com/ecs/ppl/myapi2      (sandbox)
 *   Auth:  OAuth2 client-credentials, scope "myapi2", token valid ~30 min.
 *
 * Env (set in .env.local + Vercel):
 *   PPL_CLIENT_ID, PPL_CLIENT_SECRET   — issued per PPL customer account
 *   PPL_API_BASE                       — optional override (sandbox vs prod)
 *   PPL_SENDER_*                       — our pickup/return address on labels
 *
 * Two operations the shop needs:
 *   1. listParcelShops(zip)  — access points (ParcelShop / ParcelBox / AlzaBox)
 *   2. createShipment(req)   — async batch import; returns shipment no. + label
 *
 * Shipment creation is asynchronous: POST /shipment/batch returns 201 with a
 * Location header pointing at /shipment/batch/{batchId}; we poll that until the
 * single item's importState is Complete (or Error) and read back the number.
 */

const PPL_BASE = process.env.PPL_API_BASE || 'https://api.dhl.com/ecs/ppl/myapi2';

/* ── Auth ─────────────────────────────────────────────────────────── */

type Token = { token: string; expiresAt: number };
let cached: Token | null = null;

async function getAccessToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  const clientId = process.env.PPL_CLIENT_ID;
  const clientSecret = process.env.PPL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('PPL_CLIENT_ID / PPL_CLIENT_SECRET not configured');
  }

  const res = await fetch(`${PPL_BASE}/login/getAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'myapi2',
    }),
  });
  if (!res.ok) throw new Error(`PPL auth failed: ${res.status} ${await res.text()}`);

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cached.token;
}

/* ── Access points (parcel shops / boxes) ─────────────────────────── */

export type AccessPointType = 'ParcelShop' | 'ParcelBox' | 'AlzaBox' | 'Depot' | (string & {});

export type ParcelShop = {
  id: string;
  type: AccessPointType;
  name: string;
  street: string;
  city: string;
  zip: string;
  openingHours?: string;
};

type RawWorkHour = { weekDay: number; openFrom?: string; openTo?: string };
type RawAccessPoint = {
  accessPointCode: string;
  accessPointType: string;
  name?: string;
  name2?: string;
  street?: string;
  city?: string;
  zipCode?: string;
  pickupEnabled?: boolean;
  workHours?: RawWorkHour[];
};

const DAY_ABBR = ['', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']; // ISO weekDay 1..7

/** "06:00:00" → "6:00"; "23:59:59"/"24:00:00" → "24:00". */
function hhmm(t?: string): string {
  if (!t) return '';
  const [h, m] = t.split(':');
  if (h === '23' && m === '59') return '24:00';
  return `${Number(h)}:${m}`;
}

/** Collapse PPL's per-daypart rows into a compact "Po–Pá 7:00–18:00" summary. */
function formatWorkHours(wh?: RawWorkHour[]): string | undefined {
  if (!wh || wh.length === 0) return undefined;
  // Merge dayparts: per weekday keep earliest open + latest close.
  const byDay = new Map<number, { from: string; to: string }>();
  for (const w of wh) {
    if (!w.openFrom || !w.openTo) continue;
    const cur = byDay.get(w.weekDay);
    byDay.set(w.weekDay, {
      from: cur && cur.from < w.openFrom ? cur.from : w.openFrom,
      to: cur && cur.to > w.openTo ? cur.to : w.openTo,
    });
  }
  if (byDay.size === 0) return undefined;

  // Group consecutive days that share the same range.
  const days = [...byDay.keys()].sort((a, b) => a - b);
  const parts: string[] = [];
  let start = days[0];
  let prev = days[0];
  const rangeOf = (d: number) => `${hhmm(byDay.get(d)!.from)}–${hhmm(byDay.get(d)!.to)}`;
  const flush = (end: number) => {
    const label = start === end ? DAY_ABBR[start] : `${DAY_ABBR[start]}–${DAY_ABBR[end]}`;
    parts.push(`${label} ${rangeOf(start)}`);
  };
  for (let i = 1; i < days.length; i++) {
    const d = days[i];
    if (d === prev + 1 && rangeOf(d) === rangeOf(start)) {
      prev = d;
      continue;
    }
    flush(prev);
    start = d;
    prev = d;
  }
  flush(prev);
  return parts.join(', ');
}

export async function listParcelShops(zip: string): Promise<ParcelShop[]> {
  const token = await getAccessToken();
  const params = new URLSearchParams({ ZipCode: zip, Limit: '30', Offset: '0' });
  const res = await fetch(`${PPL_BASE}/accessPoint?${params}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`PPL accessPoint lookup failed: ${res.status}`);

  const data = (await res.json()) as RawAccessPoint[];
  return (Array.isArray(data) ? data : [])
    .filter((p) => p.pickupEnabled !== false)
    .map((p) => ({
      id: p.accessPointCode,
      type: p.accessPointType,
      name: [p.name, p.name2].filter(Boolean).join(' · ') || p.accessPointCode,
      street: p.street ?? '',
      city: p.city ?? '',
      zip: p.zipCode ?? '',
      openingHours: formatWorkHours(p.workHours),
    }));
}

/* ── Shipments ────────────────────────────────────────────────────── */

type Address = {
  name: string;
  street?: string;
  city?: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
};

export type ShipmentRequest = {
  orderId: string;
  shippingMode: 'home' | 'parcelshop';
  recipient: Address;
  parcelShopCode?: string;
  parcelShopType?: AccessPointType;
};

export type ShipmentResult = {
  shipmentNumber: string;
  labelUrl?: string;
};

/** PPL product code for the chosen delivery method. */
function productFor(req: ShipmentRequest): string {
  if (req.shippingMode === 'home') return 'PRIV'; // PPL Parcel CZ Private (to address, prepaid)
  const t = (req.parcelShopType ?? '').toLowerCase();
  if (t.includes('box')) return 'SBOX'; // Smart To Box (AlzaBox / ParcelBox)
  return 'SMAR'; // Smart — manned ParcelShop pickup
}

function senderAddress(): Address {
  return {
    name: process.env.PPL_SENDER_NAME || 'Levstra s.r.o.',
    street: process.env.PPL_SENDER_STREET || 'Hněvkovského 587/39a',
    city: process.env.PPL_SENDER_CITY || 'Brno',
    zip: process.env.PPL_SENDER_ZIP || '61700',
    country: process.env.PPL_SENDER_COUNTRY || 'CZ',
    phone: process.env.PPL_SENDER_PHONE || undefined,
    email: process.env.PPL_SENDER_EMAIL || 'jirka@levstra.cz',
  };
}

function toApiAddress(a: Address) {
  return {
    name: a.name,
    street: a.street,
    city: a.city,
    zipCode: a.zip.replace(/\s/g, ''),
    country: a.country,
    contact: a.name,
    phone: a.phone,
    email: a.email,
  };
}

type BatchItem = {
  referenceId?: string;
  shipmentNumber?: string;
  labelUrl?: string;
  importState?: 'Accepted' | 'InProcess' | 'Complete' | 'Error';
  errorMessage?: string;
  errorCode?: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function createShipment(req: ShipmentRequest): Promise<ShipmentResult> {
  const token = await getAccessToken();

  const body = {
    labelSettings: {
      format: 'Pdf',
      completeLabelSettings: { isCompleteLabelRequested: false, pageSize: 'Default', position: 1 },
    },
    shipments: [
      {
        referenceId: req.orderId.slice(0, 128),
        productType: productFor(req),
        sender: toApiAddress(senderAddress()),
        recipient: toApiAddress(req.recipient),
        ...(req.parcelShopCode
          ? { specificDelivery: { parcelShopCode: req.parcelShopCode } }
          : {}),
      },
    ],
  };

  const post = await fetch(`${PPL_BASE}/shipment/batch`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (post.status !== 201) {
    throw new Error(`PPL shipment create failed: ${post.status} ${await post.text()}`);
  }

  /* batchId comes back in the Location header: .../shipment/batch/{guid} */
  const location = post.headers.get('location') ?? '';
  const batchId = location.split('/').filter(Boolean).pop();
  if (!batchId) throw new Error('PPL shipment create: missing batchId (no Location header)');

  /* Poll until the single item resolves. Import is usually done in seconds. */
  for (let attempt = 0; attempt < 15; attempt++) {
    await sleep(attempt === 0 ? 800 : 1200);
    const res = await fetch(`${PPL_BASE}/shipment/batch/${batchId}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (!res.ok) continue;
    const data = (await res.json()) as { items?: BatchItem[] };
    const item = data.items?.[0];
    if (!item) continue;

    if (item.importState === 'Complete' && item.shipmentNumber) {
      return { shipmentNumber: item.shipmentNumber, labelUrl: item.labelUrl };
    }
    if (item.importState === 'Error') {
      throw new Error(`PPL import error: ${item.errorCode ?? ''} ${item.errorMessage ?? 'unknown'}`.trim());
    }
  }

  throw new Error(`PPL shipment ${batchId} did not complete in time`);
}

export function trackingUrlFor(shipmentNumber: string): string {
  return `https://www.ppl.cz/sledovani-zasilky?shipmentId=${encodeURIComponent(shipmentNumber)}`;
}
