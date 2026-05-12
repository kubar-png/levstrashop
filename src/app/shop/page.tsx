import Image from 'next/image';
import { getAllProducts, getProductsByCategory } from '@/lib/data';
import { ShopClient } from '@/components/ShopClient';

export const revalidate = 60;
export const metadata = { title: 'E-shop — Levstra' };

const WIX = 'https://static.wixstatic.com/media';
const HERO = {
  all:     `${WIX}/f0cf6b_510434021b004f2abcfcc53a3a965203~mv2.jpg`,
  kabelky: `${WIX}/f0cf6b_0fb65fabc4d54b149a2b6213e5153e9e~mv2.jpg`,
  kufry:   `${WIX}/f0cf6b_510434021b004f2abcfcc53a3a965203~mv2.jpg`,
};
const HERO_TEXT = {
  all:     { title: 'Všechny naše produkty', sub: 'Kabelky a kufry pro každou cestu.' },
  kabelky: { title: 'Kabelky',               sub: 'Pro každý den i pro výjimečné chvíle.' },
  kufry:   { title: 'Kufry',                 sub: 'Cestovní zavazadla pro letiště i víkend.' },
};

const VALID = ['all', 'kabelky', 'kufry'] as const;
type Cat = typeof VALID[number];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: rawCat } = await searchParams;
  const cat: Cat = VALID.includes(rawCat as Cat) ? (rawCat as Cat) : 'all';

  const products =
    cat === 'all'
      ? await getAllProducts()
      : await getProductsByCategory(cat);

  const prices = products.map((p) => p.minPriceCents);
  const globalMin = prices.length ? Math.min(...prices) : 0;
  const globalMax = prices.length ? Math.max(...prices) : 1000000;

  const heroSrc = HERO[cat];
  const { title, sub } = HERO_TEXT[cat];

  return (
    <>
      {/* ── HERO — pulled behind the fixed pill nav, same as homepage ── */}
      <section className="mx-auto max-w-7xl -mt-[76px] px-4 pt-4 md:-mt-[88px] md:px-6 md:pt-6">
        <div
          className="relative w-full overflow-hidden aspect-[4/5] sm:aspect-[16/10] md:aspect-[16/7]"
          style={{ borderRadius: 'var(--radius-2xl)' }}
        >
          <Image
            src={heroSrc}
            alt={title}
            fill
            priority
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="object-cover object-[50%_30%]"
          />
          {/* Bottom-only scrim: most of the image stays clean and saturated;
              dark slab fades in tightly behind the text block at the bottom. */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(0,0,0,0.32) 86%, rgba(0,0,0,0.62) 100%)',
            }}
          />
          <div className="absolute inset-0 flex items-end pb-7 md:pb-10 px-7 md:px-10">
            <div>
              <h1
                className="font-poppins-semibold leading-[1.0]"
                style={{
                  fontSize: 'var(--text-h1)',
                  letterSpacing: '-0.03em',
                  color: 'var(--color-cream)',
                }}
              >
                {title}
              </h1>
              <p
                className="font-serif mt-1.5"
                style={{
                  fontSize: 'var(--text-lead)',
                  color: 'rgba(242,240,235,0.88)',
                }}
              >
                {sub}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTERS + GRID ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <ShopClient
          products={products}
          activeCategory={cat}
          globalMin={globalMin}
          globalMax={globalMax}
        />
      </div>
    </>
  );
}
