/**
 * Demo product catalogue for Levstra.
 *
 * Image URLs are sourced from the live Wix site (static.wixstatic.com).
 * The seed script downloads each image and uploads it as a Sanity asset.
 * Edit prices/descriptions/SKUs freely — these are reasonable defaults.
 */

export type SeedVariant = {
  sku: string;
  size?: string;
  color?: string;
  priceCents: number;
  stock: number;
  weightGrams?: number;
};

export type SeedProduct = {
  title: string;
  slug: string;
  category: 'kabelky' | 'kufry';
  shortDescription: string;
  description: string;
  imageUrls: string[];
  variants: SeedVariant[];
  featured?: boolean;
};

export const seedCategories = [
  {
    title: 'Kabelky',
    slug: 'kabelky',
    description: 'Kabelky Marina Galanti pro každý den i pro výjimečné chvíle.',
  },
  {
    title: 'Kufry',
    slug: 'kufry',
    description: 'Cestovní zavazadla a kufry pro letiště i víkendové výlety.',
  },
];

export const seedProducts: SeedProduct[] = [
  {
    title: 'Riga Orange',
    slug: 'riga-orange',
    category: 'kufry',
    shortDescription: 'Lehký polykarbonátový kufr v sytě oranžové barvě.',
    description:
      'Kufr Riga z odolného polykarbonátu s tichými dvojkolečky a TSA zámkem. ' +
      'Oranžová barva, kterou nepřehlédnete ani na rušném letišti.',
    imageUrls: [
      'https://static.wixstatic.com/media/f0cf6b_510434021b004f2abcfcc53a3a965203~mv2.jpg',
    ],
    featured: true,
    variants: [
      { sku: 'RIGA-OR-55', size: 'cabin-55', color: 'oranžová', priceCents: 279000, stock: 8, weightGrams: 2800 },
      { sku: 'RIGA-OR-65', size: 'medium-65', color: 'oranžová', priceCents: 349000, stock: 5, weightGrams: 3400 },
      { sku: 'RIGA-OR-75', size: 'large-75', color: 'oranžová', priceCents: 419000, stock: 3, weightGrams: 4100 },
    ],
  },
  {
    title: 'Riga Pink',
    slug: 'riga-pink',
    category: 'kufry',
    shortDescription: 'Stejný oblíbený model v jemném pudrově růžovém odstínu.',
    description:
      'Kufr Riga v pudrově růžové. Polykarbonátová skořepina, čtyři dvojkolečka ' +
      'a TSA zámek. Hodí se na víkend i na obchodní cestu.',
    imageUrls: [
      'https://static.wixstatic.com/media/f0cf6b_3ce5a12e7ebe4524a196ef34a03d1e59~mv2.jpg',
    ],
    featured: true,
    variants: [
      { sku: 'RIGA-PK-55', size: 'cabin-55', color: 'růžová', priceCents: 279000, stock: 6, weightGrams: 2800 },
      { sku: 'RIGA-PK-65', size: 'medium-65', color: 'růžová', priceCents: 349000, stock: 4, weightGrams: 3400 },
      { sku: 'RIGA-PK-75', size: 'large-75', color: 'růžová', priceCents: 419000, stock: 2, weightGrams: 4100 },
    ],
  },
  {
    title: 'Riga L',
    slug: 'riga-l',
    category: 'kufry',
    shortDescription: 'Velký cestovní kufr pro delší pobyty.',
    description:
      'Největší velikost z řady Riga. Objem 100 litrů pro dvoutýdenní cestu ' +
      'celé rodiny. Polykarbonát, TSA zámek, ergonomická rukojeť.',
    imageUrls: [
      'https://static.wixstatic.com/media/f0cf6b_a2f58ca3ee384710b7f681526a75f673~mv2.png',
    ],
    variants: [
      { sku: 'RIGA-L-BK', size: 'large-75', color: 'černá', priceCents: 419000, stock: 5, weightGrams: 4200 },
      { sku: 'RIGA-L-NV', size: 'large-75', color: 'tmavě modrá', priceCents: 419000, stock: 3, weightGrams: 4200 },
    ],
  },
  {
    title: 'Marina Galanti Nikol',
    slug: 'marina-galanti-nikol',
    category: 'kabelky',
    shortDescription: 'Elegantní kabelka z měkké eko-kůže.',
    description:
      'Kabelka Nikol — komfortní velikost přes rameno, magnetické zapínání, ' +
      'vnitřní organizér. Klasika, která sluší k tričku i ke kostýmku.',
    imageUrls: [
      'https://static.wixstatic.com/media/f0cf6b_eae5f5bd32ea4057a3e7c5dd47647233~mv2.png',
    ],
    featured: true,
    variants: [
      { sku: 'NIKOL-BK', color: 'černá', size: 'one-size', priceCents: 229000, stock: 12, weightGrams: 850 },
      { sku: 'NIKOL-BG', color: 'béžová', size: 'one-size', priceCents: 229000, stock: 8, weightGrams: 850 },
      { sku: 'NIKOL-BR', color: 'hnědá', size: 'one-size', priceCents: 229000, stock: 6, weightGrams: 850 },
    ],
  },
  {
    title: 'Marina Galanti Sofia',
    slug: 'marina-galanti-sofia',
    category: 'kabelky',
    shortDescription: 'Měkká hobo kabelka s minimalistickým designem.',
    description:
      'Hobo kabelka Sofia z prošívané eko-kůže. Jeden velký prostor, ' +
      'odolný spodní díl, krátký i odepínací dlouhý popruh.',
    imageUrls: [
      'https://static.wixstatic.com/media/f0cf6b_8a21028ccb924868a7824d820313a55c~mv2.jpg',
    ],
    featured: true,
    variants: [
      { sku: 'SOFIA-BK', color: 'černá', size: 'one-size', priceCents: 249000, stock: 10, weightGrams: 900 },
      { sku: 'SOFIA-CR', color: 'krémová', size: 'one-size', priceCents: 249000, stock: 7, weightGrams: 900 },
    ],
  },
  {
    title: 'Marina Galanti Elena',
    slug: 'marina-galanti-elena',
    category: 'kabelky',
    shortDescription: 'Strukturovaná satchel kabelka pro denní nošení.',
    description:
      'Strukturovaná Elena s hladkým povrchem a zlatým kováním. ' +
      'Dvě hlavní přihrádky na zip, ideální velikost pro notebook 13".',
    imageUrls: [
      'https://static.wixstatic.com/media/f0cf6b_962f00502d2a46f5b535c2d1fbe3095e~mv2.jpg',
    ],
    variants: [
      { sku: 'ELENA-BK', color: 'černá', size: 'one-size', priceCents: 269000, stock: 9, weightGrams: 1100 },
      { sku: 'ELENA-CO', color: 'koňaková', size: 'one-size', priceCents: 269000, stock: 5, weightGrams: 1100 },
    ],
  },
];
