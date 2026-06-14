/**
 * Import Marina Galanti catalogue from XLSX into Sanity.
 *
 *   npx tsx scripts/import-mg.ts --file "/path/to/á moda-MG.xlsx" [--dry-run] [--limit N]
 *
 * Groups rows by SKU base (the part before "_color" or "-color") → one product
 * with N color variants. Generates a colored SVG handbag mockup per color and
 * uploads it as the variant's image. Idempotent by slug (re-running updates,
 * does not duplicate).
 */

import dotenv from 'dotenv';
import fs from 'node:fs';
// Prefer pulled Vercel env if local one is empty
if (fs.existsSync('.env.local.sanity')) dotenv.config({ path: '.env.local.sanity', override: false });
dotenv.config({ path: '.env.local', override: false });
import path from 'node:path';
import { createClient } from '@sanity/client';
import XLSX from 'xlsx';

type Row = {
  id: string;
  sku: string;
  title: string;
  active: boolean;
  mini: boolean;
  basePrice: number;
  price: number;
  stock: number;
  brand: string;
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  ean: string;
};

const args = process.argv.slice(2);
const arg = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const dryRun = args.includes('--dry-run');
const allRows = args.includes('--all'); // by default only MINI e-shop == 1
const filePath = arg('--file') || `${process.env.HOME}/Downloads/á moda-MG.xlsx`;
const limit = arg('--limit') ? parseInt(arg('--limit')!, 10) : Infinity;

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) {
  console.error('❌ Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local');
  process.exit(1);
}
if (!token && !dryRun) {
  console.error('❌ Missing SANITY_API_WRITE_TOKEN in .env.local (required for live write; use --dry-run to preview)');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2025-01-01',
  useCdn: false,
});

/* ─── Color map ────────────────────────────────────────────────────────── */

const COLOR_HEX: Record<string, string> = {
  black: '#1a1a1a',
  white: '#f5f3ef',
  offwhite: '#ece6dc',
  red: '#b13427',
  ruby: '#841d2a',
  wine: '#5a1e2a',
  nude: '#d4a17a',
  cuoio: '#8a5b39',
  beige: '#c8b696',
  brown: '#5a3a25',
  darkbrown: '#3d2515',
  blue: '#2b4d7a',
  navy: '#1a2a4d',
  lightblue: '#8ab8d4',
  ltblue: '#8ab8d4',
  turquoise: '#4ab3a8',
  green: '#3a6e3e',
  lime: '#b4d33a',
  olive: '#6b6e3a',
  salvia: '#8a9b7a',
  grey: '#6e6e6e',
  yellow: '#e8c245',
  senape: '#c4a23a',
  orange: '#d76a2c',
  fuxia: '#b8316a',
  pink: '#d896a8',
  camel: '#b8895a',
  carta: '#c4a47a',
  cipria: '#e8c4b8',
  taupe: '#9b8b78',
  stone: '#a59a8c',
  desert: '#c9ad7e',
  fango: '#7a6a55',
  lilac: '#b89fc4',
  peacock: '#1f5d6e',
  zucchero: '#e8d8c4',
};

const COLOR_LABEL_CS: Record<string, string> = {
  black: 'černá', white: 'bílá', offwhite: 'krémová', red: 'červená',
  ruby: 'rubínová', wine: 'vínová', nude: 'tělová', cuoio: 'koňaková',
  beige: 'béžová', brown: 'hnědá', darkbrown: 'tmavě hnědá', blue: 'modrá',
  navy: 'tmavě modrá', lightblue: 'světle modrá', ltblue: 'světle modrá',
  turquoise: 'tyrkysová', green: 'zelená', lime: 'limetková', olive: 'olivová',
  salvia: 'šalvějová', grey: 'šedá', yellow: 'žlutá', senape: 'hořčicová',
  orange: 'oranžová', fuxia: 'fuchsiová', pink: 'růžová', camel: 'velbloudí',
  carta: 'krémová', cipria: 'pudrová', taupe: 'šedohnědá',
  stone: 'kamenná', desert: 'pouštní', fango: 'bahnitá', lilac: 'lila',
  peacock: 'paví modrá', zucchero: 'cukrová',
};

