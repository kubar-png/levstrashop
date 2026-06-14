/**
 * Attach suitcase (kufry) photos to Swissbrand Riga products in Sanity.
 *
 *   npx tsx scripts/import-kufry-photos.ts            # DRY RUN (default)
 *   npx tsx scripts/import-kufry-photos.ts --live     # upload + patch (publishes)
 *
 * Folder layout (flat — photos directly inside each folder):
 *   ~/Desktop/Levstra product foto/Riga <SIZE> <COLOR>/<photo>.png
 *
 * SIZE  → product:   L → "Swissbrand Riga Velký",  M → "Swissbrand Riga Střední"
 *                    S / "set 3" → no product yet (reported, skipped)
 * COLOR → variant:   black → Černá,  silver → Stříbrná,  blue → Modrá
 *
 * For each matched folder it uploads the photos and REPLACES that variant's
 * image set (real photo first). The product hero is set from the black
 * variant's photos when present, else the first matched folder.
 * Re-runnable: Sanity dedupes assets by content hash.
 */

import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

if (fs.existsSync('.env.local.sanity')) dotenv.config({ path: '.env.local.sanity', override: false });
dotenv.config({ path: '.env.local', override: false });
dotenv.config({ path: '.env', override: false });

const args = process.argv.slice(2);
const argVal = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const live = args.includes('--live');
const ROOT = argVal('--dir') || `${process.env.HOME}/Desktop/Levstra product foto`;

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId) { console.error('❌ Missing NEXT_PUBLIC_SANITY_PROJECT_ID'); process.exit(1); }
if (!token && live) { console.error('❌ Missing SANITY_API_WRITE_TOKEN (required for --live)'); process.exit(1); }

const client = createClient({ projectId, dataset, token, apiVersion: '2025-01-01', useCdn: false });

/* ─── Folder name → size + colour ─────────────────────────────────────── */

const COLOR_MAP: Record<string, string> = { black: 'Černá', silver: 'Stříbrná', blue: 'Modrá' };

/** Hero pick per folder: the 3/4 standing shot (asset number) goes first so the
 *  catalog card / product hero isn't an open-case or detail shot. */
const FRONT_BY_FOLDER: Record<string, number> = {
  'Riga L black': 8, 'Riga L silver': 19, 'Riga M black': 8, 'Riga M blue': 9, 'Riga S silver': 8,
};

/** "Riga L black" → { sizeToken: 'L', colorEn: 'black' }; "Riga set 3 blue" → { sizeToken: 'set 3', colorEn: 'blue' } */
function parseFolder(name: string): { sizeToken: string; colorEn: string } | null {
  const m = name.trim().match(/^Riga\s+(.+)\s+(black|silver|blue)$/i);
  if (!m) return null;
  return { sizeToken: m[1].trim().toLowerCase(), colorEn: m[2].toLowerCase() };
}

/** Map the size token in the folder to a product title fragment. */
function sizeToTitleFragment(sizeToken: string): string | null {
  if (sizeToken === 'l') return 'Velký';
  if (sizeToken === 'm') return 'Střední';
  if (sizeToken === 's') return 'Malý';      // not in Sanity yet
  if (sizeToken.startsWith('set')) return 'Set';  // not in Sanity yet
  return null;
}

/* ─── Filesystem ──────────────────────────────────────────────────────── */

const IMG_RE = /\.(jpe?g|png|webp)$/i;
const CONTENT_TYPE: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
};
const assetNum = (f: string): number | null => {
  const m = f.match(/asset-(\d+)/i);
  return m ? Number(m[1]) : null;
};
/** asset-N files first (ascending), then any other images (e.g. UUID-named). */
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
/** Move the chosen hero file (by asset number) to the front of the list. */
function moveFront(files: string[], front?: number): string[] {
  if (front == null) return files;
  const i = files.findIndex((f) => assetNum(path.basename(f)) === front);
  if (i > 0) { const c = files.slice(); c.unshift(c.splice(i, 1)[0]); return c; }
  return files;
}

/* ─── Sanity ──────────────────────────────────────────────────────────── */

type Variant = { _key: string; sku?: string; color?: string; colorHex?: string };
type Product = { _id: string; title: string; variants: Variant[] };

