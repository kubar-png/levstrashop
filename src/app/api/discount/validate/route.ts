import { NextResponse } from 'next/server';
import { validateDiscount } from '@/lib/discount';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = {
  code?: string;
  subtotalCents?: number;
  shippingCents?: number;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'Neplatný požadavek' }, { status: 400 });
  }

  const code = (body.code ?? '').trim();
  const subtotal = Math.max(0, Number(body.subtotalCents) || 0);
  const shipping = Math.max(0, Number(body.shippingCents) || 0);

  if (!code) {
    return NextResponse.json({ ok: false, error: 'Zadejte kód.' }, { status: 400 });
  }

  const result = await validateDiscount(code, subtotal, shipping);
  if (!result.ok) {
    return NextResponse.json(result, { status: 200 });
  }

  /* Don't leak the Sanity doc ID to the client — the checkout API re-validates. */
  const { docId: _docId, ...publicResult } = result;
  void _docId;
  return NextResponse.json(publicResult);
}
