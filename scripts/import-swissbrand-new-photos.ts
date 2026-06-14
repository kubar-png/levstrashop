/**
 * Import the new AI product photos from
 *   ~/Desktop/Levstra Product Photo/01_Hotové AI fotky/
 *
 * Two parts:
 *   A) Patch EXISTING Swissbrand Riga products in Sanity:
 *        - Riga Velký  → add new "Šarlatová" colour variant   (L/šarlatová, 5 photos)
 *        - Riga Set 3  → add new "Stříbrná" colour variant     (SET/stříbrná, 1 set photo)
 *        - Riga Set 3  → add the new blue set photo to the existing "Nebesky modrá" variant
 *      Prices match the existing Sanity siblings (NOT the wholesale table — the new
 *      site is priced lower/independently).
 *   B) CREATE 4 new Swissbrand Brunei products (Brunei is a distinct shell design),
 *      mirroring Riga's one-product-per-size structure:
 *        - Brunei Malý (S)    → Stříbrná
 *        - Brunei Střední (M) → Stříbrná
 *        - Brunei Velký (L)   → Stříbrná + Černá
 *        - Brunei Set 3       → Černá
 *      Brunei prices use the company catalog (HSD_vyběr_kufry.xlsx): 2590 / 3590 / 4190 / 9399.
 *
 *   npx tsx scripts/import-swissbrand-new-photos.ts            # DRY RUN (default)
 *   npx tsx scripts/import-swissbrand-new-photos.ts --live     # upload + write (publishes)
 *
 * Re-runnable: Sanity dedupes assets by content hash; Brunei docs use stable _ids
 * (createOrReplace); Riga variant additions are guarded (skip if the colour already exists).
 */

import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

if (fs.existsSync('.env.local.sanity')) dotenv.config({ path: '.env.local.sanity', override: false });
dotenv.config({ path: '.env.local', override: false });
dotenv.config({ path: '.env', override: false });

const live = process.argv.includes('--live');
const NEW_ROOT = `${process.env.HOME}/Desktop/Levstra Product Photo/01_Hotové AI fotky`;
const RIGA_DIR = path.join(NEW_ROOT, 'Swissbrand Riga (SWRIG)');
const BRUNEI_DIR = path.join(NEW_ROOT, 'Swissbrand Brunei (SWBRU)');
const KUFRY_CATEGORY_ID = '7bcbfc20-b77b-4b75-bee0-a94ed1a0c85a';

const RIGA_VELKY_ID = '92e33803-b8db-4394-83bd-6e4f3243cbb5';
const RIGA_SET3_ID = 'riga-set3-modra';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId) { console.error('❌ Missing NEXT_PUBLIC_SANITY_PROJECT_ID'); process.exit(1); }
if (!token && live) { console.error('❌ Missing SANITY_API_WRITE_TOKEN (required for --live)'); process.exit(1); }
const client = createClient({ projectId, dataset, token, apiVersion: '2025-01-01', useCdn: false });

/* ─── Filesystem helpers ──────────────────────────────────────────────── */

const IMG_RE = /\.(jpe?g|png|webp)$/i;
const CONTENT_TYPE: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
};
const assetNum = (f: string): number | null => { const m = f.match(/asset-(\d+)/i); return m ? Number(m[1]) : null; };

/**
 * Arcads "Project 2" template angle → asset number:
 *   16 = front (w/ logo) · 15 = back · 12 = TSA lock · 11 = wheel · 10 = open interior.
 * A non-asset (UUID / "… set 3") file is a hero shot (3/4 standing single, or 3-piece
 * family shot) and always sorts first. Gallery order: hero, front, back, lock, wheel, open.
 */
function heroRank(file: string): number {
  const n = assetNum(path.basename(file));
  if (n == null) return 0;          // UUID / named hero shot
  if (n === 16) return 1;           // front, with logo
  if (n === 15) return 2;           // back
  if (n === 12) return 3;           // TSA lock detail
  if (n === 11) return 4;           // wheel detail
  if (n === 10) return 5;           // open interior
  return 6 + n;
}
function listImages(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => IMG_RE.test(f) && !f.startsWith('.'));
  files.sort((a, b) => heroRank(a) - heroRank(b) || a.localeCompare(b, 'cs', { numeric: true }));
  return files.map((f) => path.join(dir, f));
}

const assetCache = new Map<string, string>();
async function uploadImage(filePath: string): Promise<string> {
  if (assetCache.has(filePath)) return assetCache.get(filePath)!;
  const ext = path.extname(filePath).toLowerCase();
  const asset = await client.assets.upload('image', fs.readFileSync(filePath), {
    filename: path.basename(filePath), contentType: CONTENT_TYPE[ext] ?? 'image/png',
  });
  assetCache.set(filePath, asset._id);
  return asset._id;
}
const imageObjects = (ids: string[], alt: string, prefix: string) =>
  ids.map((ref, i) => ({ _type: 'image', _key: `${prefix}-${i}`, asset: { _type: 'reference', _ref: ref }, alt }));
