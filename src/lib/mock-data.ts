/**
 * Mock catalogue used when Sanity is not yet configured.
 * Same shape as the view types in src/lib/data.ts so pages don't care
 * whether content came from Sanity or here.
 *
 * Prices in haléře (smallest CZK unit) — 1 Kč = 100 haléře.
 */

import type { ProductView, ProductSummaryView, CategoryView } from './data';

const KUFR_DESC =
  'Kufr z odolného polykarbonátu s tichými dvojkolečky a TSA zámkem. ' +
  'Lehká skořepina, ergonomická rukojeť, vnitřní organizace s popruhy a síťovanou kapsou.';

const KABELKA_DESC =
  'Kabelka z měkké eko-kůže s magnetickým zapínáním. Vnitřní organizér, ' +
  'odepínací popruh přes rameno, klasický střih, který nezestárne.';

export const mockCategories: CategoryView[] = [
  { _id: 'cat-kabelky', title: 'Kabelky', slug: 'kabelky', description: 'Kabelky Marina Galanti pro každý den i pro výjimečné chvíle.' },
  { _id: 'cat-kufry', title: 'Kufry', slug: 'kufry', description: 'Cestovní zavazadla pro letiště i víkendové výlety.' },
];

export const mockProducts: ProductView[] = [
  // ── KUFRY ────────────────────────────────────────────────────────────
  {
    _id: 'p-riga-orange',
    title: 'Riga Orange',
    slug: 'riga-orange',
    shortDescription: 'Lehký polykarbonátový kufr v sytě oranžové barvě.',
    descriptionText: KUFR_DESC,
    imageUrls: [],
    placeholder: { kind: 'suitcase', color: '#e07a3a', accent: '#3d2418' },
    category: { title: 'Kufry', slug: 'kufry' },
    variants: [
      { sku: 'RIGA-OR-55', size: 'cabin-55', color: 'oranžová', priceCents: 279000, stock: 8, weightGrams: 2800 },
      { sku: 'RIGA-OR-65', size: 'medium-65', color: 'oranžová', priceCents: 349000, stock: 5, weightGrams: 3400 },
      { sku: 'RIGA-OR-75', size: 'large-75', color: 'oranžová', priceCents: 419000, stock: 3, weightGrams: 4100 },
    ],
    featured: true,
  },
  {
    _id: 'p-riga-pink',
    title: 'Riga Pink',
    slug: 'riga-pink',
    shortDescription: 'Stejný oblíbený model v jemném pudrově růžovém odstínu.',
    descriptionText: KUFR_DESC,
    imageUrls: [],
    placeholder: { kind: 'suitcase', color: '#e2a3b0', accent: '#5a2a3d' },
    category: { title: 'Kufry', slug: 'kufry' },
    variants: [
      { sku: 'RIGA-PK-55', size: 'cabin-55', color: 'růžová', priceCents: 279000, stock: 6, weightGrams: 2800 },
      { sku: 'RIGA-PK-65', size: 'medium-65', color: 'růžová', priceCents: 349000, stock: 4, weightGrams: 3400 },
      { sku: 'RIGA-PK-75', size: 'large-75', color: 'růžová', priceCents: 419000, stock: 2, weightGrams: 4100 },
    ],
    featured: true,
  },
  {
    _id: 'p-riga-navy',
    title: 'Riga Navy',
    slug: 'riga-navy',
    shortDescription: 'Tmavě modrá varianta — nestárnoucí klasika pro služební cesty.',
    descriptionText: KUFR_DESC,
    imageUrls: [],
    placeholder: { kind: 'suitcase', color: '#26344d', accent: '#0e1828' },
    category: { title: 'Kufry', slug: 'kufry' },
    variants: [
      { sku: 'RIGA-NV-55', size: 'cabin-55', color: 'tmavě modrá', priceCents: 279000, stock: 10, weightGrams: 2800 },
      { sku: 'RIGA-NV-65', size: 'medium-65', color: 'tmavě modrá', priceCents: 349000, stock: 7, weightGrams: 3400 },
      { sku: 'RIGA-NV-75', size: 'large-75', color: 'tmavě modrá', priceCents: 419000, stock: 4, weightGrams: 4100 },
    ],
    featured: false,
  },
  {
    _id: 'p-riga-cream',
    title: 'Riga Cream',
    slug: 'riga-cream',
    shortDescription: 'Krémově béžová Riga — jemná, ale špínu drží lépe, než byste čekali.',
    descriptionText: KUFR_DESC,
    imageUrls: [],
    placeholder: { kind: 'suitcase', color: '#e9d8c0', accent: '#7a5c40' },
    category: { title: 'Kufry', slug: 'kufry' },
    variants: [
      { sku: 'RIGA-CR-55', size: 'cabin-55', color: 'krémová', priceCents: 279000, stock: 9, weightGrams: 2800 },
      { sku: 'RIGA-CR-65', size: 'medium-65', color: 'krémová', priceCents: 349000, stock: 6, weightGrams: 3400 },
      { sku: 'RIGA-CR-75', size: 'large-75', color: 'krémová', priceCents: 419000, stock: 3, weightGrams: 4100 },
    ],
    featured: true,
  },

  // ── KABELKY ──────────────────────────────────────────────────────────
  {
    _id: 'p-nikol',
    title: 'Marina Galanti Nikol',
    slug: 'marina-galanti-nikol',
    shortDescription: 'Elegantní kabelka z měkké eko-kůže.',
    descriptionText: KABELKA_DESC,
    imageUrls: [],
    placeholder: { kind: 'handbag', color: '#3a2820', accent: '#d6a86a' },
    category: { title: 'Kabelky', slug: 'kabelky' },
    variants: [
      { sku: 'NIKOL-BK', color: 'černá', size: 'one-size', priceCents: 229000, stock: 12, weightGrams: 850 },
      { sku: 'NIKOL-BG', color: 'béžová', size: 'one-size', priceCents: 229000, stock: 8, weightGrams: 850 },
      { sku: 'NIKOL-BR', color: 'hnědá', size: 'one-size', priceCents: 229000, stock: 6, weightGrams: 850 },
    ],
    featured: true,
  },
  {
    _id: 'p-sofia',
    title: 'Marina Galanti Sofia',
    slug: 'marina-galanti-sofia',
    shortDescription: 'Měkká hobo kabelka s minimalistickým designem.',
    descriptionText: KABELKA_DESC,
    imageUrls: [],
    placeholder: { kind: 'handbag', color: '#a3825e', accent: '#3d2418' },
    category: { title: 'Kabelky', slug: 'kabelky' },
    variants: [
      { sku: 'SOFIA-BK', color: 'černá', size: 'one-size', priceCents: 249000, stock: 10, weightGrams: 900 },
      { sku: 'SOFIA-CR', color: 'krémová', size: 'one-size', priceCents: 249000, stock: 7, weightGrams: 900 },
    ],
    featured: true,
  },
  {
    _id: 'p-elena',
    title: 'Marina Galanti Elena',
    slug: 'marina-galanti-elena',
    shortDescription: 'Strukturovaná satchel kabelka pro denní nošení.',
    descriptionText: KABELKA_DESC,
    imageUrls: [],
    placeholder: { kind: 'handbag', color: '#5a3a2a', accent: '#e0b888' },
    category: { title: 'Kabelky', slug: 'kabelky' },
    variants: [
      { sku: 'ELENA-BK', color: 'černá', size: 'one-size', priceCents: 269000, stock: 9, weightGrams: 1100 },
      { sku: 'ELENA-CO', color: 'koňaková', size: 'one-size', priceCents: 269000, stock: 5, weightGrams: 1100 },
    ],
    featured: false,
  },
  {
    _id: 'p-lara',
    title: 'Marina Galanti Lara',
    slug: 'marina-galanti-lara',
    shortDescription: 'Malá crossbody kabelka — minimalistický doplněk pro večer.',
    descriptionText: KABELKA_DESC,
    imageUrls: [],
    placeholder: { kind: 'handbag', color: '#222020', accent: '#c0c0c0' },
    category: { title: 'Kabelky', slug: 'kabelky' },
    variants: [
      { sku: 'LARA-BK', color: 'černá', size: 'one-size', priceCents: 189000, stock: 15, weightGrams: 480 },
      { sku: 'LARA-WH', color: 'bílá', size: 'one-size', priceCents: 189000, stock: 8, weightGrams: 480 },
    ],
    featured: true,
  },
];

export const mockSummaries: ProductSummaryView[] = mockProducts.map((p) => ({
  _id: p._id,
  title: p.title,
  slug: p.slug,
  shortDescription: p.shortDescription,
  imageUrl: p.imageUrls[0] ?? null,
  placeholder: p.placeholder,
  category: p.category,
  minPriceCents: Math.min(...p.variants.map((v) => v.priceCents)),
  totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
  featured: p.featured,
}));