const assetCache = new Map<string, string>();
async function uploadImage(filePath: string): Promise<string> {
  if (assetCache.has(filePath)) return assetCache.get(filePath)!;
  const ext = path.extname(filePath).toLowerCase();
  const asset = await client.assets.upload('image', fs.readFileSync(filePath), {
    filename: path.basename(filePath),
    contentType: CONTENT_TYPE[ext] ?? 'image/png',
  });
  assetCache.set(filePath, asset._id);
  return asset._id;
}
function imageObjects(assetIds: string[], alt: string, keyPrefix: string) {
  return assetIds.map((ref, i) => ({
    _type: 'image', _key: `${keyPrefix}-${i}`,
    asset: { _type: 'reference', _ref: ref }, alt,
  }));
}
const norm = (s: string) => s.normalize('NFC').toLowerCase().trim();

/* ─── Main ────────────────────────────────────────────────────────────── */

async function main() {
  console.log(`▶ Root: ${ROOT}`);
  console.log(`  Mode: ${live ? 'LIVE WRITE (publishes)' : 'DRY RUN'}\n`);
  if (!fs.existsSync(ROOT)) { console.error('❌ Folder not found:', ROOT); process.exit(1); }

  const products = await client.fetch<Product[]>(
    `*[_type=="product" && category->slug.current=="kufry"]{_id, title, variants[]{_key, sku, color, colorHex}}`,
  );

  const folders = fs.readdirSync(ROOT)
    .filter((f) => fs.statSync(path.join(ROOT, f)).isDirectory() && /^Riga\s/i.test(f));

  // Group folders by target product so we can set the hero from the black variant.
  type Job = { folder: string; product: Product; variant: Variant; files: string[]; colorEn: string };
  const jobs: Job[] = [];
  const missingProduct: string[] = [];
  const unmatchedVariant: string[] = [];

  for (const folder of folders.sort()) {
    const parsed = parseFolder(folder);
    if (!parsed) { console.log(`✗ "${folder}" — can't parse size/colour`); continue; }
    const frag = sizeToTitleFragment(parsed.sizeToken);
    const czColor = COLOR_MAP[parsed.colorEn];
    const files = moveFront(listImages(path.join(ROOT, folder)), FRONT_BY_FOLDER[folder]);
    const product = frag ? products.find((p) => norm(p.title).includes(norm(frag))) : undefined;

    if (!product) {
      missingProduct.push(`${folder}  (→ "${frag ?? '?'}" — žádný produkt)`);
      console.log(`⚠ "${folder}" — no product for size "${parsed.sizeToken}" → "${frag}"  (${files.length} photos)`);
      continue;
    }
    const variant = product.variants.find((v) => norm(v.color ?? '') === norm(czColor));
    if (!variant) {
      unmatchedVariant.push(`${folder}  (→ ${product.title} / ${czColor})`);
      console.log(`⚠ "${folder}" — ${product.title} has no "${czColor}" variant`);
      continue;
    }
    jobs.push({ folder, product, variant, files, colorEn: parsed.colorEn });
    console.log(`✓ "${folder}"  →  ${product.title} / ${variant.color} (${variant.sku})  ·  ${files.length} photo(s)  ·  hero: ${path.basename(files[0])}`);
  }

  let uploaded = 0;
  if (live) {
    // Patch grouped per product (variant images + hero).
    const byProduct = new Map<string, Job[]>();
    for (const j of jobs) byProduct.set(j.product._id, [...(byProduct.get(j.product._id) ?? []), j]);

    for (const [pid, pjobs] of byProduct) {
      const patch: Record<string, unknown> = {};
      let heroIds: string[] | null = null;
      for (const j of pjobs) {
        const ids: string[] = [];
        for (const f of j.files) { ids.push(await uploadImage(f)); uploaded++; }
        const alt = `${j.product.title} – ${j.variant.color}`;
        patch[`variants[_key=="${j.variant._key}"].images`] = imageObjects(ids, alt, `vimg-${j.variant._key}`);
        if (!heroIds || j.colorEn === 'black') heroIds = ids;
      }
      if (heroIds) patch['images'] = imageObjects(heroIds, pjobs[0].product.title, 'img');
      await client.patch(pid).set(patch).commit();
      console.log(`   ✓ patched ${pjobs[0].product.title}: ${pjobs.length} variant(s) + hero`);
    }
  }

  console.log(`\n────────────────────────────────`);
  console.log(live ? `✅ Done. images uploaded: ${uploaded}` : 'DRY RUN — nothing written.');
  if (missingProduct.length) console.log(`\n⚠ Folders with NO product in Sanity (need a new product first):\n   - ${missingProduct.join('\n   - ')}`);
  if (unmatchedVariant.length) console.log(`\n⚠ Folders with no matching variant:\n   - ${unmatchedVariant.join('\n   - ')}`);
}

main().catch((e) => { console.error('\n❌ Failed:', e); process.exit(1); });
