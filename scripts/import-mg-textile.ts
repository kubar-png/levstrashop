/**
 * Create the "Palubní textilní kufr Marina Galanti - Economy" product in Sanity
 * with its three colour variants (modrá / černá / červená) from the photos on
 * the Desktop, plus description + price taken from the live eshop.levstra.cz.
 *
 *   npx tsx scripts/import-mg-textile.ts          # DRY RUN (default)
 *   npx tsx scripts/import-mg-textile.ts --live    # upload + create (publishes)
 *
 * Folder: ~/Desktop/Levstra product foto/Palubní textilní kufr Marina Galanti - Economy/
 *           {modrá,černá,červená}/<photo>.png
 */

import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

if (fs.existsSync('.env.local.sanity')) dotenv.config({ path: '.env.local.sanity', override: false });
dotenv.config({ path: '.env.local', override: false });
dotenv.config({ path: '.env', override: false });

const live = process.argv.includes('--live');
const ROOT = `${process.env.HOME}/Desktop/Levstra product foto/Palubní textilní kufr Marina Galanti - Economy`;

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId) { console.error('❌ Missing NEXT_PUBLIC_SANITY_PROJECT_ID'); process.exit(1); }
if (!token && live) { console.error('❌ Missing SANITY_API_WRITE_TOKEN (required for --live)'); process.exit(1); }
const client = createClient({ projectId, dataset, token, apiVersion: '2025-01-01', useCdn: false });

/* ─── Product definition (from eshop.levstra.cz) ──────────────────────── */

const PRODUCT_ID = 'mg-textile-cabin-economy';
const SLUG = 'palubni-textilni-kufr-marina-galanti-economy';
const TITLE = 'Palubní textilní kufr Marina Galanti - Economy';
const KUFRY_CATEGORY_ID = '7bcbfc20-b77b-4b75-bee0-a94ed1a0c85a';
const PRICE_CZK = 1299;        // live sale price (orig 1590)
const DEFAULT_STOCK = 5;       // ⚠ placeholder — adjust to real stock
const WEIGHT_G = 2100;         // 2,1 kg
const DIMS = { lengthCm: 53.5, widthCm: 37.5, heightCm: 17 };

const SHORT_DESC =
  'Palubní kufr italské rodinné značky Marina Galanti — díky svým rozměrům jej vezmete na palubu letadla.';
const DESC_PARAGRAPH =
  'Palubní kufr italské rodinné značky Marina Galanti. Díky svým rozměrům je možné jej vzít na palubu letadla. Kufr má dvojcestný zip pro snadné otevírání a výsuvné madlo pro snadnou manipulaci. Na víku najdeme 2 praktické kapsy na vnější straně a 1 uvnitř.';
const DESC_SPECS =
  'Materiál: nylon/polyester · Rozměry: 37,5 × 17 × 53,5 cm · Objem: 34 l · Hmotnost: 2,1 kg · TSA zámek, 2 kolečka, výsuvné madlo.';

// Folder colour → variant. Order = catalog/hero order (modrá first).
const COLORS = [
  { dir: 'modrá',   color: 'Modrá',   hex: '#25408f', sku: '500', key: 'v-modra',   front: 11 },
  { dir: 'černá',   color: 'Černá',   hex: '#1c1c1c', sku: '501', key: 'v-cerna',   front: 16 },
  { dir: 'červená', color: 'Červená', hex: '#b0282d', sku: '502', key: 'v-cervena', front: 18 },
];

/* ─── Filesystem helpers ──────────────────────────────────────────────── */

