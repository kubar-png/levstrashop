import { getProductBySlug } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ProductPageClient } from '@/components/ProductPageClient';
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

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-24 pt-28 md:grid-cols-2 md:gap-14 md:px-6 md:pt-32 lg:gap-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
      <ProductPageClient product={product} />
    </div>
  );
}
