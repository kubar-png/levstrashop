import Link from 'next/link';
import Image from 'next/image';
import { sanityClient, urlFor } from '@/sanity/client';
import { featuredProductsQuery } from '@/sanity/queries';
import { formatPrice } from '@/lib/format';
import type { ProductSummary } from '@/sanity/types';
import { HeroIllustration, HandbagIllustration } from '@/components/HeroIllustration';

export const revalidate = 60;

export default async function HomePage() {
  let featured: ProductSummary[] = [];
  try {
    featured = await sanityClient.fetch<ProductSummary[]>(featuredProductsQuery);
  } catch {}

  return (
    <>
      {/* Hero */}
      <section className="border-b border-neutral-200 bg-[#fdf6f0]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#c46a3d]">
              Marina Galanti · Levstra
            </p>
            <h1 className="font-display mt-4 text-6xl font-medium leading-[1.05] md:text-7xl">
              Cestujte<br />se stylem.
            </h1>
            <p className="mt-7 max-w-md text-lg text-neutral-700">
              Kufry a kabelky, které vás doprovodí na letiště i na večerní rande.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-full bg-neutral-900 px-8 py-3.5 text-sm font-medium tracking-wide text-white transition hover:bg-neutral-700"
              >
                Nakupovat
              </Link>
              <Link
                href="/shop/kufry"
                className="rounded-full border border-neutral-300 px-8 py-3.5 text-sm font-medium tracking-wide hover:border-neutral-900"
              >
                Kufry
              </Link>
            </div>
          </div>
          <div className="md:pl-10">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* Free shipping strip */}
      <div className="bg-neutral-900 py-3 text-center text-xs uppercase tracking-[0.25em] text-white">
        Doprava zdarma při objednávce nad 1 500 Kč
      </div>

      {/* Best sellers */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Výběr sezóny</p>
            <h2 className="font-display mt-2 text-4xl font-medium tracking-tight md:text-5xl">
              Nejoblíbenější kousky
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden text-sm text-neutral-600 hover:text-neutral-900 md:block"
          >
            Zobrazit vše →
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center text-neutral-500">
            Zatím žádné produkty. Přidejte je v{' '}
            <Link href="/studio" className="font-medium text-neutral-900 underline">
              Sanity Studio
            </Link>
            .
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <BestSellerCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Marina Galanti collection */}
      <section className="border-y border-neutral-200 bg-[#f6efe5]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center">
          <div className="md:order-1">
            <HandbagIllustration />
          </div>
          <div className="md:order-2">
            <p className="text-xs uppercase tracking-[0.3em] text-[#c46a3d]">
              Kolekce Marina Galanti
            </p>
            <h2 className="font-display mt-4 text-4xl font-medium md:text-5xl">
              Lehkost,<br />styl,<br />nadčasovost.
            </h2>
            <p className="mt-6 max-w-md text-neutral-700">
              Italská značka, kterou už přes dvě desetiletí přivážíme do Česka. Kabelky a kufry
              pro ženy, které si potrpí na detail.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-block rounded-full border border-neutral-900 px-8 py-3.5 text-sm font-medium hover:bg-neutral-900 hover:text-white"
            >
              Prohlédnout kolekci
            </Link>
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Kategorie</p>
        <h2 className="font-display mt-2 mb-12 text-4xl font-medium md:text-5xl">
          Co hledáte?
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <CategoryTile
            href="/shop/kabelky"
            title="Kabelky"
            subtitle="Pro každý den i pro výjimečné chvíle."
            variant="bag"
          />
          <CategoryTile
            href="/shop/kufry"
            title="Kufry"
            subtitle="Cestovní zavazadla pro letiště i víkend."
            variant="suitcase"
          />
        </div>
      </section>

      {/* Brand story */}
      <section className="bg-neutral-900 text-neutral-100">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#e9a878]">O značce</p>
          <h2 className="font-display mt-4 text-4xl font-medium md:text-5xl">
            Módu dovážíme už přes dvě desetiletí.
          </h2>
          <p className="mt-7 text-neutral-300">
            Levstra je rodinný projekt postavený na kvalitě, vkusu a dlouhých přátelstvích s
            italskými výrobci. Každý kus, který u nás najdete, si nejdřív vybereme sami.
          </p>
          <Link
            href="/o-nas"
            className="mt-9 inline-block rounded-full border border-neutral-100 px-8 py-3.5 text-sm font-medium hover:bg-white hover:text-neutral-900"
          >
            Náš příběh
          </Link>
        </div>
      </section>

      {/* Instagram */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Sledujte nás</p>
        <h2 className="font-display mt-2 text-5xl font-medium md:text-6xl">@levstra</h2>
        <p className="mt-4 text-neutral-600">Novinky, zákulisí a inspirace na Instagramu.</p>
        <a
          href="https://instagram.com/levstra"
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-block rounded-full bg-neutral-900 px-8 py-3.5 text-sm font-medium text-white hover:bg-neutral-700"
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
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#f6efe5]">
        {product.image && (
          <Image
            src={urlFor(product.image).width(800).height(1000).url()}
            alt={product.image.alt || product.title}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between">
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
  variant,
}: {
  href: string;
  title: string;
  subtitle: string;
  variant: 'bag' | 'suitcase';
}) {
  const bg =
    variant === 'suitcase'
      ? 'bg-gradient-to-br from-[#f8d4b0] to-[#e9a878]'
      : 'bg-gradient-to-br from-[#f6efe5] to-[#e8d5b8]';
  return (
    <Link
      href={href}
      className={`group relative flex aspect-[16/10] flex-col justify-end overflow-hidden rounded-2xl p-10 ${bg}`}
    >
      <h3 className="font-display text-4xl font-medium md:text-5xl">{title}</h3>
      <p className="mt-2 max-w-xs text-sm text-neutral-800">{subtitle}</p>
      <span className="mt-4 inline-block text-sm font-medium tracking-wide group-hover:underline">
        Nakupovat →
      </span>
    </Link>
  );
}
