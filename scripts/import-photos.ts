/**
 * Attach real product photos to Marina Galanti handbags in Sanity.
 *
 *   npx tsx scripts/import-photos.ts [--dir "/path/to/arcads kabelky"] [--live]
 *
 * Folder layout expected:
 *   <Human name> (<CODE>)/<czech color>/<photo>.jpg
 *
 * Matching:
 *   - folder CODE  → product where colorGroup == CODE
 *   - color folder → variant whose `color` matches (exact, substring, or synonym)
 *
 * For every matched variant it uploads the folder's photos and replaces the
 * variant's placeholder image set. The product hero image is set from the
 * "černá" variant's photos when present (else the first matched folder).
 * Re-runnable: Sanity dedupes assets by content hash; image arrays are reset.
 *
 * Defaults to DRY RUN (prints the full mapping, uploads nothing). Pass --live
 * to actually upload + patch.
 */

import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

if (fs.existsSync('.env.local.sanity')) dotenv.config({ path: '.env.local.sanity', override: false });
dotenv.config({ path: '.env.local', override: false });

const args = process.argv.slice(2);
const argVal = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const live = args.includes('--live');
const ROOT = argVal('--dir') || `${process.env.HOME}/Downloads/arcads kabelky`;

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) {
  console.error('❌ Missing NEXT_PUBLIC_SANITY_PROJECT_ID');
  process.exit(1);
}
if (!token && live) {
  console.error('❌ Missing SANITY_API_WRITE_TOKEN (required for --live)');
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: '2025-01-01', useCdn: false });

/* ─── Color matching ──────────────────────────────────────────────────── */

/** Folder color → candidate variant color(s) when there's no literal match. */
const COLOR_SYNONYMS: Record<string, string[]> = {
  slonovinová: ['krémová', 'bílá'], // ivory ≈ off-white
  hnědá: ['koňaková'], // cuoio variant is now labelled "koňaková"
};

const norm = (s: string) =>
  s.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();

type Variant = { _key: string; sku?: string; color?: string; colorHex?: string };

function matchVariant(folderColor: string, variants: Variant[]): Variant | null {
  const f = norm(folderColor);
  const colorOf = (v: Variant) => norm(v.color ?? '');
  // 1. exact
  let v = variants.find((x) => colorOf(x) === f);
  if (v) return v;
  // 2. substring either way ("hnědá" ↔ "hnědá (cuoio)")
  v = variants.find((x) => colorOf(x).includes(f) || (f.length > 2 && f.includes(colorOf(x))));
  if (v) return v;
  // 3. synonyms
  for (const cand of COLOR_SYNONYMS[f] ?? []) {
    const c = norm(cand);
    v = variants.find((x) => colorOf(x) === c || colorOf(x).includes(c));
    if (v) return v;
  }
  return null;
}

/* ─── Filesystem ──────────────────────────────────────────────────────── */

const IMG_RE = /\.(jpe?g|png|webp)$/i;
const CONTENT_TYPE: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
};

/** Trailing number in "…asset-NN.png". */
const assetNum = (f: string): number => {
  const ns = f.match(/\d+/g);
  return ns ? Number(ns[ns.length - 1]) : 0;
};

/**
 * Hand-picked front (or 3/4) shot per variant — that photo goes first so the
 * card thumbnail / hero / PDP default isn't an open-bag/interior shot.
 * Keyed by colorGroup → folder colour → asset number.
 */
const FRONT_IMAGE: Record<string, Record<string, number>> = {
  MBP013BT1: { 'bílá': 67, 'hořčicová': 68, 'světle modrá': 63, 'černá': 58 },
  MBP056HO2: { 'slonovinová': 17, 'černá': 15, 'šalvějová': 12 },
  MBP076HO1: { 'tělová': 8 },
  MBP014SG2: { 'hnědá': 52, 'hořčicová': 47, 'tělová': 48, 'černá': 10 },
  MBP007BK2: { 'světle modrá': 74, 'tělová': 71, 'černá': 5 },
  MBP028SR2: { 'bílá': 12, 'hnědá': 24, 'světle modrá': 21, 'tělová': 17, 'černá': 22 },
  MBP072SG3: { 'černá': 11 },
  MBP048WT2: { 'hnědá': 25, 'tělová': 23, 'černá': 9, 'šedá': 25 },
};

function listImages(dir: string, frontNum?: number): string[] {
  const files = fs
    .readdirSync(dir)
    .filter((f) => IMG_RE.test(f) && !f.startsWith('.'))
    .sort((a, b) => a.localeCompare(b, 'cs', { numeric: true }));
  if (frontNum != null) {
    const i = files.findIndex((f) => assetNum(f) === frontNum);
    if (i > 0) files.unshift(files.splice(i, 1)[0]);
  }
  return files.map((f) => path.join(dir, f));
}

