import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedProducts } from '@/lib/data';
import { PromoTicker } from '@/components/PromoTicker';
import { InstagramSection } from '@/components/InstagramSection';
import { ProductCarousel } from '@/components/ProductCarousel';

export const revalidate = 60;

const WIX = 'https://static.wixstatic.com/media';
const IMG = {
  hero:        `${WIX}/f0cf6b_510434021b004f2abcfcc53a3a965203~mv2.jpg`,
  marinaModel: `${WIX}/f0cf6b_0fb65fabc4d54b149a2b6213e5153e9e~mv2.jpg`,
  catKabelky:  `${WIX}/f0cf6b_8a21028ccb924868a7824d820313a55c~mv2.jpg`,
  catKufry:    `${WIX}/f0cf6b_3ce5a12e7ebe4524a196ef34a03d1e59~mv2.jpg`,
};

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="-mt-[76px] px-4 pt-4 md:-mt-[88px] md:px-6 md:pt-5">
        <div className="relative w-full overflow-hidden rounded-[2rem] md:rounded-[2.25rem] aspect-[3/4] sm:aspect-[16/10] md:aspect-[16/8]">
          <Image
            src={IMG.hero}
            alt="Cestujte se stylem — Levstra"
            fill priority sizes="100vw"
            className="object-cover object-[50%_20%]"
          />
          <div className="absolute inset-0 flex items-end pb-8 md:pb-12">
            <div className="w-full px-4 md:px-6">
              <div className="max-w-5xl">
                <h1
                  className="font-poppins-semibold leading-[1.0] text-white"
                  style={{ fontSize: 'clamp(2rem, 7.5vw, 8rem)', letterSpacing: '-0.035em', color: '#fff' }}
                >
                  Cestujte se<br />stylem.
                </h1>
                <p
                  className="font-serif mt-4 text-white"
                  style={{ fontSize: 'clamp(1rem, 2.4vw, 2.8rem)', lineHeight: 1.35, color: '#fff' }}
                >
                  Kufry a kabelky, které zvládnou letiště i&nbsp;večerní rande
                </p>
                <Link
                  href="/shop"
                  className="marina-btn mt-6 inline-flex items-center rounded-xl border-2 border-white px-9 py-3.5 font-poppins-semibold"
                  style={{ fontSize: '20px' }}
                >
                  <span className="marina-btn-text text-white">Nakupovat</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS ─────────────────────────────────────────────── */}
      <ProductCarousel products={featured} />

      {/* ── MARINA GALANTI BANNER ─────────────────────────────────────── */}
      <section className="px-4 pt-4 md:px-6 md:pt-5">
        <div
          className="relative w-full overflow-hidden rounded-[2rem] md:rounded-[2.25rem] aspect-[4/3] sm:aspect-[16/9] md:aspect-[16/6]"
        >
          <Image
            src={IMG.marinaModel}
            alt="Modelka s kabelkou Marina Galanti"
            fill sizes="100vw"
            className="object-cover object-[55%_40%]"
          />
          <div
            className="absolute inset-0 md:hidden"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.65) 100%)' }}
          />
          <div
            className="absolute inset-0 hidden md:block"
            style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.22) 45%, rgba(0,0,0,0) 68%)' }}
          />
          <div className="absolute inset-0 flex items-end" style={{ paddingBottom: 'calc(2.5rem + 64px)' }}>
            <div className="w-full px-4 md:px-6">
              <div className="max-w-lg">
                <h2
                  className="font-poppins-semibold leading-[1.05] text-white"
                  style={{ color: '#fff', fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}
                >
                  Lehkost, styl,<br />nadčasovost.
                </h2>
                <p
                  className="font-serif mt-3 text-white"
                  style={{ color: '#fff', fontSize: 'clamp(0.9rem, 1.5vw, 1.3rem)', lineHeight: 1.35 }}
                >
                  Nové kousky Marina Galanti už jsou skladem.
                </p>
                <Link
                  href="/shop/kabelky"
                  className="marina-btn mt-5 inline-flex items-center rounded-xl border-2 border-white px-7 py-3 font-poppins-semibold"
                  style={{ fontSize: '16px' }}
                >
                  <span className="marina-btn-text text-white">Prohlédnout kolekci</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <PromoTicker message="doprava zdarma při objednávce nad 1500 Kč" />
          </div>
        </div>
      </section>

      {/* ── CATEGORY GRID ────────────────────────────────────────────── */}
      <section className="px-4 py-12 md:px-6 md:py-16">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
          <div className="flex flex-col items-start gap-6 md:w-[30%] md:pt-1">
            <h2
              className="font-poppins-semibold leading-[1.1] tracking-tight"
              style={{ color: '#2B312F', fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)' }}
            >
              Nakupujte podle kategorie
            </h2>
            <Link
              href="/shop"
              className="inline-flex items-center rounded-xl border-2 px-5 py-2 text-sm font-semibold transition hover:opacity-70"
              style={{ borderColor: '#2D5143', color: '#2D5143' }}
            >
              Zobrazit vše
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:w-[70%] md:gap-5">
            <CategoryCard href="/shop/kabelky" label="kabelky" image={IMG.catKabelky} />
            <CategoryCard href="/shop/kufry" label="kufry" image={IMG.catKufry} />
          </div>
        </div>
      </section>

      {/* ── BRAND STORY ──────────────────────────────────────────────── */}
      <section className="px-4 py-12 md:px-6 md:py-16">
        <div
          className="reveal-on-scroll rounded-3xl px-8 py-12 text-center md:px-20 md:py-16"
          style={{ background: '#A0C8FF' }}
        >
          <h2
            className="font-poppins-semibold leading-[1.1]"
            style={{ color: '#2D5143', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
          >
            Náš příběh
          </h2>
          <p
            className="font-serif mx-auto mt-6 max-w-4xl leading-[1.25]"
            style={{ color: '#2D5143', fontSize: 'clamp(1.5rem, 3.5vw, 3rem)' }}
          >
            Módu dovážíme už přes dvě desetiletí. Za tu dobu nám rukama prošly stovky kolekcí – a my dnes víme přesně, co má smysl nabízet dál.
          </p>
          <p
            className="font-poppins-light mt-8"
            style={{ color: '#2D5143', fontSize: '13px' }}
          >
            Protože každý si zaslouží kvalitní módu.
          </p>
        </div>
      </section>

      {/* ── INSTAGRAM ────────────────────────────────────────────────── */}
      <InstagramSection />
    </>
  );
}

function CategoryCard({ href, label, image }: { href: string; label: string; image: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl p-3 transition-colors duration-500 bg-[#F2F0EB] hover:bg-[#C7DFFF]"
    >
      <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: '3/4', maxHeight: '42vh' }}>
        <Image
          src={image} alt={label} fill
          sizes="(min-width: 768px) 34vw, 50vw"
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-3">
        <div
          className="cat-label w-full rounded-xl border-2 py-3 md:py-3.5"
          style={{ borderColor: '#2B312F' }}
        >
          <div className="cat-label-inner">
            <span
              className="cat-label-word font-poppins-semibold lowercase tracking-wide"
              style={{ fontSize: 'clamp(1.05rem, 1.6vw, 1.3rem)' }}
            >
              {label}
            </span>
            <span className="cat-label-arrow" aria-hidden="true">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
