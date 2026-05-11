import { NextResponse } from 'next/server';
import { verifyNotification } from '@/lib/comgate';
import { sanityWriteClient } from '@/sanity/client';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const text = await req.text();
  const data = Object.fromEntries(new URLSearchParams(text));

  if (!verifyNotification(data)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { transId, refId, state, price, curr, email, method, test } = data;

  if (state === 'PAID') {
    try {
      await sanityWriteClient.create({
        _type: 'order',
        transId,
        refId,
        email: email ?? '',
        totalCents: Number(price),
        currency: curr ?? 'CZK',
        paymentMethod: method ?? '',
        isTest: test === '1' || test === 'true',
        status: 'paid',
        paidAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[comgate webhook] Sanity save failed:', err);
    }
  }

  // ComGate expects plain 200 OK
  return new Response('OK', { status: 200 });
}
