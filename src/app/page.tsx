import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedProducts } from '@/lib/data';
import { ProductCard } from '@/components/ProductCard';
import { PromoTicker } from '@/components/PromoTicker';
import { InstagramSection } from '@/components/InstagramSection';

export const revalidate = 60;

const WIX = 'https://static.wixstatic.com/media';
const IMG_HERO = `${WIX}/f0cf6b_510434021b004f2abcfcc53a3a965203~mv2.jpg`;        // orange suitcase
const IMG_MARINA = `${WIX}/f0cf6b_8a21028ccb924868a7824d820313a55c~mv2.jpg`;     // model w/ handbag
const IMG_KABELKY = `${WIX}/f0cf6b_962f00502d2a46f5b535c2d1fbe3095e~mv2.jpg`;    // category — kabelky
const IMG_KUFRY = `${WIX}/f0cf6b_3ce5a12e7ebe4524a196ef34a03d1e59~mv2.jpg`;      // category — kufry pink
const IMG_STORY = `${WIX}/f0cf6b_eae5f5bd32ea4057a3e7c5dd47647233~mv2.png`;      // brand story

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative">
        <div className="relative h-[68vh] min-h-[480px] w-full overflow-hidden md:h-[78vh]">
          <Image
            src={IMG_HERO}
            alt="Cestujte se stylem — kufr Marina Galanti"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[70%_center]"
          />
          {/* Left-side gradient for legibility */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0) 60%)',
            }}
          />
          <div className="absolute inset-0 flex items-end md:items-center">
            <div className="mx-auto w-full max-w-7xl px-6 pb-12 md:pb-0">
              <div className="max-w-lg text-white">
                <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
                  Cestujte se stylem.
                </h1>
                <p className="mt-5 max-w-md text-lg text-white/90">
                  Kufry a kabelky, které zvládnou letiště i&nbsp;večerní rande.
                </p>
                <Link
                  href="/shop"
                  className="mt-7 inline-flex items-center rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Nakupovat
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Nejoblíbenější kousky
          </h2>
          <Link
            href="/shop"
            className="hidden rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium transition hover:border-black md:inline-block"
          >
            Zobrazit vše
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-7">
          {featured.slice(0, 4).map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/shop"
            className="inline-block rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium"
          >
            Zobrazit vše
          </Link>
        </div>
      </section>

      {/* ── MARINA GALANTI BANNER ─────────────────────────────────────── */}
      <section style={{ background: 'var(--color-sky)' }}>
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <h2 className="text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Lehkost, styl, nadčasovost.
            </h2>
            <p className="mt-6 max-w-md text-lg text-neutral-700">
              Nové kousky Marina Galanti už jsou skladem.
            </p>
            <Link
              href="/shop"
              className="mt-7 inline-flex items-center rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Prohlédnout kolekci
            </Link>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl md:aspect-square">
            <Image
              src={IMG_MARINA}
              alt="Kolekce Marina Galanti"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── PROMO TICKER ─────────────────────────────────────────────── */}
      <PromoTicker message="doprava zdarma při objednávce nad 1500 Kč" />

      {/* ── CATEGORY GRID ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Nakupujte podle kategorie
          </h2>
          <Link
            href="/shop"
            className="rounded-full bg-white px-5 py-2 text-sm font-medium shadow-sm ring-1 ring-neutral-200 transition hover:ring-black"
          >
            Zobrazit vše
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-5 md:gap-8">
          <CategoryCard href="/shop/kabelky" label="kabelky" image={IMG_KABELKY} />
          <CategoryCard href="/shop/kufry" label="kufry" image={IMG_KUFRY} />
        </div>
      </section>

      {/* ── BRAND STORY ──────────────────────────────────────────────── */}
      <section style={{ background: 'var(--color-sky-deep)' }}>
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-[1fr_auto] md:items-center md:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-700">
              Náš příběh
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-[1.15] tracking-tight md:text-5xl">
              Módu dovážíme už přes dvě desetiletí. Za tu dobu nám rukama prošly stovky kolekcí
              a my dnes víme přesně, co má smysl nabízet dál.
            </h2>
            <Link
              href="/o-nas"
              className="mt-8 inline-flex items-center rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Náš příběh
            </Link>
          </div>
          <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-3xl bg-[#f7d54a] md:w-[320px]">
            <Image
              src={IMG_STORY}
              alt="Příběh Levstra"
              fill
              sizes="320px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM ────────────────────────────────────────────────── */}
      <InstagramSection />
    </>
  );
}

function CategoryCard({
  href,
  label,
  image,
}: {
  href: string;
  label: string;
  image: string;
}) {
  return (
    <Link
      href={href}
      className="group relative block aspect-[3/4] overflow-hidden rounded-3xl bg-neutral-200"
    >
      <Image
        src={image}
        alt={label}
        fill
        sizes="(min-width: 768px) 40vw, 50vw"
        className="object-cover transition duration-700 group-hover:scale-105"
      />
      <span className="absolute inset-x-0 bottom-6 mx-auto block w-fit rounded-full bg-white px-7 py-2.5 text-sm font-semibold lowercase tracking-wide shadow-md">
        {label}
      </span>
    </Link>
  );
}
