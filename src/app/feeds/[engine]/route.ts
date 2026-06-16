import { getFeedItems, FEED_BUILDERS } from '@/lib/feed';

/**
 * Product feeds for price-comparison engines:
 *   /feeds/heureka.xml · /feeds/zbozi.xml · /feeds/google.xml
 *
 * Dynamic GET handler, CDN-cached for an hour via Cache-Control so the
 * Sanity fetch only runs on a cache miss.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ engine: string }> },
): Promise<Response> {
  const { engine } = await ctx.params;
  const build = FEED_BUILDERS[engine];
  if (!build) {
    return new Response('Feed not found', { status: 404 });
  }

  const items = await getFeedItems();
  const xml = build(items);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
