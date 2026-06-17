import { getProductBySlug, getProductsByCategory } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ProductPageClient } from '@/components/ProductPageClient';
import type { Metadata } from 'next';

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ciaobag.cz';
const BRAND = 'Ciaobag';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const canonical = `${SITE_URL}/shop/p/${product.slug}`;
  return {
    title: `${product.title} — ${BRAND}`,
    description: product.shortDescription,
    alternates: { canonical },
    openGraph: {
      title: product.title,
      description: product.shortDescription,
      url: canonical,
      type: 'website',
      images: product.imageUrls[0] ? [product.imageUrls[0]] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ barva?: string }>;
}) {
  const { slug } = await params;
  const { barva } = await searchParams;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  /* Related products from the same category (excluding the current product). */
  const related = product.category?.slug
    ? (await getProductsByCategory(product.category.slug)).filter((p) => p.slug !== slug).slice(0, 8)
    : [];

  /* ── Schema.org Product with per-variant Offer (Google Shopping ready) ── */
  const url = `${SITE_URL}/shop/p/${product.slug}`;
  const priceValidUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.shortDescription,
    image: product.imageUrls,
    sku: product.variants[0]?.sku,
    brand: { '@type': 'Brand', name: BRAND },
    category: product.category?.title,
    url,
    offers: product.variants.map((v) => ({
      '@type': 'Offer',
      sku: v.sku,
      url,
      priceCurrency: 'CZK',
      price: (v.priceCents / 100).toFixed(0),
      priceValidUntil,
      availability:
        v.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: BRAND },
    })),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Domů', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'E-shop', item: `${SITE_URL}/shop` },
      ...(product.category
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: product.category.title,
              item: `${SITE_URL}/shop/${product.category.slug}`,
            },
            { '@type': 'ListItem', position: 4, name: product.title, item: url },
          ]
        : [{ '@type': 'ListItem', position: 3, name: product.title, item: url }]),
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 md:px-6 md:pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <div className="grid gap-10 md:grid-cols-2 md:gap-14 lg:gap-20">
        <ProductPageClient product={product} related={related} initialColor={barva} />
      </div>
    </div>
  );
}
