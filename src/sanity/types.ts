import type { PortableTextBlock } from 'next-sanity';

export type Variant = {
  _key?: string;
  sku: string;
  size?: string;
  color?: string;
  colorHex?: string;
  priceCents: number;
  stock: number;
  weightGrams?: number;
  images?: SanityImage[];
};

export type SanityImage = {
  _key?: string;
  alt?: string;
  asset: { _ref: string; _type: 'reference' };
};

export type Category = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
};

export type ProductSummary = {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  image: SanityImage;
  category?: { title: string; slug: string };
  subcategory?: string;
  minPriceCents: number;
  totalStock?: number;
  featured?: boolean;
  colorGroup?: string;
  colorHex?: string;
  variantColorHexes?: string[];
  colorSiblings?: { slug: string; title?: string; colorHex: string }[];
};

export type Product = {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: PortableTextBlock[];
  images: SanityImage[];
  category: { title: string; slug: string };
  subcategory?: string;
  variants: Variant[];
  colorGroup?: string;
  colorHex?: string;
};

export type PostSummary = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: SanityImage;
  publishedAt: string;
  readingMinutes?: number;
};

export type Post = PostSummary & {
  body?: PortableTextBlock[];
};
