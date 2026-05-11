/**
 * Mock catalogue used when Sanity is not yet configured.
 * Images are sourced from the live Wix CDN so the storefront looks real.
 */

import type { ProductView, ProductSummaryView, CategoryView } from './data';

const WIX = 'https://static.wixstatic.com/media/f0cf6b_';
const IMG = {
  rigaOrange: `${WIX}510434021b004f2abcfcc53a3a965203~mv2.jpg`,        // orange + graffiti
  rigaOrange2: `${WIX}59b0236fe6ae4dd39ea9700a093c14e4~mv2.jpg`,       // orange closeup
  rigaPink: `${WIX}3ce5a12e7ebe4524a196ef34a03d1e59~mv2.jpg`,          // pink + cobblestone
  rigaPink2: `${WIX}dc69d4ff1b334f15866d84d2765dcf37~mv2.jpg`,         // pink + mural
  rigaYellow: `${WIX}bf81f093a9fd46868b51b007255b8030~mv2.jpg`,        // yellow + city
  modelBlonde: `${WIX}0fb65fabc4d54b149a2b6213e5153e9e~mv2.jpg`,       // blonde + white bag
  modelPalms: `${WIX}29b8ee8366484656828782c7267140df~mv2.jpg`,        // off-shoulder + palms
  modelItalian: `${WIX}8a21028ccb924868a7824d820313a55c~mv2.jpg`,      // italian street + white bag
  modelPink: `${WIX}962f00502d2a46f5b535c2d1fbe3095e~mv2.jpg`,         // pink dress + white bag
  modelPromenade: `${WIX}447c2054b701497e93bbfa703008a619~mv2.jpg`,    // promenade + small bag
  closeupHand: `${WIX}e8a295dffa64400a9a72b4d9c064f98a~mv2.jpg`,       // hand + white bag
};

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
    imageUrls: [IMG.rigaOrange, IMG.rigaOrange2],
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
    imageUrls: [IMG.rigaPink, IMG.rigaPink2],
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
    _id: 'p-riga-yellow',
    title: 'Riga Yellow',
    slug: 'riga-yellow',
    shortDescription: 'Slunečně žlutý kufr, který nepřehlédnete na žádném pásu.',
    descriptionText: KUFR_DESC,
    imageUrls: [IMG.rigaYellow],
    placeholder: { kind: 'suitcase', color: '#f0c742', accent: '#5a4a1f' },
    category: { title: 'Kufry', slug: 'kufry' },
    variants: [
      { sku: 'RIGA-YL-55', size: 'cabin-55', color: 'žlutá', priceCents: 279000, stock: 5, weightGrams: 2800 },
      { sku: 'RIGA-YL-65', size: 'medium-65', color: 'žlutá', priceCents: 349000, stock: 4, weightGrams: 3400 },
    ],
    featured: false,
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

  // ── KABELKY ──────────────────────────────────────────────────────────
  {
    _id: 'p-nikol',
    title: 'Marina Galanti Nikol',
    slug: 'marina-galanti-nikol',
    shortDescription: 'Elegantní kabelka z měkké eko-kůže.',
    descriptionText: KABELKA_DESC,
    imageUrls: [IMG.modelBlonde, IMG.closeupHand],
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
    imageUrls: [IMG.modelItalian],
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
    imageUrls: [IMG.modelPink],
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
    imageUrls: [IMG.modelPalms, IMG.modelPromenade],
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