function darken(hex: string, amt = 0.35): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.round((n >> 16) * (1 - amt)));
  const g = Math.max(0, Math.round(((n >> 8) & 255) * (1 - amt)));
  const b = Math.max(0, Math.round((n & 255) * (1 - amt)));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function svgHandbag(color: string): string {
  const stroke = darken(color, 0.45);
  const accent = darken(color, 0.25);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="#f5f3ef"/>
  <path d="M 280 290 Q 280 150, 400 150 Q 520 150, 520 290" stroke="${stroke}" stroke-width="24" fill="none" stroke-linecap="round"/>
  <path d="M 200 290 L 600 290 L 585 670 Q 585 725, 525 725 L 275 725 Q 215 725, 215 670 Z" fill="${color}" stroke="${stroke}" stroke-width="3"/>
  <path d="M 200 290 L 600 290 L 600 320 L 200 320 Z" fill="${accent}" opacity="0.4"/>
  <rect x="372" y="390" width="56" height="34" fill="${stroke}" rx="6"/>
  <line x1="215" y1="660" x2="585" y2="660" stroke="${stroke}" stroke-width="2" opacity="0.4"/>
  <circle cx="400" cy="407" r="4" fill="${color}"/>
</svg>`;
}

/* ─── Parse XLSX ───────────────────────────────────────────────────────── */

function parseRows(): Row[] {
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const all = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { range: 4, defval: '' });
  return all
    .map((r): Row | null => {
      const sku = String(r['Kód'] || '').trim();
      const title = String(r['Název'] || '').trim();
      if (!title) return null;
      return {
        id: String(r['ID'] || '').trim(),
        sku,
        title,
        active: String(r['Aktivní'] || '').trim() === 'Ano',
        mini: String(r['MINI e-shop'] || '').trim() === '1',
        basePrice: Number(r['Běžná cena']) || 0,
        price: Number(r['Cena']) || 0,
        stock: Math.max(0, Number(r['Zásoby na skladě']) || 0),
        brand: String(r['Výrobce'] || '').trim(),
        weightGrams: Number(r['Hmotnost']) || 0,
        lengthCm: Number(r['Délka']) || 0,
        widthCm: Number(r['Šířka']) || 0,
        heightCm: Number(r['Výška']) || 0,
        ean: String(r['EAN'] || '').trim(),
      };
    })
    .filter((r): r is Row => r !== null);
}

/* ─── Group rows by SKU base ──────────────────────────────────────────── */

type Group = {
  baseSku: string;
  rows: Array<Row & { colorKey: string | null }>;
};

function colorFromRow(r: Row): { key: string | null; rest: string } {
  // SKU can end with _color, -color, or have a "_color" / "-color" with space
  const m = r.sku.match(/^(.+?)[_-]([a-zA-Z][a-zA-Z\s]*)$/);
  if (!m) return { key: null, rest: r.sku };
  const key = m[2].toLowerCase().replace(/\s+/g, '');
  if (!(key in COLOR_HEX)) return { key: null, rest: r.sku };
  return { key, rest: m[1] };
}

function groupRows(rows: Row[]): Group[] {
  const map = new Map<string, Group>();
  const seenSku = new Set<string>();
  for (const r of rows) {
    if (r.sku && seenSku.has(r.sku)) continue; // dedupe exact SKU duplicates
    if (r.sku) seenSku.add(r.sku);
    const { key, rest } = colorFromRow(r);
    const base = rest || r.id || r.title;
    if (!map.has(base)) map.set(base, { baseSku: base, rows: [] });
    map.get(base)!.rows.push({ ...r, colorKey: key });
  }
  return [...map.values()];
}

/* ─── Title cleanup ───────────────────────────────────────────────────── */

const CS_COLOR_WORDS = [
  'černá', 'černý', 'černé', 'bílá', 'bílý', 'bílé', 'červená', 'červený', 'červené',
  'modrá', 'modrý', 'modré', 'hnědá', 'hnědý', 'hnědé', 'tělová', 'tělový',
  'zelená', 'zelený', 'žlutá', 'žlutý', 'šedá', 'šedý', 'béžová', 'béžový',
  'růžová', 'oranžová', 'oranžový', 'tyrkysová', 'olivová', 'rubínová', 'vínová',
  'světle modrá', 'tmavě modrá', 'tmavě hnědá', 'krémová', 'pudrová', 'hořčicová',
  'limetková', 'fuchsiová', 'velbloudí', 'šalvějová', 'šedohnědá',
];
const CS_COLOR_RE = new RegExp(`\\s*[-–—]\\s*(?:v\\s+)?(?:${CS_COLOR_WORDS.join('|')})\\s*$`, 'i');
const CS_COLOR_RE2 = new RegExp(`\\s+v\\s+(?:${CS_COLOR_WORDS.join('|')})\\s*$`, 'i');

function cleanTitle(title: string): string {
  let t = title.replace(CS_COLOR_RE, '').replace(CS_COLOR_RE2, '').trim();
  // strip trailing standalone color word
  for (const w of CS_COLOR_WORDS) {
    const re = new RegExp(`\\s+${w}\\s*$`, 'i');
    t = t.replace(re, '');
  }
  return t.trim();
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

/* ─── Asset upload (cached per color) ─────────────────────────────────── */

const svgCache = new Map<string, string>();

async function uploadSvgForColor(colorKey: string | null): Promise<string> {
  const hex = colorKey ? COLOR_HEX[colorKey] : '#9b8b78';
  const cacheKey = `svg:${hex}`;
  if (svgCache.has(cacheKey)) return svgCache.get(cacheKey)!;
  const svg = svgHandbag(hex);
  const buf = Buffer.from(svg, 'utf8');
  const filename = `handbag-${colorKey || 'default'}.svg`;
  const asset = await client.assets.upload('image', buf, { filename, contentType: 'image/svg+xml' });
  svgCache.set(cacheKey, asset._id);
  return asset._id;
}

/* ─── Build & upsert documents ────────────────────────────────────────── */

async function ensureCategory(): Promise<string> {
  const slug = 'kabelky';
  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type=="category" && slug.current==$slug][0]{_id}`,
    { slug },
  );
  if (existing) return existing._id;
  if (dryRun) return 'dry-run-category';
  const created = await client.create({
    _type: 'category',
    title: 'Kabelky',
    slug: { _type: 'slug', current: slug },
    description: 'Kabelky Marina Galanti pro každý den i pro výjimečné chvíle.',
  });
  return created._id;
}

