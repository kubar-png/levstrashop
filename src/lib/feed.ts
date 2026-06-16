/**
 * Product feeds for Czech price-comparison engines.
 *
 *   /feeds/heureka.xml   — Heureka.cz  (SHOPITEM)
 *   /feeds/zbozi.xml     — Zboží.cz    (SHOPITEM, zbozi namespace)
 *   /feeds/google.xml    — Google Merchant / Shopping (RSS 2.0 + g: namespace)
 *
 * One purchasable VARIANT = one feed item, grouped by product slug via
 * ITEMGROUP_ID / g:item_group_id. Only in-stock variants are emitted so we
 * never advertise something that can't ship.
 *
 * Pairing notes (read before going live):
 *  - Brand/manufacturer is a single configurable value (FEED_BRAND, default
 *    "Ciaobag") because the product schema has no per-product brand field.
 *    If you resell branded goods, add a `brand` field for proper pairing.
 *  - No EAN/GTIN in the schema → Heureka/Zboží pair by name+manufacturer and
 *    Google by brand+mpn (the SKU). Add EANs later for better matching.
 *  - HEUREKA_CATEGORY paths must match Heureka's live category tree exactly —
 *    verify them in the Heureka admin category browser.
 */
import { sanityClient } from '@/sanity/client';
import { urlFor } from '@/sanity/client';
import { feedProductsQuery } from '@/sanity/queries';
import type { SanityImage } from '@/sanity/types';

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ciaobag.cz').replace(/\/$/, '');
const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || 'CZK';

/* The catalogue is resold branded goods — the real manufacturer is embedded
   in the product title (e.g. "Marina Galanti …", "Swissbrand …"). Detect it
   so feeds pair correctly on Heureka/Zboží/Google; fall back to the house
   brand for anything unrecognised. Extend via FEED_BRANDS (comma-separated). */
const HOUSE_BRAND = process.env.FEED_BRAND || 'Ciaobag';
const KNOWN_BRANDS = (process.env.FEED_BRANDS || 'Marina Galanti,Swissbrand')
  .split(',')
  .map((b) => b.trim())
  .filter(Boolean)
  .sort((a, b) => b.length - a.length); // longest match wins

function detectBrand(title: string): string {
  const t = title.toLowerCase();
  return KNOWN_BRANDS.find((b) => t.startsWith(b.toLowerCase())) || HOUSE_BRAND;
}

/* PPL pricing mirrored from the cart (whole CZK). No COD — Comgate only. */
const SHIPPING = [
  { id: 'PPL', price: 199 },
  { id: 'PPL_PARCELSHOP', price: 129 },
];

/* Heureka requires its own category tree path. VERIFY against Heureka admin. */
const HEUREKA_CATEGORY: Record<string, string> = {
  kufry: 'Heureka.cz | Móda a doplňky | Cestovní tašky a zavazadla | Cestovní kufry',
  kabelky: 'Heureka.cz | Móda a doplňky | Kabelky a tašky | Kabelky',
};

/* Google product taxonomy IDs (stable). */
const GOOGLE_CATEGORY: Record<string, string> = {
  kufry: '5181', // Luggage & Bags > Suitcases
  kabelky: '6551', // Apparel & Accessories > Handbags, Wallets & Cases > Handbags
};

/* ── Source types (shape of feedProductsQuery) ───────────────────────── */

type FeedVariant = {
  sku: string;
  size?: string;
  color?: string;
  priceCents: number;
  compareAtCents?: number | null;
  stock: number;
  weightGrams?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  images?: SanityImage[];
};

type FeedProduct = {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  category?: { title: string; slug: string };
  subcategory?: string;
  images?: SanityImage[];
  variants: FeedVariant[];
};

/** A single flattened, in-stock item ready to render in any feed format. */
type FeedItem = {
  id: string; // variant SKU
  groupId: string; // product slug (groups size variants)
  brand: string; // detected manufacturer
  name: string; // base product name (for pairing)
  fullName: string; // name incl. size (display)
  description: string;
  url: string;
  images: string[]; // absolute jpg URLs, main first
  priceCzk: number; // current selling price, whole CZK
  regularCzk: number; // crossed-out / original price (>= priceCzk)
  onSale: boolean;
  categorySlug: string;
  categoryTitle: string;
  subcategory?: string;
  color?: string;
  size?: string; // human label
  weightKg?: number;
  dimensions?: string; // "55 × 40 × 20 cm"
};

