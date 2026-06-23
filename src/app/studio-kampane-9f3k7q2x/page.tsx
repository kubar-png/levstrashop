import type { Metadata } from 'next';
import { getShopProducts } from '@/lib/data';
import type { CampaignProduct } from '@/lib/campaign/types';
import Generator from './Generator';

export const metadata: Metadata = {
  title: 'Kampaně — generátor',
  robots: { index: false, follow: false }, // keep it out of search; do NOT add to robots.ts/sitemap.ts
};

export default async function Page() {
  const summaries = await getShopProducts('all');
  const products: CampaignProduct[] = summaries
    .filter((p) => p.imageUrl && p.isPlaceholder !== true)
    .map((p) => {
      // Prefer a real variant price; fall back to summary price fields as available.
      const v = (p.colorVariants ?? []).find((cv) => cv.imageUrl && cv.priceCents);
      return {
        id: p._id,
        title: p.title,
        category: p.category?.title,
        priceCents: v?.priceCents ?? p.minPriceCents ?? 0,
        compareAtCents: v?.compareAtCents ?? undefined,
        imageUrl: p.imageUrl as string,
      };
    })
    .filter((p) => p.priceCents > 0);

  return <Generator products={products} />;
}