function codeFromFolder(name: string): string | null {
  const m = name.match(/\(([^)]+)\)\s*$/);
  return m ? m[1].trim() : null;
}

/* ─── Sanity ──────────────────────────────────────────────────────────── */

type Product = { _id: string; title: string; colorGroup: string; variants: Variant[] };

const assetCache = new Map<string, string>();
async function uploadImage(filePath: string): Promise<string> {
  if (assetCache.has(filePath)) return assetCache.get(filePath)!;
  const ext = path.extname(filePath).toLowerCase();
  const buf = fs.readFileSync(filePath);
  const asset = await client.assets.upload('image', buf, {
    filename: path.basename(filePath),
    contentType: CONTENT_TYPE[ext] ?? 'image/jpeg',
  });
  assetCache.set(filePath, asset._id);
  return asset._id;
}

function imageObjects(assetIds: string[], alt: string, keyPrefix: string) {
  return assetIds.map((ref, i) => ({
    _type: 'image',
    _key: `${keyPrefix}-${i}`,
    asset: { _type: 'reference', _ref: ref },
    alt,
  }));
}

/* ─── Main ────────────────────────────────────────────────────────────── */

async function main() {
  console.log(`▶ Root: ${ROOT}`);
  console.log(`  Mode: ${live ? 'LIVE WRITE' : 'DRY RUN'}\n`);
  if (!fs.existsSync(ROOT)) {
    console.error('❌ Folder not found:', ROOT);
    process.exit(1);
  }

  const productFolders = fs
    .readdirSync(ROOT)
    .filter((f) => fs.statSync(path.join(ROOT, f)).isDirectory());

  let patched = 0;
  let uploaded = 0;
  const unmatchedColors: string[] = [];
  const missingProducts: string[] = [];

  for (const folder of productFolders) {
    const code = codeFromFolder(folder);
    if (!code) continue;
    const product = await client.fetch<Product | null>(
      `*[_type=="product" && colorGroup==$c][0]{_id, title, colorGroup, variants[]{_key, sku, color, colorHex}}`,
      { c: code },
    );
    if (!product) {
      missingProducts.push(`${folder} (colorGroup=${code})`);
      console.log(`✗ ${folder} — no product with colorGroup ${code}`);
      continue;
    }

    console.log(`\n■ ${product.title}  [${code}]`);
    const colorFolders = fs
      .readdirSync(path.join(ROOT, folder))
      .filter((c) => fs.statSync(path.join(ROOT, folder, c)).isDirectory());

    const patch: Record<string, unknown> = {};
    let heroIds: string[] | null = null;
    let heroIsBlack = false;

    for (const colorFolder of colorFolders) {
      const dir = path.join(ROOT, folder, colorFolder);
      const frontNum = FRONT_IMAGE[code]?.[norm(colorFolder)];
      const files = listImages(dir, frontNum);
      if (files.length === 0) continue;

      const variant = matchVariant(colorFolder, product.variants);
      if (!variant) {
        unmatchedColors.push(`${code} / ${colorFolder}`);
        console.log(`   ⚠ "${colorFolder}" — no matching variant, SKIPPED`);
        continue;
      }

      const flag = norm(variant.color ?? '') === norm(colorFolder) ? '' : `  (→ "${variant.color}")`;
      console.log(`   • "${colorFolder}"${flag} → ${variant.sku}  ·  ${files.length} photo(s)`);

      if (live) {
        const ids: string[] = [];
        for (const f of files) {
          ids.push(await uploadImage(f));
          uploaded++;
        }
        const alt = `${product.title} – ${variant.color ?? colorFolder}`;
        patch[`variants[_key=="${variant._key}"].images`] = imageObjects(ids, alt, `vimg-${variant._key}`);
        const isBlack = norm(variant.color ?? '').includes('černá');
        if (!heroIds || (isBlack && !heroIsBlack)) {
          heroIds = ids;
          heroIsBlack = isBlack;
        }
      }
    }

    if (live && Object.keys(patch).length > 0) {
      if (heroIds && heroIds.length > 0) {
        patch['images'] = imageObjects(heroIds, product.title, 'img');
      }
      await client.patch(product._id).set(patch).commit();
      patched++;
      console.log(`   ✓ patched ${Object.keys(patch).length - (heroIds ? 1 : 0)} variant(s) + hero`);
    }
  }

  console.log(`\n────────────────────────────────`);
  console.log(`${live ? '✅ Done' : 'DRY RUN — nothing written'}.`);
  if (live) console.log(`   products patched: ${patched}, images uploaded: ${uploaded}`);
  if (unmatchedColors.length) console.log(`   ⚠ unmatched color folders: ${unmatchedColors.join(', ')}`);
  if (missingProducts.length) console.log(`   ⚠ folders with no product: ${missingProducts.join(', ')}`);
}

main().catch((e) => {
  console.error('\n❌ Failed:', e);
  process.exit(1);
});