async function uploadAll(files: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const f of files) ids.push(await uploadImage(f));
  return ids;
}

const block = (key: string, text: string) => ({
  _type: 'block', _key: key, style: 'normal', markDefs: [],
  children: [{ _type: 'span', _key: `${key}s`, text, marks: [] }],
});
const norm = (s?: string) => (s ?? '').normalize('NFC').toLowerCase().trim();

/* ─── Colours / dimensions (shared Swissbrand shell sizes) ────────────── */

const HEX = { stribrna: '#EEEEEE', cerna: '#000000', sarlatova: '#CE1B2C', sky: '#5a9bd4' };
const DIMS = {
  S:   { weightGrams: 2800,  lengthCm: 55, widthCm: 38, heightCm: 21.5 },
  M:   { weightGrams: 3700,  lengthCm: 68, widthCm: 45, heightCm: 27 },
  L:   { weightGrams: 4500,  lengthCm: 78, widthCm: 51, heightCm: 32 },
  SET: { weightGrams: 11000, lengthCm: 78, widthCm: 51, heightCm: 32 },
};

/* ─── PART A: patch existing Riga products ────────────────────────────── */

type VInfo = { _key: string; color?: string };

async function addRigaVariant(opts: {
  productId: string; label: string; dir: string; color: string; colorHex: string;
  sku: string; price: number; stock: number; dims: typeof DIMS[keyof typeof DIMS]; vkey: string;
}) {
  const files = listImages(opts.dir);
  if (files.length === 0) { console.log(`  ⚠ ${opts.label}: no photos in ${opts.dir} — skipped`); return; }

  const prod = await client.fetch<{ variants: VInfo[] } | null>(
    `*[_id==$id][0]{ "variants": variants[]{_key, color} }`, { id: opts.productId });
  if (!prod) { console.log(`  ⚠ ${opts.label}: product ${opts.productId} not found — skipped`); return; }

  const existing = prod.variants?.find((v) => norm(v.color) === norm(opts.color));
  console.log(`  ■ ${opts.label} — ${opts.color} (sku ${opts.sku}) · ${opts.price} Kč · ${files.length} photo(s) · hero: ${path.basename(files[0])}`);
  console.log(`      order: ${files.map((f) => path.basename(f)).join(' | ')}`);
  if (existing) { console.log(`      ↺ variant "${opts.color}" already exists (key ${existing._key}) — will refresh its images`); }

  if (!live) { console.log(`      — would ${existing ? 'set images on' : 'insert'} variant\n`); return; }

  const ids = await uploadAll(files);
  const imgs = imageObjects(ids, `${opts.label} – ${opts.color}`, `vimg-${opts.vkey}`);
  if (existing) {
    await client.patch(opts.productId).set({ [`variants[_key=="${existing._key}"].images`]: imgs }).commit();
  } else {
    const variant = {
      _type: 'variant', _key: opts.vkey, sku: opts.sku, color: opts.color, colorHex: opts.colorHex,
      price: opts.price, stock: opts.stock, ...opts.dims, images: imgs,
    };
    await client.patch(opts.productId).insert('after', 'variants[-1]', [variant]).commit();
  }
  console.log(`      ✅ written\n`);
}

async function addPhotoToRigaSetBlue() {
  // Add the new high-res blue 3-piece family shot to Set 3 / Nebesky modrá and promote it
  // to the product hero (best catalog card image).
  const dir = path.join(RIGA_DIR, 'SET', 'nebesky modrá');
  const files = listImages(dir);
  if (files.length === 0) { console.log('  ⚠ Riga Set 3 / Nebesky modrá: no new photo — skipped'); return; }

  const prod = await client.fetch<{ variants: { _key: string; color?: string; images?: unknown[] }[] } | null>(
    `*[_id==$id][0]{ "variants": variants[]{_key, color, images} }`, { id: RIGA_SET3_ID });
  const v = prod?.variants?.find((x) => norm(x.color) === norm('Nebesky modrá'));
  if (!v) { console.log('  ⚠ Riga Set 3: no "Nebesky modrá" variant — skipped'); return; }

  console.log(`  ■ Riga Set 3 / Nebesky modrá — prepend new set photo (hero): ${path.basename(files[0])}`);
  if (!live) { console.log(`      — would prepend ${files.length} photo + set product hero\n`); return; }

  const ids = await uploadAll(files);
  const newImgs = imageObjects(ids, 'Swissbrand Riga Set 3 – Nebesky modrá', 'vimg-v-modra-set');
  const existingImgs = (v.images ?? []) as Record<string, unknown>[];
  const merged = [...newImgs, ...existingImgs];
  await client.patch(RIGA_SET3_ID).set({
    [`variants[_key=="${v._key}"].images`]: merged,
    images: imageObjects(ids, 'Swissbrand Riga Set 3', 'img'),
  }).commit();
  console.log(`      ✅ written\n`);
}

