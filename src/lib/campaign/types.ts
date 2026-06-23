export type Format = '1x1' | '9x16';

export const DIMENSIONS: Record<Format, { width: number; height: number }> = {
  '1x1': { width: 1080, height: 1080 },
  '9x16': { width: 1080, height: 1920 },
};

/** Visual layout templates. The lifestyle ones need a model photo and are only
 *  used for products whose category matches an available photo. */
export type TemplateId =
  | 'banner' // product full-bleed + bottom shade
  | 'colorBlock' // bold brand colour + product card + big headline
  | 'split' // product photo top, colour band bottom
  | 'features' // product + benefit callouts (infographic / USP)
  | 'statement' // big typographic statement (cedule / message)
  | 'sale' // bold discount % + strikethrough price
  | 'lifestyle' // model photo + headline (Kabelky only)
  | 'lifestyleFeatures'; // model photo + benefit badges (Kabelky only)

export const LIFESTYLE_TEMPLATES: TemplateId[] = ['lifestyle', 'lifestyleFeatures'];

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
  template: TemplateId;
  product: CampaignProduct;
  lifestyleUrl?: string; // model/background photo (lifestyle templates)
  headline: string;
  cta: string;
  benefits: string[]; // short benefit lines for features / USP templates
  palette: Palette;
};
