import { getProductBySlug } from '@/lib/data';
import { ProductImage } from '@/components/ProductImage';
import { notFound } from 'next/navigation';
import { ProductBuyBox } from '@/components/ProductBuyBox';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.title,
    description: product.shortDescription,
    openGraph: {
      title: product.title,
      description: product.shortDescription,
      images: product.imageUrls[0] ? [product.imageUrls[0]] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const minPrice = Math.min(...product.variants.map((v) => v.priceCents));
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.shortDescription,
    image: product.imageUrls,
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

  const images = product.imageUrls.length > 0 ? product.imageUrls : [null];

  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-6 py-12 md:grid-cols-2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />

      <div className="grid gap-4">
        {images.map((src, i) => (
          <ProductImage
            key={i}
            src={src}
            alt={product.title}
            placeholder={product.placeholder}
            sizes="(min-width: 768px) 50vw, 100vw"
            priority={i === 0}
          />
        ))}
      </div>

      <div className="md:sticky md:top-24 md:self-start">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
          {product.category?.title}
        </p>
        <h1 className="mt-2 text-4xl font-medium md:text-5xl">{product.title}</h1>
        {product.shortDescription && (
          <p className="mt-3 text-neutral-600">{product.shortDescription}</p>
        )}

        <ProductBuyBox product={product} />

        {product.descriptionText && (
          <p className="mt-10 text-sm leading-relaxed text-neutral-700">
            {product.descriptionText}
          </p>
        )}
      </div>
    </div>
  );
}