async function upsertProduct(group: Group, categoryId: string) {
  const first = group.rows[0];
  const title = cleanTitle(first.title);
  const slug = slugify(`${title}-${group.baseSku}`);

  const variants = await Promise.all(
    group.rows.map(async (r, i) => {
      const hex = r.colorKey ? COLOR_HEX[r.colorKey] : undefined;
      const colorLabel = r.colorKey ? COLOR_LABEL_CS[r.colorKey] || r.colorKey : undefined;
      const svgRef = dryRun ? `dry-svg-${r.colorKey || 'default'}` : await uploadSvgForColor(r.colorKey);
      return {
        _type: 'variant',
        _key: `v-${i}`,
        sku: r.sku || `${group.baseSku}-${i}`,
        color: colorLabel,
        colorHex: hex,
        price: r.price,
        stock: r.stock,
        weightGrams: r.weightGrams || undefined,
        lengthCm: r.lengthCm || undefined,
        widthCm: r.widthCm || undefined,
        heightCm: r.heightCm || undefined,
        images: [
          {
            _type: 'image',
            _key: `vimg-${i}`,
            asset: { _type: 'reference', _ref: svgRef },
            alt: `${title}${colorLabel ? ' – ' + colorLabel : ''}`,
          },
        ],
      };
    }),
  );

  const heroSvgRef = dryRun ? `dry-svg-hero` : await uploadSvgForColor(group.rows[0].colorKey);

  const doc = {
    _type: 'product',
    title,
    slug: { _type: 'slug' as const, current: slug },
    category: { _type: 'reference' as const, _ref: categoryId },
    shortDescription: first.brand ? `${first.brand}` : undefined,
    images: [
      {
        _type: 'image',
        _key: 'img-0',
        asset: { _type: 'reference', _ref: heroSvgRef },
        alt: title,
      },
    ],
    variants,
    colorGroup: group.baseSku,
    active: group.rows.some((r) => r.active),
  };

  if (dryRun) return { _id: 'dry', slug, variantCount: variants.length };

  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type=="product" && slug.current==$slug][0]{_id}`,
    { slug },
  );
  if (existing) {
    await client.patch(existing._id).set(doc).commit();
    return { _id: existing._id, slug, variantCount: variants.length, updated: true };
  }
  const created = await client.create(doc);
  return { _id: created._id, slug, variantCount: variants.length, created: true };
}

/* ─── Main ────────────────────────────────────────────────────────────── */

async function main() {
  console.log(`▶ Reading ${filePath}`);
  if (!fs.existsSync(filePath)) {
    console.error('❌ File not found:', filePath);
    process.exit(1);
  }
  const allParsed = parseRows();
  const rows = allRows ? allParsed : allParsed.filter((r) => r.mini);
  console.log(`  Filter: ${allRows ? 'ALL rows' : 'only MINI e-shop = 1'} → ${rows.length}/${allParsed.length} rows`);
  const groups = groupRows(rows);
  const multi = groups.filter((g) => g.rows.length > 1);
  console.log(`  Rows: ${rows.length}`);
  console.log(`  Product groups: ${groups.length} (${multi.length} with 2+ color variants)`);
  const uniqueColors = new Set<string>();
  for (const g of groups) for (const r of g.rows) if (r.colorKey) uniqueColors.add(r.colorKey);
  console.log(`  Unique colors: ${uniqueColors.size}`);
  console.log(`  Mode: ${dryRun ? 'DRY RUN' : 'LIVE WRITE'}${limit !== Infinity ? `, limit ${limit}` : ''}`);

  if (dryRun) {
    console.log('\nSample groups:');
    for (const g of groups.slice(0, 5)) {
      console.log(`  ${g.baseSku}: ${cleanTitle(g.rows[0].title)}`);
      for (const r of g.rows) {
        console.log(`    └─ ${r.sku} | ${r.colorKey ?? '—'} | ${r.price} Kč | stock ${r.stock}`);
      }
    }
  }

  console.log(`\n▶ ${dryRun ? 'Would ensure' : 'Ensuring'} category "Kabelky"`);
  const categoryId = await ensureCategory();

  const slice = groups.slice(0, limit);
  let created = 0, updated = 0, errors = 0;
  for (let i = 0; i < slice.length; i++) {
    const g = slice[i];
    try {
      const res = await upsertProduct(g, categoryId);
      const tag = res.created ? '＋' : res.updated ? '↻' : '·';
      console.log(`  ${tag} [${i + 1}/${slice.length}] ${res.slug} (${res.variantCount} var)`);
      if (res.created) created++;
      if (res.updated) updated++;
    } catch (e) {
      errors++;
      console.error(`  ✗ [${i + 1}/${slice.length}] ${g.baseSku}: ${(e as Error).message}`);
    }
  }

  console.log(`\n✅ Done. created=${created} updated=${updated} errors=${errors}`);
}

main().catch((e) => {
  console.error('\n❌ Import failed:', e);
  process.exit(1);
});