const IMG_RE = /\.(jpe?g|png|webp)$/i;
const CONTENT_TYPE: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const assetNum = (f: string): number | null => { const m = f.match(/asset-(\d+)/i); return m ? Number(m[1]) : null; };
function listImages(dir: string): string[] {
  const files = fs.readdirSync(dir).filter((f) => IMG_RE.test(f) && !f.startsWith('.'));
  files.sort((a, b) => {
    const na = assetNum(a), nb = assetNum(b);
    if (na != null && nb != null) return na - nb;
    if (na != null) return -1;
    if (nb != null) return 1;
    return a.localeCompare(b, 'cs', { numeric: true });
  });
  return files.map((f) => path.join(dir, f));
}
/** Move the chosen hero file (by asset number) to the front (3/4 shot). */
function moveFront(files: string[], front?: number): string[] {
  if (front == null) return files;
  const i = files.findIndex((f) => assetNum(path.basename(f)) === front);
  if (i > 0) { const c = files.slice(); c.unshift(c.splice(i, 1)[0]); return c; }
  return files;
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

const block = (key: string, text: string) => ({
  _type: 'block', _key: key, style: 'normal', markDefs: [],
  children: [{ _type: 'span', _key: `${key}s`, text, marks: [] }],
});

/* ─── Main ────────────────────────────────────────────────────────────── */

async function main() {
  console.log(`▶ ${TITLE}`);
  console.log(`  Mode: ${live ? 'LIVE WRITE (publishes)' : 'DRY RUN'}`);
  console.log(`  Price: ${PRICE_CZK} Kč · stock/variant: ${DEFAULT_STOCK} (placeholder) · weight: ${WEIGHT_G} g\n`);
  if (!fs.existsSync(ROOT)) { console.error('❌ Folder not found:', ROOT); process.exit(1); }

  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type=="product" && slug.current==$s][0]{_id}`, { s: SLUG },
  );
  if (existing) console.log(`ℹ Product with slug "${SLUG}" already exists (${existing._id}) — will be replaced.\n`);

  const variants: Record<string, unknown>[] = [];
  let heroIds: string[] | null = null;

  for (const c of COLORS) {
    const dir = path.join(ROOT, c.dir);
    if (!fs.existsSync(dir)) { console.log(`⚠ missing colour folder: ${c.dir}`); continue; }
    const files = moveFront(listImages(dir), c.front);
    console.log(`• ${c.color} (${c.sku}) — ${files.length} photo(s)  ·  hero: ${path.basename(files[0])}`);

    let imgs: ReturnType<typeof imageObjects> = [];
    if (live) {
      const ids: string[] = [];
      for (const f of files) ids.push(await uploadImage(f));
      imgs = imageObjects(ids, `${TITLE} – ${c.color}`, `vimg-${c.key}`);
      if (!heroIds || c.dir === 'modrá') heroIds = ids;
    }
    variants.push({
      _type: 'variant', _key: c.key, sku: c.sku, color: c.color, colorHex: c.hex,
      price: PRICE_CZK, stock: DEFAULT_STOCK, weightGrams: WEIGHT_G, ...DIMS,
      ...(imgs.length ? { images: imgs } : {}),
    });
  }

  const doc = {
    _id: PRODUCT_ID,
    _type: 'product',
    title: TITLE,
    slug: { _type: 'slug', current: SLUG },
    category: { _type: 'reference', _ref: KUFRY_CATEGORY_ID },
    subcategory: 'palubni',
    shortDescription: SHORT_DESC,
    description: [block('d0', DESC_PARAGRAPH), block('d1', DESC_SPECS)],
    ...(heroIds ? { images: imageObjects(heroIds, TITLE, 'img') } : {}),
    variants,
    featured: false,
    colorGroup: 'mg-economy-textile',
    colorHex: COLORS[0].hex,
    heroColor: 'Modrá',
    active: true,
  };

  if (!live) {
    console.log('\n— DRY RUN — would createOrReplace:');
    console.log(JSON.stringify({ ...doc, description: '[2 blocks]', images: heroIds ? '[hero]' : '[set on live]', variants: `${variants.length} variants` }, null, 2));
    console.log('\nNothing written.');
    return;
  }

  await client.createOrReplace(doc);
  console.log(`\n✅ Created & published: ${TITLE} (${variants.length} variants)`);
}

main().catch((e) => { console.error('\n❌ Failed:', e); process.exit(1); });
