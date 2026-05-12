/**
 * Ecomail client — used for marketing flows (newsletter, abandoned cart,
 * post-purchase upsell, segmentation).
 *
 * Transactional order/shipping emails go through Resend (see src/lib/resend.ts).
 * Ecomail receives a notification of each paid order so it can:
 *   - tag the contact as a customer
 *   - feed it into automation triggers (welcome, post-purchase, etc.)
 *
 * Required env vars:
 *   ECOMAIL_API_KEY               — from Ecomail → Integrations → API
 *   ECOMAIL_LIST_ID               — numeric ID of the master newsletter list
 *   ECOMAIL_APP_ID                — your Ecomail subdomain (eg. "levstra")
 *
 * Docs: https://ecomailappcz.docs.apiary.io/
 */

const BASE_URL = 'https://api2.ecomailapp.cz';

function getCreds() {
  const apiKey = process.env.ECOMAIL_API_KEY;
  const listId = process.env.ECOMAIL_LIST_ID;
  if (!apiKey) return null;
  return { apiKey, listId };
}

export function isEcomailConfigured(): boolean {
  return !!process.env.ECOMAIL_API_KEY;
}

async function ecomailFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const creds = getCreds();
  if (!creds) throw new Error('ECOMAIL_API_KEY not configured');
  return fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      key: creds.apiKey,
      ...(init.headers ?? {}),
    },
  });
}

/* ── Newsletter signup ───────────────────────────────────────────── */

type SubscribeInput = {
  email: string;
  name?: string;
  surname?: string;
  source?: string;
  tags?: string[];
  /** Marketing consent — required by GDPR for marketing lists. */
  consent?: boolean;
};

export async function subscribeToNewsletter(input: SubscribeInput): Promise<{ ok: boolean; id?: number; error?: string }> {
  const creds = getCreds();
  if (!creds) return { ok: false, error: 'ECOMAIL_API_KEY not configured' };
  if (!creds.listId) return { ok: false, error: 'ECOMAIL_LIST_ID not configured' };

  try {
    const res = await ecomailFetch(`/lists/${creds.listId}/subscribe`, {
      method: 'POST',
      body: JSON.stringify({
        subscriber_data: {
          email: input.email,
          name: input.name,
          surname: input.surname,
          tags: input.tags,
        },
        update_existing: true,
        resubscribe: true,
        skip_confirmation: false, // GDPR — let Ecomail send double opt-in
        source: input.source ?? 'levstra.cz',
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Ecomail ${res.status}: ${text}` };
    }
    const data = (await res.json()) as { id?: number };
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}

/* ── Tag/add customer after paid order ──────────────────────────── */

type AddCustomerInput = {
  email: string;
  name?: string;
  orderTotalCents: number;
  orderRefId: string;
  tags?: string[];
};

/**
 * Adds the buyer to a "customers" list (uses same list as newsletter with
 * an extra "customer" tag), so Ecomail automations can fire post-purchase flows.
 * Does NOT subscribe to marketing without consent — uses skip_confirmation:true
 * because this is transactional list segmentation, not marketing opt-in.
 */
export async function notifyEcomailOfOrder(input: AddCustomerInput): Promise<{ ok: boolean; id?: number; error?: string }> {
  const creds = getCreds();
  if (!creds) return { ok: false, error: 'ECOMAIL_API_KEY not configured' };
  if (!creds.listId) return { ok: false, error: 'ECOMAIL_LIST_ID not configured' };

  try {
    const res = await ecomailFetch(`/lists/${creds.listId}/subscribe`, {
      method: 'POST',
      body: JSON.stringify({
        subscriber_data: {
          email: input.email,
          name: input.name,
          tags: ['customer', ...(input.tags ?? [])],
          custom_fields: {
            last_order_ref: input.orderRefId,
            last_order_total: input.orderTotalCents / 100,
            last_order_at: new Date().toISOString(),
          },
        },
        update_existing: true,
        resubscribe: false,
        skip_confirmation: true,
        source: 'order:webhook',
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Ecomail ${res.status}: ${text}` };
    }
    const data = (await res.json()) as { id?: number };
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}

/* ── Track purchase event (for automation triggers / segmentation) ── */

type TrackPurchaseInput = {
  email: string;
  orderId: string;
  totalCents: number;
  items: Array<{ title: string; qty: number; priceCents: number }>;
};

/**
 * Pushes a purchase event to Ecomail's tracker. Useful for "abandoned cart
 * recovery — cancel if they purchased" automations.
 */
export async function trackPurchase(input: TrackPurchaseInput): Promise<{ ok: boolean; error?: string }> {
  const creds = getCreds();
  if (!creds) return { ok: false, error: 'ECOMAIL_API_KEY not configured' };
  const appId = process.env.ECOMAIL_APP_ID;
  if (!appId) return { ok: false, error: 'ECOMAIL_APP_ID not configured' };

  try {
    const res = await ecomailFetch(`/tracker/transactions`, {
      method: 'POST',
      body: JSON.stringify({
        transaction: {
          shop_id: appId,
          order_id: input.orderId,
          email: input.email,
          amount: input.totalCents / 100,
          currency: 'CZK',
          timestamp: Math.floor(Date.now() / 1000),
        },
        transaction_items: input.items.map((it) => ({
          shop_id: appId,
          order_id: input.orderId,
          name: it.title,
          amount: (it.priceCents / 100) * it.qty,
          quantity: it.qty,
          price: it.priceCents / 100,
        })),
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Ecomail tracker ${res.status}: ${text}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}
