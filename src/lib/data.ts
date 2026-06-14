/**
 * View-model layer for products and categories.
 *
 * Each fetcher tries Sanity first; if Sanity is unconfigured or errors,
 * it falls back to mock-data.ts so the storefront always renders.
 *
 * Pages and components consume the "View" types defined here — they don't
 * touch Sanity shapes directly.
 */

import { sanityClient, urlFor } from '@/sanity/client';
import {
  allProductsQuery,
  featuredProductsQuery,
  productBySlugQuery,
  productsByCategoryQuery,
  categoriesQuery,
  colorSiblingsQuery,
  shopProductsQuery,
  recommendationsQuery,
  featuredWithVariantsQuery,
  allPostsQuery,
  postBySlugQuery,
  recentPostsQuery,
} from '@/sanity/queries';
import type { Product, ProductSummary, Category, Post, PostSummary } from '@/sanity/types';
import { mockProducts, mockSummaries, mockCategories } from './mock-data';

export type PlaceholderSpec = {
  kind: 'suitcase' | 'handbag';
  color: string;
  accent: string;
};

export type ColorSibling = {
  slug: string;
  title: string;
  colorHex: string;
};

export type ProductSummaryView = {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  imageUrl: string | null;
  placeholder?: PlaceholderSpec;
  category?: { title: string; slug: string };
  subcategory?: string;
  minPriceCents: number;
  totalStock?: number;
  featured?: boolean;
  colorGroup?: string;
  colorHex?: string;
  heroColor?: string;
  variantColorHexes?: string[];
  colorSiblings?: { slug: string; title?: string; colorHex: string }[];
  /** Per-colour variants for the shop listing (populated by getShopProducts). */
  colorVariants?: ShopVariantView[];
  /** True when the product has no real photo yet (only an SVG placeholder). */
  isPlaceholder?: boolean;
};

export type ShopVariantView = {
  sku: string;
  color?: string;
  colorHex?: string;
  priceCents: number;
  stock: number;
  imageUrl: string | null;
  isPlaceholder: boolean;
};

export type VariantView = {
  sku: string;
  size?: string;
  color?: string;
  colorHex?: string;
  priceCents: number;
  stock: number;
  weightGrams?: number;
  imageUrls?: string[];
};

export type ProductView = {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  descriptionText?: string;
  imageUrls: string[];
  placeholder?: PlaceholderSpec;
  category: { title: string; slug: string };
  subcategory?: string;
  variants: VariantView[];
  featured?: boolean;
  colorGroup?: string;
  colorHex?: string;
  colorSiblings?: ColorSibling[];
};

export type CategoryView = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
};

function toSummary(p: ProductSummary): ProductSummaryView {
  return {
    _id: p._id,
    title: p.title,
    slug: p.slug,
    shortDescription: p.shortDescription,
    imageUrl: p.image ? urlFor(p.image).width(800).auto('format').quality(75).fit('max').url() : null,
    category: p.category,
    subcategory: p.subcategory,
    minPriceCents: p.minPriceCents,
    totalStock: p.totalStock,
    featured: p.featured,
    colorGroup: p.colorGroup,
    colorHex: p.colorHex,
    heroColor: p.heroColor,
    variantColorHexes: p.variantColorHexes?.length ? p.variantColorHexes : undefined,
    colorSiblings: p.colorSiblings?.length ? p.colorSiblings : undefined,
  };
}

function toFull(p: Product): ProductView {
  return {
    _id: p._id,
    title: p.title,
    slug: p.slug,
    shortDescription: p.shortDescription,
    descriptionText: undefined, // Portable Text rendered separately when source is Sanity
    imageUrls: p.images
      .filter((img) => img?.asset?._ref)
      .map((img) => urlFor(img).width(1200).auto('format').quality(78).fit('max').url()),
    category: p.category,
    variants: p.variants.map((v) => ({
      sku: v.sku,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex,
      priceCents: v.priceCents,
      stock: v.stock,
      weightGrams: v.weightGrams,
      imageUrls: v.images?.length
        ? v.images
            .filter((img) => img?.asset?._ref)
            .map((img) => urlFor(img).width(1200).auto('format').quality(78).fit('max').url())
        : undefined,
    })),
    colorGroup: p.colorGroup,
    colorHex: p.colorHex,
  };
}

function isSanityConfigured() {
  const id = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  return !!id && id !== 'placeholder';
}

