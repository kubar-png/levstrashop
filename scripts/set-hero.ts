/**
 * Set each product's hero (catalog) image to a colourful variant's photos
 * instead of the black one. Reuses photos already uploaded to Sanity — no
 * new uploads. Idempotent.
 *
 *   npx tsx scripts/set-hero.ts [--live]
 */

import dotenv from 'dotenv';
import fs from 'node:fs';
import { createClient } from '@sanity/client';

if (fs.existsSync('.env.local.sanity')) dotenv.config({ path: '.env.local.sanity', override: false });
dotenv.config({ path: '.env.local', override: false });

const live = process.argv.includes('--live');

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || (!token && live)) {
  console.error('❌ Missing Sanity env (need write token for --live)');
  process.exit(1);
}
const client = createClient({ projectId, dataset, token, apiVersion: '2025-01-01', useCdn: false });

/* colorGroup → preferred hero colour (variant.color label in Sanity). */
const HERO_COLOR: Record<string, string> = {
  MBP013BT1: 'hořčicová',     // Bucket Bag
  MBP056HO2: 'šalvějová',     // Cecilia (green, per request)
  MBP076HO1: 'tělová',        // Odona (only colour available)
  MBP014SG2: 'koňaková',      // Luxus
  MBP007BK2: 'světle modrá',  // April
  MBP028SR2: 'bílá',          // Hobo
  MBP072SG3: 'černá',         // Ilsa (only black photographed)
  MBP048WT2: 'tělová',        // Lukrecia
};

const norm = (s: string) => s.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();

type VImage = { ref: string | null; alt?: string };
type Variant = { _key: string; color?: string; images?: VImage[] };
type Product = { _id: string; title: string; colorGroup: string; variants: Variant[] };

const hasPhotos = (v: Variant) => (v.images ?? []).some((im) => im.ref && !im.ref.endsWith('-svg') && !/svg/i.test(im.ref));

function pickVariant(p: Product): Variant | null {
  const want = HERO_COLOR[p.colorGroup];
  const withPhotos = p.variants.filter(hasPhotos);
  if (withPhotos.length === 0) return null;
  if (want) {
    const exact = withPhotos.find((v) => norm(v.color ?? '') === norm(want));
    if (exact) return exact;
  }
  // fallback: first non-black variant with photos, else first with photos
  return withPhotos.find((v) => !norm(v.color ?? '').includes('černá')) ?? withPhotos[0];
}

async function main() {
  const codes = Object.keys(HERO_COLOR);
  const products = await client.fetch<Product[]>(
    `*[_type=="product" && colorGroup in $codes]{
      _id, title, colorGroup,
      variants[]{_key, color, "images": images[]{ "ref": asset._ref, alt }}
    }`,
    { codes },
  );
  console.log(`${products.length} products. Mode: ${live ? 'LIVE' : 'DRY'}\n`);

  for (const p of products) {
    const v = pickVariant(p);
    if (!v || !v.images || v.images.length === 0) {
      console.log(`  · ${p.title}: no photographed variant — skipped`);
      continue;
    }
    const hero = v.images
      .filter((im) => im.ref)
      .map((im, i) => ({
        _type: 'image',
        _key: `img-${i}`,
        asset: { _type: 'reference', _ref: im.ref },
        alt: im.alt ?? p.title,
      }));
    console.log(`  ✓ ${p.title}: hero → "${v.color}" (${hero.length} photo)`);
    if (live) await client.patch(p._id).set({ images: hero, heroColor: v.color ?? '' }).commit();
  }
  console.log(`\n${live ? '✅ Heroes updated' : 'DRY — nothing written'}.`);
}

main().catch((e) => { console.error('❌', e); process.exit(1); });
