import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedProducts } from '@/lib/data';
import { ProductCard } from '@/components/ProductCard';
import { PromoTicker } from '@/components/PromoTicker';
import { InstagramSection } from '@/components/InstagramSection';

export const revalidate = 60;

/** Wix CDN image map — each ID identifies one of the original Levstra photos. */
const WIX = 'https://static.wixstatic.com/media';
const IMG = {
  hero: `${WIX}/f0cf6b_510434021b004f2abcfcc53a3a965203~mv2.jpg`,        // orange RIGA + yellow graffiti
  marinaModel: `${WIX}/f0cf6b_0fb65fabc4d54b149a2b6213e5153e9e~mv2.jpg`, // blonde model w/ white bag
  catKabelky: `${WIX}/f0cf6b_8a21028ccb924868a7824d820313a55c~mv2.jpg`,  // street + white bag
  catKufry: `${WIX}/f0cf6b_3ce5a12e7ebe4524a196ef34a03d1e59~mv2.jpg`,    // pink RIGA + jeans
  storyYellow: `${WIX}/f0cf6b_bf81f093a9fd46868b51b007255b8030~mv2.jpg`, // yellow suitcase lifestyle
};

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative">
        <div className="relative h-[78vh] min-h-[520px] w-full overflow-hidden md:h-[88vh]">
          <Image
            src={IMG.hero}
            alt="Cestujte se stylem — Levstra"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[60%_center]"
          />
          {/* Left dim wash for legibility */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0) 65%)',
            }}
          />
          <div className="absolute inset-0 flex items-end pb-14 md:items-center md:pb-0">
            <div className="mx-auto w-full max-w-7xl px-6">
              <div className="max-w-2xl text-white">
                <h1 className="text-[clamp(3rem,9vw,7.5rem)] font-extrabold leading-[0.95] tracking-[-0.03em]">
                  Cestujte<br />se stylem.
                </h1>
                <p className="mt-6 max-w-md text-base text-white/90 md:text-lg">
                  Kufry a kabelky, které zvládnou letiště i&nbsp;večerní rande.
                </p>
                <Link
                  href="/shop"
                  className="mt-7 inline-flex items-center rounded-full bg-black px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-neutral-900"
                >
                  Nakupovat
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
            Nejoblíbenější kousky
          </h2>
          <Link
            href="/shop"
            className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold transition hover:border-black"
          >
            Zobrazit vše
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-7">
          {featured.slice(0, 4).map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>

      {/* ── MARINA GALANTI BANNER ─────────────────────────────────────── */}
      <section style={{ background: 'var(--color-sky)' }}>
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center md:gap-16 md:py-28">
          <div>
            <h2 className="text-[clamp(2.5rem,6vw,5.25rem)] font-extrabold leading-[0.98] tracking-[-0.03em]">
              Lehkost, styl, nadčasovost.
            </h2>
            <p className="mt-6 max-w-md text-lg text-neutral-800">
              Nové kousky Marina Galanti už jsou skladem.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex items-center rounded-full bg-black px-7 py-3 text-sm font-semibold text-white transition hover:bg-neutral-900"
            >
              Prohlédnout kolekci
            </Link>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] shadow-xl md:aspect-[5/6]">
            <Image
              src={IMG.marinaModel}
              alt="Modelka s kabelkou Marina Galanti"
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
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
            Nakupujte podle kategorie
          </h2>
          <Link
            href="/shop"
            className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold transition hover:border-black"
          >
            Zobrazit vše
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:gap-8">
          <CategoryCard href="/shop/kabelky" label="kabelky" image={IMG.catKabelky} />
          <CategoryCard href="/shop/kufry" label="kufry" image={IMG.catKufry} />
        </div>
      </section>

      {/* ── BRAND STORY ──────────────────────────────────────────────── */}
      <section style={{ background: 'var(--color-sky)' }}>
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-[1.4fr_1fr] md:items-center md:gap-20 md:py-32">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-neutral-700">
              Náš příběh
            </p>
            <h2 className="mt-5 text-[clamp(1.75rem,3.6vw,3rem)] font-bold leading-[1.18] tracking-[-0.015em] text-neutral-900">
              Módu dovážíme už přes dvě desetiletí. Za tu dobu nám rukama prošly stovky kolekcí a
              my dnes víme přesně, co má smysl nabízet dál.
            </h2>
            <div className="mt-10 h-px w-32 bg-neutral-900/30" />
            <Link
              href="/o-nas"
              className="mt-8 inline-flex items-center rounded-full bg-black px-7 py-3 text-sm font-semibold text-white transition hover:bg-neutral-900"
            >
              Náš příběh
            </Link>
          </div>
          <div className="relative aspect-[3/4] w-full max-w-md justify-self-end overflow-hidden rounded-[2rem] shadow-xl">
            <Image
              src={IMG.storyYellow}
              alt="Žlutý kufr Levstra"
              fill
              sizes="(min-width: 768px) 35vw, 100vw"
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
      className="group relative block aspect-[3/4] overflow-hidden rounded-[2rem] bg-neutral-200 md:aspect-[4/5]"
    >
      <Image
        src={image}
        alt={label}
        fill
        sizes="(min-width: 768px) 45vw, 50vw"
        className="object-cover transition duration-700 group-hover:scale-[1.04]"
      />
      <span className="absolute inset-x-0 bottom-7 mx-auto block w-fit rounded-full bg-white px-9 py-3 text-base font-bold lowercase tracking-wide text-neutral-900 shadow-lg">
        {label}
      </span>
    </Link>
  );
}
