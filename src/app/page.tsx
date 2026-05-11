import Link from 'next/link';
import Image from 'next/image';
import { sanityClient, urlFor } from '@/sanity/client';
import { featuredProductsQuery } from '@/sanity/queries';
import { formatPrice } from '@/lib/format';
import type { ProductSummary } from '@/sanity/types';

export const revalidate = 60;

export default async function HomePage() {
  let featured: ProductSummary[] = [];
  try {
    featured = await sanityClient.fetch<ProductSummary[]>(featuredProductsQuery);
  } catch {}

  return (
    <>
      <section className="border-b border-neutral-200 bg-[#fdf6f0]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
              Marina Galanti · Levstra
            </p>
            <h1 className="mt-3 text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
              Cestujte se stylem.
            </h1>
            <p className="mt-6 max-w-md text-lg text-neutral-700">
              Kufry a kabelky, které vás doprovodí na letiště i na večerní rande.
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                href="/shop"
                className="rounded-full bg-neutral-900 px-7 py-3 text-sm font-medium text-white transition hover:bg-neutral-700"
              >
                Nakupovat
              </Link>
              <Link
                href="/shop/kufry"
                className="rounded-full border border-neutral-300 px-7 py-3 text-sm font-medium hover:border-neutral-900"
              >
                Kufry
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-[#f0c8a8]">
            {/* Placeholder for RIGA ORANGE hero image */}
            <div className="absolute inset-0 flex items-center justify-center text-7xl">🧳</div>
          </div>
        </div>
      </section>

      {/* Free shipping promo strip */}
      <div className="bg-neutral-900 py-3 text-center text-sm font-medium tracking-wide text-white">
        Doprava zdarma při objednávce nad 1 500 Kč
      </div>

      {/* Best sellers */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Nejoblíbenější kousky</h2>
            <p className="mt-1 text-sm text-neutral-600">Vybíráme to nejlepší ze sezóny.</p>
          </div>
          <Link href="/shop" className="text-sm text-neutral-600 hover:text-neutral-900">
            Zobrazit vše →
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-neutral-500">
            Zatím žádné produkty. Přidejte je v{' '}
            <Link href="/studio" className="underline">
              Sanity Studio
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <BestSellerCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Marina Galanti collection */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-200">
            <div className="absolute inset-0 flex items-center justify-center text-6xl">👜</div>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
              Kolekce Marina Galanti
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">
              Lehkost, styl, nadčasovost.
            </h2>
            <p className="mt-5 text-neutral-700">
              Italská značka, kterou už přes dvě desetiletí přivážíme do Česka. Kabelky a kufry pro
              ženy, které si potrpí na detail.
            </p>
            <Link
              href="/shop"
              className="mt-7 inline-block rounded-full border border-neutral-900 px-7 py-3 text-sm font-medium hover:bg-neutral-900 hover:text-white"
            >
              Prohlédnout kolekci
            </Link>
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="mb-10 text-3xl font-semibold tracking-tight">Kategorie</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <CategoryTile
            href="/shop/kabelky"
            title="Kabelky"
            subtitle="Pro každý den i pro výjimečné chvíle."
            tone="bg-[#f5e6d8]"
            emoji="👜"
          />
          <CategoryTile
            href="/shop/kufry"
            title="Kufry"
            subtitle="Cestovní zavazadla pro letiště i víkend."
            tone="bg-[#f0c8a8]"
            emoji="🧳"
          />
        </div>
      </section>

      {/* Brand story */}
      <section className="bg-neutral-900 text-neutral-100">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">O značce</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Módu dovážíme už přes dvě desetiletí.
          </h2>
          <p className="mt-6 text-neutral-300">
            Levstra je rodinný projekt postavený na kvalitě, vkusu a dlouhých přátelstvích s
            italskými výrobci. Každý kus, který u nás najdete, si nejdřív vybereme sami.
          </p>
          <Link
            href="/o-nas"
            className="mt-8 inline-block rounded-full border border-neutral-100 px-7 py-3 text-sm font-medium hover:bg-white hover:text-neutral-900"
          >
            Naše příběh
          </Link>
        </div>
      </section>

      {/* Instagram */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">Sledujte nás</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">@levstra</h2>
        <a
          href="https://instagram.com/levstra"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block rounded-full bg-neutral-900 px-7 py-3 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Otevřít Instagram
        </a>
      </section>
    </>
  );
}

function BestSellerCard({ product }: { product: ProductSummary }) {
  return (
    <Link href={`/shop/p/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-neutral-100">
        {product.image && (
          <Image
            src={urlFor(product.image).width(800).height(1000).url()}
            alt={product.image.alt || product.title}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition group-hover:scale-105"
          />
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-sm font-medium">{product.title}</h3>
        <p className="text-sm text-neutral-600">{formatPrice(product.minPriceCents)}</p>
      </div>
    </Link>
  );
}

function CategoryTile({
  href,
  title,
  subtitle,
  tone,
  emoji,
}: {
  href: string;
  title: string;
  subtitle: string;
  tone: string;
  emoji: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex aspect-[16/10] flex-col justify-end overflow-hidden rounded-lg p-8 ${tone}`}
    >
      <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-50 transition group-hover:scale-110">
        {emoji}
      </div>
      <div className="relative">
        <h3 className="text-2xl font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-neutral-700">{subtitle}</p>
        <span className="mt-3 inline-block text-sm font-medium underline-offset-4 group-hover:underline">
          Nakupovat →
        </span>
      </div>
    </Link>
  );
}
