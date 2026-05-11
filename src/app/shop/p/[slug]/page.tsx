import { sanityClient, urlFor } from '@/sanity/client';
import { productBySlugQuery } from '@/sanity/queries';
import { PortableText } from 'next-sanity';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ProductBuyBox } from '@/components/ProductBuyBox';
import type { Product } from '@/sanity/types';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await sanityClient.fetch<Product | null>(productBySlugQuery, { slug });
    if (!product) return {};
    return {
      title: product.title,
      description: product.shortDescription,
      openGraph: {
        title: product.title,
        description: product.shortDescription,
        images: product.images[0]
          ? [urlFor(product.images[0]).width(1200).height(630).url()]
          : undefined,
      },
    };
  } catch {
    return {};
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let product: Product | null = null;
  try {
    product = await sanityClient.fetch<Product | null>(productBySlugQuery, { slug });
  } catch {
    notFound();
  }
  if (!product) notFound();

  const minPrice = Math.min(...product.variants.map((v) => v.priceCents));
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.shortDescription,
    image: product.images.map((img) => urlFor(img).width(1200).url()),
    category: product.category?.title,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'CZK',
      lowPrice: (minPrice / 100).toFixed(0),
      offerCount: product.variants.length,
      availability:
        totalStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-6 py-12 md:grid-cols-2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
      <div className="grid gap-4">
        {product.images.map((img, i) => (
          <div
            key={img._key ?? i}
            className="relative aspect-[4/5] overflow-hidden rounded-lg bg-neutral-100"
          >
            <Image
              src={urlFor(img).width(1200).height(1500).url()}
              alt={img.alt || product!.title}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      <div className="md:sticky md:top-24 md:self-start">
        <p className="text-sm uppercase tracking-wide text-neutral-500">
          {product.category?.title}
        </p>
        <h1 className="font-display mt-2 text-4xl font-medium md:text-5xl">{product.title}</h1>
        {product.shortDescription && (
          <p className="mt-3 text-neutral-600">{product.shortDescription}</p>
        )}

        <ProductBuyBox product={product} />

        {product.description && (
          <div className="prose prose-neutral mt-10 max-w-none text-sm">
            <PortableText value={product.description} />
          </div>
        )}
      </div>
    </div>
  );
}
