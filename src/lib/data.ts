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
} from '@/sanity/queries';
import type { Product, ProductSummary, Category } from '@/sanity/types';
import { mockProducts, mockSummaries, mockCategories } from './mock-data';

export type PlaceholderSpec = {
  kind: 'suitcase' | 'handbag';
  color: string;
  accent: string;
};

export type ProductSummaryView = {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  imageUrl: string | null;
  placeholder?: PlaceholderSpec;
  category?: { title: string; slug: string };
  minPriceCents: number;
  totalStock?: number;
  featured?: boolean;
};

export type VariantView = {
  sku: string;
  size?: string;
  color?: string;
  priceCents: number;
  stock: number;
  weightGrams?: number;
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
  variants: VariantView[];
  featured?: boolean;
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
    imageUrl: p.image ? urlFor(p.image).width(800).height(1000).url() : null,
    category: p.category,
    minPriceCents: p.minPriceCents,
    totalStock: p.totalStock,
    featured: p.featured,
  };
}

function toFull(p: Product): ProductView {
  return {
    _id: p._id,
    title: p.title,
    slug: p.slug,
    shortDescription: p.shortDescription,
    descriptionText: undefined, // Portable Text rendered separately when source is Sanity
    imageUrls: p.images.map((img) => urlFor(img).width(1200).height(1500).url()),
    category: p.category,
    variants: p.variants,
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

export async function getProductBySlug(slug: string): Promise<ProductView | null> {
  if (!isSanityConfigured()) return mockProducts.find((p) => p.slug === slug) ?? null;
  try {
    const row = await sanityClient.fetch<Product | null>(productBySlugQuery, { slug });
    if (row) return toFull(row);
  } catch {}
  return mockProducts.find((p) => p.slug === slug) ?? null;
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