export async function getFeaturedProducts(): Promise<ProductSummaryView[]> {
  if (!isSanityConfigured()) return mockSummaries.filter((p) => p.featured);
  try {
    const rows = await sanityClient.fetch<ProductSummary[]>(featuredProductsQuery);
    return rows.length ? rows.map(toSummary) : mockSummaries.filter((p) => p.featured);
  } catch {
    return mockSummaries.filter((p) => p.featured);
  }
}

export async function getAllProducts(): Promise<ProductSummaryView[]> {
  if (!isSanityConfigured()) return mockSummaries;
  try {
    const rows = await sanityClient.fetch<ProductSummary[]>(allProductsQuery);
    return rows.length ? rows.map(toSummary) : mockSummaries;
  } catch {
    return mockSummaries;
  }
}

export async function getProductsByCategory(slug: string): Promise<ProductSummaryView[]> {
  if (!isSanityConfigured()) return mockSummaries.filter((p) => p.category?.slug === slug);
  try {
    const rows = await sanityClient.fetch<ProductSummary[]>(productsByCategoryQuery, { slug });
    return rows.length ? rows.map(toSummary) : mockSummaries.filter((p) => p.category?.slug === slug);
  } catch {
    return mockSummaries.filter((p) => p.category?.slug === slug);
  }
}

export type RecommendationView = ProductSummaryView & { variants: VariantView[] };

type RawRecoVariant = {
  sku: string;
  size?: string;
  color?: string;
  colorHex?: string;
  priceCents: number;
  stock: number;
  weightGrams?: number;
};
type RawReco = ProductSummary & { variants?: RawRecoVariant[] };

function toReco(p: RawReco): RecommendationView {
  return {
    ...toSummary(p),
    variants: (p.variants ?? []).map((v) => ({
      sku: v.sku,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex,
      priceCents: v.priceCents,
      stock: v.stock,
      weightGrams: v.weightGrams,
    })),
  };
}

/**
 * Cart upsell: products in the same category as the items already in the
 * cart ($ids), excluding those items. Falls back to featured products when
 * the same-category pool is too small. Only returns products with stock.
 */
export async function getRecommendations(ids: string[], limit = 4): Promise<RecommendationView[]> {
  if (!isSanityConfigured() || ids.length === 0) return [];
  try {
    const sameCat = await sanityClient.fetch<RawReco[]>(recommendationsQuery, { ids });
    let pool = sameCat;
    if (pool.length < limit) {
      const featured = await sanityClient.fetch<RawReco[]>(featuredWithVariantsQuery, { ids });
      const seen = new Set(pool.map((p) => p._id));
      pool = [...pool, ...featured.filter((p) => !seen.has(p._id))];
    }
    return pool
      .map(toReco)
      .filter((r) => r.variants.some((v) => v.stock > 0))
      .slice(0, limit);
  } catch {
    return [];
  }
}

type RawShopVariant = {
  sku: string;
  color?: string;
  colorHex?: string;
  priceCents: number;
  stock: number;
  image?: { asset?: { _ref?: string } };
  imageRef?: string;
};
type RawShopProduct = ProductSummary & { variants?: RawShopVariant[] };

/**
 * Shop listing data with per-colour variants (sku, colour, first image),
 * so the listing can render one card per colour. Falls back to plain
 * summaries (no variants → one card each) when Sanity is unavailable.
 */
