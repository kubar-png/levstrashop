/**
 * Create the two missing Swissbrand Riga suitcases in Sanity:
 *   - "Swissbrand Riga Malý"  (cabin, silver)   from "Riga S silver"
 *   - "Swissbrand Riga Set 3" (3-piece, sky blue) from "Riga set 3 blue"
 *
 * Price + description taken from the live eshop.levstra.cz. Stock is a
 * placeholder (the live eshop only shows "SKLADEM", no exact count).
 *
 *   npx tsx scripts/import-riga-new.ts          # DRY RUN (default)
 *   npx tsx scripts/import-riga-new.ts --live    # upload + create (publishes)
 */

import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

if (fs.existsSync('.env.local.sanity')) dotenv.config({ path: '.env.local.sanity', override: false });
dotenv.config({ path: '.env.local', override: false });
dotenv.config({ path: '.env', override: false });

const live = process.argv.includes('--live');
const ROOT = `${process.env.HOME}/Desktop/Levstra product foto`;
const KUFRY_CATEGORY_ID = '7bcbfc20-b77b-4b75-bee0-a94ed1a0c85a';
const DEFAULT_STOCK = 10; // ⚠ placeholder — live eshop shows only "SKLADEM"

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId) { console.error('❌ Missing NEXT_PUBLIC_SANITY_PROJECT_ID'); process.exit(1); }
if (!token && live) { console.error('❌ Missing SANITY_API_WRITE_TOKEN (required for --live)'); process.exit(1); }
const client = createClient({ projectId, dataset, token, apiVersion: '2025-01-01', useCdn: false });

/* ─── Product definitions (from eshop.levstra.cz) ─────────────────────── */

const block = (key: string, text: string) => ({
  _type: 'block', _key: key, style: 'normal', markDefs: [],
  children: [{ _type: 'span', _key: `${key}s`, text, marks: [] }],
});

type Def = {
  _id: string; slug: string; title: string; folder: string; front?: number | string;
  subcategory?: string; colorGroup: string; heroColor: string;
  variant: {
    sku: string; color: string; colorHex: string; price: number;
    weightGrams: number; lengthCm: number; widthCm: number; heightCm: number; key: string;
  };
  shortDescription: string; descBlocks: { para: string; specs: string };
};

