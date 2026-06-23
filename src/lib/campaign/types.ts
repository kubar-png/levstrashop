export type Format = '1x1' | '9x16';

export const DIMENSIONS: Record<Format, { width: number; height: number }> = {
  '1x1': { width: 1080, height: 1080 },
  '9x16': { width: 1080, height: 1920 },
};

export type Archetype = 'lifestyle' | 'productOnColor' | 'productLifestyle' | 'sale';

export type Palette = {
  bg: string;
  ink: string;
  accent: string;
  cta: string;
  ctaInk: string;
};

export type CampaignProduct = {
  id: string;
  title: string;
  category?: string;
  priceCents: number;
  compareAtCents?: number; // present only when the product is on sale
  imageUrl: string;
};

export type VariantSpec = {
  format: Format;
  archetype: Archetype;
  product: CampaignProduct;
  lifestyleUrl?: string; // background / secondary photo
  headline: string;
  cta: string;
  palette: Palette;
};
