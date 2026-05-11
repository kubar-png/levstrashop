import type { PortableTextBlock } from 'next-sanity';

export type Variant = {
  _key?: string;
  sku: string;
  size?: string;
  color?: string;
  priceCents: number;
  stock: number;
  weightGrams?: number;
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
  minPriceCents: number;
  totalStock?: number;
  featured?: boolean;
};

export type Product = {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: PortableTextBlock[];
  images: SanityImage[];
  category: { title: string; slug: string };
  variants: Variant[];
};