export async function getShopProducts(category: 'all' | 'kabelky' | 'kufry'): Promise<ProductSummaryView[]> {
  const mock = () =>
    category === 'all' ? mockSummaries : mockSummaries.filter((p) => p.category?.slug === category);
  if (!isSanityConfigured()) return mock();

  let rows: RawShopProduct[];
  try {
    rows = await sanityClient.fetch<RawShopProduct[]>(shopProductsQuery, { cat: category });
  } catch (err) {
    console.error('[data] getShopProducts fetch failed:', err);
    return mock();
  }
  if (!rows.length) return mock();

  /* Per-image safety: one malformed image must never blow up the whole
     listing (which previously fell back to mock data and hid real products). */
  const safeUrl = (img: unknown): string | null => {
    if (!img) return null;
    try {
      return urlFor(img as Parameters<typeof urlFor>[0]).width(800).auto('format').quality(75).fit('max').url();
    } catch {
      return null;
    }
  };

  const decorated = rows.map((p) => {
    const colorVariants = (p.variants ?? []).map((v) => {
      const ref = v.imageRef ?? v.image?.asset?._ref;
      const url = safeUrl(v.image);
      return {
        sku: v.sku,
        color: v.color,
        colorHex: v.colorHex,
        priceCents: v.priceCents,
        stock: v.stock,
        imageUrl: url,
        isPlaceholder: !ref || ref.endsWith('-svg') || !url,
      };
    });

    /* "Has a real photo" mirrors what cardsForProduct renders: a genuine hero
       upload (not an SVG placeholder) or at least one colour variant with a
       real photo. Products still awaiting photos are sorted to the end. */
    const heroRef = p.image?.asset?._ref;
    const heroReal = !!heroRef && !heroRef.endsWith('-svg');
    const hasPhoto = heroReal || colorVariants.some((v) => v.imageUrl && !v.isPlaceholder);

    return { view: { ...toSummary(p), colorVariants, isPlaceholder: !hasPhoto }, hasPhoto };
  });

  /* Array.sort is stable, so the _createdAt-desc order from the query is kept
     within the photographed and photoless groups respectively. */
  return decorated
    .sort((a, b) => Number(b.hasPhoto) - Number(a.hasPhoto))
    .map((d) => d.view);
}

export async function getProductBySlug(slug: string): Promise<ProductView | null> {
  if (!isSanityConfigured()) {
    const product = mockProducts.find((p) => p.slug === slug) ?? null;
    if (!product) return null;
    if (product.colorGroup) {
      const siblings = mockProducts
        .filter((p) => p.colorGroup === product.colorGroup && p.slug !== product.slug)
        .map((p) => ({ slug: p.slug, title: p.title, colorHex: p.colorHex ?? '#ccc' }));
      return { ...product, colorSiblings: siblings };
    }
    return product;
  }
  try {
    const row = await sanityClient.fetch<Product | null>(productBySlugQuery, { slug });
    if (row) {
      const product = toFull(row);
      if (product.colorGroup) {
        const siblings = await sanityClient.fetch<ColorSibling[]>(colorSiblingsQuery, {
          colorGroup: product.colorGroup,
          slug,
        });
        return { ...product, colorSiblings: siblings };
      }
      return product;
    }
  } catch {}
  const product = mockProducts.find((p) => p.slug === slug) ?? null;
  if (!product) return null;
  if (product.colorGroup) {
    const siblings = mockProducts
      .filter((p) => p.colorGroup === product.colorGroup && p.slug !== product.slug)
      .map((p) => ({ slug: p.slug, title: p.title, colorHex: p.colorHex ?? '#ccc' }));
    return { ...product, colorSiblings: siblings };
  }
  return product;
}

export async function getCategories(): Promise<CategoryView[]> {
  if (!isSanityConfigured()) return mockCategories;
  try {
    const rows = await sanityClient.fetch<Category[]>(categoriesQuery);
    return rows.length ? rows : mockCategories;
  } catch {
    return mockCategories;
  }
}

/* ── Blog ─────────────────────────────────────────────────────────── */

export type PostSummaryView = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImageUrl: string | null;
  publishedAt: string;
  readingMinutes?: number;
};

export type PostView = PostSummaryView & {
  body?: Post['body'];
};

function toPostSummary(p: PostSummary): PostSummaryView {
  return {
    _id: p._id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    coverImageUrl: p.coverImage?.asset?._ref
      ? urlFor(p.coverImage).width(1200).fit('max').url()
      : null,
    publishedAt: p.publishedAt,
    readingMinutes: p.readingMinutes,
  };
}

export async function getAllPosts(): Promise<PostSummaryView[]> {
  if (!isSanityConfigured()) return [];
  try {
    const rows = await sanityClient.fetch<PostSummary[]>(allPostsQuery);
    return rows.map(toPostSummary);
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<PostView | null> {
  if (!isSanityConfigured()) return null;
  try {
    const row = await sanityClient.fetch<Post | null>(postBySlugQuery, { slug });
    if (!row) return null;
    return {
      ...toPostSummary(row),
      body: row.body,
    };
  } catch {
    return null;
  }
}

export async function getRecentPosts(excludeSlug: string): Promise<PostSummaryView[]> {
  if (!isSanityConfigured()) return [];
  try {
    const rows = await sanityClient.fetch<PostSummary[]>(recentPostsQuery, { excludeSlug });
    return rows.map(toPostSummary);
  } catch {
    return [];
  }
}
