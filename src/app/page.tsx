import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedProducts } from '@/lib/data';
import { PromoTicker } from '@/components/PromoTicker';
import { InstagramSection } from '@/components/InstagramSection';
import { ProductCarousel } from '@/components/ProductCarousel';
import { HeroGallery } from '@/components/HeroGallery';

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ciaobag.cz';

export const metadata = {
  alternates: { canonical: '/' },
};

const ORG_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Ciaobag',
  legalName: 'Levstra s.r.o.',
  url: SITE_URL,
  logo: `${SITE_URL}/icon`,
  email: 'ahoj@ciaobag.cz',
  telephone: '+420516770609',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Hněvkovského 587/39a',
    addressLocality: 'Brno',
    postalCode: '617 00',
    addressCountry: 'CZ',
  },
  sameAs: ['https://instagram.com/levstra'],
};

const WEBSITE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Ciaobag',
  url: SITE_URL,
};

const WIX = 'https://static.wixstatic.com/media';
const IMG = {
  marinaModel: `${WIX}/f0cf6b_0fb65fabc4d54b149a2b6213e5153e9e~mv2.jpg`,
  catKabelky:  `${WIX}/f0cf6b_8a21028ccb924868a7824d820313a55c~mv2.jpg`,
  catKufry:    `${WIX}/f0cf6b_3ce5a12e7ebe4524a196ef34a03d1e59~mv2.jpg`,
};

// Hero rotation images — swap freely from Sanity / your CDN.
const HERO_IMAGES = [
  `${WIX}/f0cf6b_510434021b004f2abcfcc53a3a965203~mv2.jpg`,
  `${WIX}/f0cf6b_29b8ee8366484656828782c7267140df~mv2.jpg`,
  `${WIX}/f0cf6b_447c2054b701497e93bbfa703008a619~mv2.jpg`,
  `${WIX}/f0cf6b_59b0236fe6ae4dd39ea9700a093c14e4~mv2.jpg`,
];

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSONLD) }}
      />
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="-mt-[76px] px-4 pt-4 md:-mt-[88px] md:px-6 md:pt-6">
        <div
          className="relative w-full overflow-hidden aspect-[3/4] sm:aspect-[16/10] md:aspect-[16/8]"
          style={{ borderRadius: 'var(--radius-2xl)' }}
        >
          <HeroGallery images={HERO_IMAGES} alt="Cestujte se stylem — Ciaobag" />
          <div
            className="absolute inset-0 z-[5] pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.45) 100%)' }}
          />
          <div className="absolute inset-0 z-[6] flex items-end pb-8 md:pb-12 pointer-events-none">
            <div className="w-full px-4 md:px-6">
              <div className="max-w-5xl">
                <h1
                  className="font-poppins-semibold leading-[1.0]"
                  style={{
                    fontSize: 'var(--text-display)',
                    letterSpacing: '-0.035em',
                    color: '#fff',
                  }}
                >
                  Cestujte se<br />stylem.
                </h1>
                <p
                  className="font-serif mt-4"
                  style={{
                    fontSize: 'var(--text-lead)',
                    lineHeight: 1.35,
                    color: '#fff',
                  }}
                >
                  Kufry a kabelky, které zvládnou letiště i&nbsp;večerní rande
                </p>
                <Link
                  href="/shop"
                  className="btn-primary mt-6 pointer-events-auto"
                  data-on-dark="true"
                >
                  Nakupovat
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
          className="relative w-full overflow-hidden aspect-[4/5] sm:aspect-[16/10] md:aspect-[16/7]"
          style={{ borderRadius: 'var(--radius-2xl)' }}
        >
          <Image
            src={IMG.marinaModel}
            alt="Modelka s kabelkou Marina Galanti"
            fill sizes="100vw"
            className="object-cover object-[55%_40%]"
          />
          {/* Deeper bottom gradient on mobile so the text sits on a richer base now that it's lower. */}
          <div
            className="absolute inset-0 md:hidden"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 38%, rgba(0,0,0,0.78) 100%)' }}
          />
          <div
            className="absolute inset-0 hidden md:block"
            style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.22) 45%, rgba(0,0,0,0) 68%)' }}
          />
          {/* Content hugs the bottom: 20px breathing room above the promo ticker (64px). */}
          <div
            className="absolute inset-0 flex items-end"
            style={{ paddingBottom: 'calc(1.25rem + 64px)' }}
          >
            <div className="w-full px-4 md:px-6">
              <div className="max-w-lg">
                <h2
                  className="font-poppins-semibold leading-[1.05]"
                  style={{
                    color: '#fff',
                    fontSize: 'var(--text-h1)',
                    letterSpacing: '-0.03em',
                  }}
                >
                  Lehkost, styl,<br />nadčasovost.
                </h2>
                <p
                  className="font-serif mt-3"
                  style={{
                    color: '#fff',
                    fontSize: 'var(--text-lead)',
                    lineHeight: 1.35,
                  }}
                >
                  Nové kousky Marina Galanti už jsou skladem.
                </p>
                <Link
                  href="/shop/kabelky"
                  className="btn-secondary mt-5"
                  data-on-dark="true"
                >
                  Prohlédnout kolekci
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
      <section
        className="px-4 md:px-6"
        style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}
      >
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
          <div className="md:w-[30%] md:pt-1">
            <h2
              className="font-poppins-semibold leading-[1.1]"
              style={{
                color: 'var(--color-ink)',
                fontSize: 'var(--text-h2)',
                letterSpacing: '-0.025em',
              }}
            >
              Nakupujte podle kategorie
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:w-[70%] md:gap-5">
            <CategoryCard href="/shop/kabelky" label="kabelky" image={IMG.catKabelky} />
            <CategoryCard href="/shop/kufry" label="kufry" image={IMG.catKufry} />
          </div>
        </div>
      </section>

      {/* ── BRAND STORY ──────────────────────────────────────────────── */}
      <section
        className="px-4 md:px-6"
        style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}
      >
        <div
          className="reveal-on-scroll px-8 py-12 text-center md:px-20 md:py-16"
          style={{
            background: 'var(--color-sky)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <h2
            className="font-poppins-semibold leading-[1.1]"
            style={{
              color: 'var(--color-forest)',
              fontSize: 'var(--text-h1)',
              letterSpacing: '-0.025em',
            }}
          >
            Náš příběh
          </h2>
          <p
            className="font-serif mx-auto mt-6 max-w-3xl"
            style={{
              color: 'var(--color-forest)',
              fontSize: 'var(--text-lead)',
              lineHeight: 1.5,
            }}
          >
            Módu dovážíme už přes dvě desetiletí. Za tu dobu nám rukama prošly stovky kolekcí – a my dnes víme přesně, co má smysl nabízet dál.
          </p>
          <p
            className="font-poppins-light mt-8"
            style={{
              color: 'var(--color-forest)',
              fontSize: 'var(--text-small)',
              letterSpacing: '0.04em',
            }}
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
      className="group block p-3 transition-colors duration-500 bg-[var(--color-cream)] hover:bg-[var(--color-sky-light)]"
      style={{ borderRadius: 'var(--radius-lg)' }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: '3/4',
          maxHeight: '42vh',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <Image
          src={image} alt={label} fill
          sizes="(min-width: 768px) 34vw, 50vw"
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-3">
        <div
          className="cat-label w-full border-2 py-3 md:py-3.5"
          style={{
            borderColor: 'var(--color-ink)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div className="cat-label-inner">
            <span
              className="cat-label-word font-poppins-semibold lowercase tracking-wide"
              style={{ fontSize: 'var(--text-lead)' }}
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
