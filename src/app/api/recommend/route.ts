import { NextResponse } from 'next/server';
import { getRecommendations } from '@/lib/data';

export const runtime = 'nodejs';

/**
 * Cart upsell feed. Pass the product IDs currently in the cart:
 *   GET /api/recommend?ids=<id1>,<id2>&limit=4
 * Returns same-category products (excluding those in the cart), with a
 * featured fallback, including variants so the client can add to cart.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const ids = (url.searchParams.get('ids') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const limitRaw = Number(url.searchParams.get('limit'));
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 8) : 4;

  if (ids.length === 0) return NextResponse.json({ items: [] });

  try {
    const items = await getRecommendations(ids, limit);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
