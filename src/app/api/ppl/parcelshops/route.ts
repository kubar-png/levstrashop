import { NextResponse } from 'next/server';
import { listParcelShops } from '@/lib/ppl';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const zip = new URL(req.url).searchParams.get('zip');
  if (!zip) return NextResponse.json({ error: 'zip required' }, { status: 400 });
  try {
    const shops = await listParcelShops(zip);
    return NextResponse.json({ shops });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'PPL error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