/* ─── PART B: create Brunei products ──────────────────────────────────── */

const BRUNEI_INTRO =
  'Skořepinový kufr z řady Swissbrand Brunei. Pevná a lehká ABS skořepina s výrazným ' +
  'horizontálním a geometrickým reliéfem, 4 dvojitá otočná kolečka (360°), výsuvné ' +
  'teleskopické madlo a integrovaný TSA kódový zámek. Uvnitř plně textilní podšívka, ' +
  'rozdělení přepážkou na zip a popruhy k fixaci věcí.';

type BVariant = { color: string; colorHex: string; sku: string; subdir: string };
type BDef = {
  _id: string; slug: string; title: string; sizeDir: string; dims: typeof DIMS[keyof typeof DIMS];
  colorGroup: string; heroColor: string; price: number; stock: number; short: string; specs: string;
  variants: BVariant[];
};

const BRUNEI: BDef[] = [
  {
    _id: 'brunei-maly-stribrna', slug: 'swissbrand-brunei-maly', title: 'Swissbrand Brunei Malý',
    sizeDir: 'S', dims: DIMS.S, colorGroup: 'bruneiS', heroColor: 'Stříbrná', price: 2590, stock: 5,
    short: 'Palubní skořepinový kufr Swissbrand Brunei — kabinová velikost s pevnou ABS skořepinou, TSA zámkem a 4 otočnými kolečky.',
    specs: 'Velikost: palubní (kabinová) · Rozměry: 55 × 38 × 21,5 cm · Objem: ~43 l · Hmotnost: 2,8 kg · Materiál: ABS / podšívka polyester · TSA kódový zámek.',
    variants: [{ color: 'Stříbrná', colorHex: HEX.stribrna, sku: '600', subdir: 'stříbrná' }],
  },
  {
    _id: 'brunei-stredni-stribrna', slug: 'swissbrand-brunei-stredni', title: 'Swissbrand Brunei Střední',
    sizeDir: 'M', dims: DIMS.M, colorGroup: 'bruneiM', heroColor: 'Stříbrná', price: 3590, stock: 5,
    short: 'Střední skořepinový kufr Swissbrand Brunei — pevná ABS skořepina, TSA zámek, 4 dvojitá otočná kolečka.',
    specs: 'Velikost: střední · Rozměry: 68 × 45 × 27 cm · Objem: ~69 l · Hmotnost: 3,7 kg · Materiál: ABS / podšívka polyester · TSA kódový zámek.',
    variants: [{ color: 'Stříbrná', colorHex: HEX.stribrna, sku: '610', subdir: 'stříbrná' }],
  },
  {
    _id: 'brunei-velky', slug: 'swissbrand-brunei-velky', title: 'Swissbrand Brunei Velký',
    sizeDir: 'L', dims: DIMS.L, colorGroup: 'bruneiL', heroColor: 'Černá', price: 4190, stock: 5,
    short: 'Velký skořepinový kufr Swissbrand Brunei — pevná ABS skořepina, TSA zámek, 4 dvojitá otočná kolečka.',
    specs: 'Velikost: velký · Rozměry: 78 × 51 × 32 cm · Objem: ~104 l · Hmotnost: 4,5 kg · Materiál: ABS / podšívka polyester · TSA kódový zámek.',
    variants: [
      { color: 'Černá', colorHex: HEX.cerna, sku: '621', subdir: 'černá' },
      { color: 'Stříbrná', colorHex: HEX.stribrna, sku: '620', subdir: 'stříbrná' },
    ],
  },
  {
    _id: 'brunei-set3-cerna', slug: 'swissbrand-brunei-set-3', title: 'Swissbrand Brunei Set 3',
    sizeDir: 'SET', dims: DIMS.SET, colorGroup: 'bruneiSet', heroColor: 'Černá', price: 9399, stock: 5,
    short: 'Set 3 skořepinových kufrů Swissbrand Brunei (S/M/L) — pevná ABS skořepina, TSA zámek, 4 dvojitá otočná kolečka.',
    specs: 'Set 3 kufrů (palubní S + střední M + velký L) · Rozměry: S 55×38×21,5 cm / M 68×45×27 cm / L 78×51×32 cm · Materiál: ABS / podšívka polyester · TSA kódový zámek u všech kufrů.',
    variants: [{ color: 'Černá', colorHex: HEX.cerna, sku: '630', subdir: 'černá' }],
  },
];