const DEFS: Def[] = [
  {
    _id: 'riga-maly-stribrna',
    slug: 'swissbrand-riga-maly',
    title: 'Swissbrand Riga Malý',
    folder: 'Riga S silver',
    front: 8,
    subcategory: 'palubni',
    colorGroup: 'rigaS',
    heroColor: 'Stříbrná',
    variant: { sku: '300', color: 'Stříbrná', colorHex: '#EEEEEE', price: 2072, weightGrams: 2800, lengthCm: 55, widthCm: 38, heightCm: 21.5, key: 'v-stribrna' },
    shortDescription: 'Palubní skořepinový kufr Swissbrand Riga — kabinová velikost s pevnou ABS skořepinou a TSA zámkem.',
    descBlocks: {
      para: 'Palubní skořepinový kufr z řady Swissbrand Riga. Dvojcestný zip, 4 dvojitá otočná kolečka, výsuvné madlo i pomocné madlo na boku. Uvnitř rozdělení přepážkou na zip a popruhy k fixaci věcí.',
      specs: 'Materiál: ABS / podšívka polyester · Rozměry: 55 × 38 × 21,5 cm · Objem: 43 l · Hmotnost: 2,8 kg · TSA zámek, 3-místný kódový zámek.',
    },
  },
  {
    _id: 'riga-set3-modra',
    slug: 'swissbrand-riga-set-3',
    title: 'Swissbrand Riga Set 3',
    folder: 'Riga set 3 blue',
    front: '6661',
    colorGroup: 'rigaSet',
    heroColor: 'Nebesky modrá',
    variant: { sku: '400', color: 'Nebesky modrá', colorHex: '#5a9bd4', price: 7519, weightGrams: 11000, lengthCm: 78, widthCm: 51, heightCm: 32, key: 'v-modra' },
    shortDescription: 'Set 3 skořepinových kufrů Swissbrand Riga (S/M/L) v nebesky modré — pevná ABS skořepina, TSA zámek.',
    descBlocks: {
      para: 'Třídílný set skořepinových kufrů z řady Swissbrand Riga (palubní, střední a velký). Dvojcestný zip, 4 dvojitá otočná kolečka, výsuvné madlo. Uvnitř rozdělení přepážkou na zip a popruhy k fixaci.',
      specs: 'Velikosti: S 55×38×24 cm / 43 l / 2,8 kg · M 68×45×27 cm / 69 l / 3,7 kg · L 78×51×32 cm / 104 l / 4,5 kg · Materiál ABS / podšívka polyester · TSA zámek.',
    },
  },
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
/** Move the chosen hero file (asset number or filename substring) to front. */
function moveFront(files: string[], front?: number | string): string[] {
  if (front == null) return files;
  const i = files.findIndex((f) =>
    typeof front === 'number' ? assetNum(path.basename(f)) === front : path.basename(f).includes(front));
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

/* ─── Main ────────────────────────────────────────────────────────────── */

async function main() {
  console.log(`Mode: ${live ? 'LIVE WRITE (publishes)' : 'DRY RUN'} · stock placeholder: ${DEFAULT_STOCK}\n`);

  for (const d of DEFS) {
    const dir = path.join(ROOT, d.folder);
    if (!fs.existsSync(dir)) { console.log(`⚠ folder not found: ${d.folder} — skipped`); continue; }
    const files = moveFront(listImages(dir), d.front);
    console.log(`■ ${d.title} — ${d.variant.color} (${d.variant.sku}) · ${d.variant.price} Kč · ${files.length} photo(s) · hero: ${path.basename(files[0])}`);

    const existing = await client.fetch<{ _id: string } | null>(`*[_type=="product" && slug.current==$s][0]{_id}`, { s: d.slug });
    if (existing) console.log(`   ℹ slug "${d.slug}" exists (${existing._id}) — will be replaced.`);

    let imgs: ReturnType<typeof imageObjects> = [];
    if (live) {
      const ids: string[] = [];
      for (const f of files) ids.push(await uploadImage(f));
      imgs = imageObjects(ids, `${d.title} – ${d.variant.color}`, `vimg-${d.variant.key}`);
    }

    const doc = {
      _id: d._id,
      _type: 'product',
      title: d.title,
      slug: { _type: 'slug', current: d.slug },
      category: { _type: 'reference', _ref: KUFRY_CATEGORY_ID },
      ...(d.subcategory ? { subcategory: d.subcategory } : {}),
      shortDescription: d.shortDescription,
      description: [block('d0', d.descBlocks.para), block('d1', d.descBlocks.specs)],
      ...(imgs.length ? { images: imageObjects(imgs.map((i) => i.asset._ref), d.title, 'img') } : {}),
      variants: [{
        _type: 'variant', _key: d.variant.key, sku: d.variant.sku, color: d.variant.color, colorHex: d.variant.colorHex,
        price: d.variant.price, stock: DEFAULT_STOCK, weightGrams: d.variant.weightGrams,
        lengthCm: d.variant.lengthCm, widthCm: d.variant.widthCm, heightCm: d.variant.heightCm,
        ...(imgs.length ? { images: imgs } : {}),
      }],
      featured: false,
      colorGroup: d.colorGroup,
      colorHex: d.variant.colorHex,
      heroColor: d.heroColor,
      active: true,
    };

    if (live) {
      await client.createOrReplace(doc);
      console.log(`   ✅ created & published\n`);
    } else {
      console.log(`   — would createOrReplace (hero from ${files.length} photos)\n`);
    }
  }

  console.log(live ? '✅ Done.' : 'DRY RUN — nothing written.');
}

main().catch((e) => { console.error('\n❌ Failed:', e); process.exit(1); });
