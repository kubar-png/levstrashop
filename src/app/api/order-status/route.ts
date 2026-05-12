import { NextResponse } from 'next/server';
import { findOrderByRefId } from '@/lib/orders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const refId = url.searchParams.get('refId');
  if (!refId) return NextResponse.json({ status: null }, { status: 400 });

  const order = await findOrderByRefId(refId);
  return NextResponse.json({ status: order?.status ?? null });
}