async function createBrunei(d: BDef) {
  console.log(`  ■ ${d.title}  (slug: ${d.slug}, hero: ${d.heroColor}) · ${d.price} Kč`);
  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type=="product" && slug.current==$s][0]{_id}`, { s: d.slug });
  if (existing && existing._id !== d._id) console.log(`      ℹ slug exists as ${existing._id} (will be replaced by ${d._id})`);

  const builtVariants: Record<string, unknown>[] = [];
  let heroImgObjs: ReturnType<typeof imageObjects> = [];

  for (const v of d.variants) {
    const dir = path.join(BRUNEI_DIR, d.sizeDir, v.subdir);
    const files = listImages(dir);
    const vkey = `v-${norm(v.color).replace(/[^a-z0-9]/g, '')}`;
    console.log(`      - ${v.color} (sku ${v.sku}) · ${files.length} photo(s) · hero: ${files[0] ? path.basename(files[0]) : '— NONE'}`);
    if (files.length) console.log(`          order: ${files.map((f) => path.basename(f)).join(' | ')}`);

    let imgs: ReturnType<typeof imageObjects> = [];
    if (live && files.length) {
      const ids = await uploadAll(files);
      imgs = imageObjects(ids, `${d.title} – ${v.color}`, `vimg-${vkey}`);
    }
    builtVariants.push({
      _type: 'variant', _key: vkey, sku: v.sku, color: v.color, colorHex: v.colorHex,
      price: d.price, stock: d.stock, ...d.dims, ...(imgs.length ? { images: imgs } : {}),
    });
    if (norm(v.color) === norm(d.heroColor) && imgs.length) heroImgObjs = imgs;
  }
  // Fallback hero = first variant that produced images.
  if (live && !heroImgObjs.length) {
    const firstWithImgs = builtVariants.find((v) => Array.isArray((v as { images?: unknown[] }).images));
    if (firstWithImgs) heroImgObjs = (firstWithImgs as { images: ReturnType<typeof imageObjects> }).images;
  }

  if (!live) { console.log(`      — would createOrReplace with ${d.variants.length} variant(s)\n`); return; }

  const doc = {
    _id: d._id, _type: 'product', title: d.title,
    slug: { _type: 'slug', current: d.slug },
    category: { _type: 'reference', _ref: KUFRY_CATEGORY_ID },
    shortDescription: d.short,
    description: [block('d0', BRUNEI_INTRO), block('d1', d.specs)],
    images: heroImgObjs.length
      ? imageObjects(heroImgObjs.map((i) => i.asset._ref), d.title, 'img')
      : [],
    variants: builtVariants,
    featured: false,
    colorGroup: d.colorGroup,
    colorHex: d.variants.find((v) => norm(v.color) === norm(d.heroColor))?.colorHex,
    heroColor: d.heroColor,
    active: true,
  };
  await client.createOrReplace(doc);
  console.log(`      ✅ created & published\n`);
}

/* ─── Main ────────────────────────────────────────────────────────────── */

async function main() {
  console.log(`Mode: ${live ? 'LIVE WRITE (publishes)' : 'DRY RUN'}`);
  console.log(`Source: ${NEW_ROOT}\n`);
  if (!fs.existsSync(NEW_ROOT)) { console.error('❌ Photo root not found:', NEW_ROOT); process.exit(1); }

  console.log('── PART A: add new Riga colour variants ───────────────────');
  await addRigaVariant({
    productId: RIGA_VELKY_ID, label: 'Riga Velký', dir: path.join(RIGA_DIR, 'L', 'šarlatová'),
    color: 'Červená', colorHex: HEX.sarlatova, sku: '102', price: 2999, stock: 5, dims: DIMS.L, vkey: 'v-cervena',
  });
  await addRigaVariant({
    productId: RIGA_SET3_ID, label: 'Riga Set 3', dir: path.join(RIGA_DIR, 'SET', 'stříbrná'),
    color: 'Stříbrná', colorHex: HEX.stribrna, sku: '401', price: 7519, stock: 5, dims: DIMS.SET, vkey: 'v-stribrna-set',
  });
  await addPhotoToRigaSetBlue();

  console.log('── PART B: create Brunei products ─────────────────────────');
  for (const d of BRUNEI) await createBrunei(d);

  console.log('────────────────────────────────');
  console.log(live ? '✅ Done — published to Sanity.' : 'DRY RUN — nothing written. Re-run with --live to publish.');
}

main().catch((e) => { console.error('\n❌ Failed:', e); process.exit(1); });
