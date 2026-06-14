/**
 * Manual / retry shipment creation for a single order.
 *
 *   GET /api/ppl/ship?refId=LEV-...&token=<PPL_ADMIN_TOKEN>
 *
 * Idempotent — createShipmentForOrder is a no-op if the order already has a
 * PPL shipment number. Used to recover orders where the automatic create at
 * payment time failed (PPL outage, transient error). Guarded by a shared
 * token so it can't be triggered by the public.
 */

import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { createShipmentForOrder, findOrderByRefId } from '@/lib/orders';

export const runtime = 'nodejs';

function authorized(token: string | null): boolean {
  const secret = process.env.PPL_ADMIN_TOKEN;
  if (!secret) return process.env.NODE_ENV !== 'production';
  if (!token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (!authorized(url.searchParams.get('token'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const refId = url.searchParams.get('refId');
  if (!refId) return NextResponse.json({ error: 'refId required' }, { status: 400 });

  const order = await findOrderByRefId(refId);
  if (!order) return NextResponse.json({ error: 'order not found' }, { status: 404 });
  if (order.status === 'pending' || order.status === 'failed') {
    return NextResponse.json({ error: `order is ${order.status} — not paid` }, { status: 409 });
  }

  try {
    const result = await createShipmentForOrder(order);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'PPL error';
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