/* ── Helpers ─────────────────────────────────────────────────────────── */

function xml(s: string | number | undefined | null): string {
  if (s === undefined || s === null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function imageUrl(img?: SanityImage): string | null {
  if (!img?.asset?._ref) return null;
  try {
    return urlFor(img).width(1200).fit('max').format('jpg').quality(85).url();
  } catch {
    return null;
  }
}

const SIZE_LABELS: Record<string, string> = {
  'cabin-55': 'Kabinový 55 cm',
  'medium-65': 'Střední 65 cm',
  'large-75': 'Velký 75 cm',
  'one-size': '',
};
function sizeLabel(size?: string): string | undefined {
  if (!size) return undefined;
  const mapped = SIZE_LABELS[size];
  if (mapped !== undefined) return mapped || undefined;
  return size; // S / M / L / XL pass through
}

/** Flatten products → one in-stock item per purchasable variant. */
function toItems(products: FeedProduct[]): FeedItem[] {
  const items: FeedItem[] = [];
  for (const p of products) {
    const catSlug = p.category?.slug ?? '';
    const catTitle = p.category?.title ?? '';
    for (const v of p.variants ?? []) {
      if (!v.sku || (v.stock ?? 0) <= 0) continue; // in-stock only

      const variantImgs = (v.images ?? []).map(imageUrl).filter(Boolean) as string[];
      const productImgs = (p.images ?? []).map(imageUrl).filter(Boolean) as string[];
      const images = (variantImgs.length ? variantImgs : productImgs).slice(0, 10);
      if (!images.length) continue; // feeds require at least one image

      const price = Math.round(v.priceCents / 100);
      const compare = v.compareAtCents ? Math.round(v.compareAtCents / 100) : 0;
      const onSale = compare > price;
      const size = sizeLabel(v.size);
      const dims =
        v.lengthCm && v.widthCm && v.heightCm
          ? `${v.lengthCm} × ${v.widthCm} × ${v.heightCm} cm`
          : undefined;

      items.push({
        id: v.sku,
        groupId: p.slug,
        brand: detectBrand(p.title),
        name: p.title,
        fullName: size ? `${p.title} – ${size}` : p.title,
        description: p.shortDescription?.trim() || p.title,
        url: `${BASE}/shop/p/${p.slug}`,
        images,
        priceCzk: price,
        regularCzk: onSale ? compare : price,
        onSale,
        categorySlug: catSlug,
        categoryTitle: catTitle,
        subcategory: p.subcategory,
        color: v.color,
        size,
        weightKg: v.weightGrams ? v.weightGrams / 1000 : undefined,
        dimensions: dims,
      });
    }
  }
  return items;
}

/* ── Fetch ───────────────────────────────────────────────────────────── */

export async function getFeedItems(): Promise<FeedItem[]> {
  const products = await sanityClient.fetch<FeedProduct[]>(feedProductsQuery);
  return toItems(products ?? []);
}

/* ── Heureka / Zboží shared SHOPITEM rendering ───────────────────────── */

function paramBlock(name: string, value?: string): string {
  if (!value) return '';
  return `    <PARAM><PARAM_NAME>${xml(name)}</PARAM_NAME><VAL>${xml(value)}</VAL></PARAM>\n`;
}

function deliveryBlock(): string {
  return SHIPPING.map(
    (s) =>
      `    <DELIVERY><DELIVERY_ID>${s.id}</DELIVERY_ID><DELIVERY_PRICE>${s.price}</DELIVERY_PRICE></DELIVERY>`,
  ).join('\n');
}

function shopItem(it: FeedItem, opts: { category: (slug: string) => string }): string {
  const alt = it.images
    .slice(1)
    .map((u) => `    <IMGURL_ALTERNATIVE>${xml(u)}</IMGURL_ALTERNATIVE>`)
    .join('\n');

  return `  <SHOPITEM>
    <ITEM_ID>${xml(it.id)}</ITEM_ID>
    <PRODUCTNAME>${xml(it.name)}</PRODUCTNAME>
    <PRODUCT>${xml(it.fullName)}</PRODUCT>
    <DESCRIPTION>${xml(it.description)}</DESCRIPTION>
    <URL>${xml(it.url)}</URL>
    <IMGURL>${xml(it.images[0])}</IMGURL>
${alt ? alt + '\n' : ''}    <PRICE_VAT>${it.priceCzk}</PRICE_VAT>
    <VAT>21%</VAT>
    <MANUFACTURER>${xml(it.brand)}</MANUFACTURER>
    <CATEGORYTEXT>${xml(opts.category(it.categorySlug))}</CATEGORYTEXT>
    <PRODUCTNO>${xml(it.id)}</PRODUCTNO>
    <DELIVERY_DATE>0</DELIVERY_DATE>
    <ITEMGROUP_ID>${xml(it.groupId)}</ITEMGROUP_ID>
${paramBlock('Barva', it.color)}${paramBlock('Velikost', it.size)}${paramBlock('Rozměry', it.dimensions)}${paramBlock('Hmotnost', it.weightKg ? `${it.weightKg} kg` : undefined)}${deliveryBlock()}
  </SHOPITEM>`;
}

export function buildHeurekaXml(items: FeedItem[]): string {
  const body = items.map((it) => shopItem(it, { category: (s) => HEUREKA_CATEGORY[s] ?? '' })).join('\n');
  return `<?xml version="1.0" encoding="utf-8"?>\n<SHOP>\n${body}\n</SHOP>\n`;
}

export function buildZboziXml(items: FeedItem[]): string {
  // Zboží uses your own shop category text, not Heureka's tree.
  const body = items
    .map((it) =>
      shopItem(it, { category: () => [it.categoryTitle, it.subcategory].filter(Boolean).join(' | ') }),
    )
    .join('\n');
  return `<?xml version="1.0" encoding="utf-8"?>\n<SHOP xmlns="http://www.zbozi.cz/ns/offer/1.0">\n${body}\n</SHOP>\n`;
}

/* ── Google Merchant (RSS 2.0) ───────────────────────────────────────── */

function gTag(tag: string, value?: string | number): string {
  if (value === undefined || value === null || value === '') return '';
  return `      <g:${tag}>${xml(value)}</g:${tag}>\n`;
}

function googleItem(it: FeedItem): string {
  const extraImgs = it.images
    .slice(1, 11)
    .map((u) => `      <g:additional_image_link>${xml(u)}</g:additional_image_link>`)
    .join('\n');

  const productType = [it.categoryTitle, it.subcategory].filter(Boolean).join(' > ');

  return `    <item>
${gTag('id', it.id)}${gTag('item_group_id', it.groupId)}${gTag('title', it.fullName)}${gTag('description', it.description)}${gTag('link', it.url)}      <g:image_link>${xml(it.images[0])}</g:image_link>
${extraImgs ? extraImgs + '\n' : ''}${gTag('availability', 'in_stock')}${gTag('condition', 'new')}      <g:price>${it.regularCzk} ${CURRENCY}</g:price>
${it.onSale ? `      <g:sale_price>${it.priceCzk} ${CURRENCY}</g:sale_price>\n` : ''}${gTag('brand', it.brand)}${gTag('mpn', it.id)}${gTag('google_product_category', GOOGLE_CATEGORY[it.categorySlug])}${gTag('product_type', productType)}${gTag('color', it.color)}${gTag('size', it.size)}${gTag('shipping_weight', it.weightKg ? `${it.weightKg} kg` : undefined)}      <g:shipping>
        <g:country>CZ</g:country>
        <g:service>PPL</g:service>
        <g:price>${SHIPPING[0].price}.00 ${CURRENCY}</g:price>
      </g:shipping>
    </item>`;
}

export function buildGoogleXml(items: FeedItem[]): string {
  const body = items.map(googleItem).join('\n');
  return `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Ciaobag</title>
    <link>${xml(BASE)}</link>
    <description>Produktový feed Ciaobag</description>
${body}
  </channel>
</rss>
`;
}

/* ── Registry used by the route handler ──────────────────────────────── */

export const FEED_BUILDERS: Record<string, (items: FeedItem[]) => string> = {
  'heureka.xml': buildHeurekaXml,
  'zbozi.xml': buildZboziXml,
  'google.xml': buildGoogleXml,
};
