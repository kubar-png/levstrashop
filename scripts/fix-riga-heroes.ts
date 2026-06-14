/**
 * Fix the hero (first) image of specific Riga variants: the requested
 * 3/4 standing shot is moved to index 0 of that variant's images[].
 * Preserves every image object as-is (asset ref, _key, alt, crop/hotspot).
 *
 *   npx tsx scripts/fix-riga-heroes.ts          # dry run
 *   npx tsx scripts/fix-riga-heroes.ts --live   # write
 */
import dotenv from 'dotenv';
import fs from 'node:fs';
import { createClient } from '@sanity/client';

if (fs.existsSync('.env.local.sanity')) dotenv.config({ path: '.env.local.sanity', override: false });
dotenv.config({ path: '.env.local', override: false });

const live = process.argv.includes('--live');
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || (!token && live)) { console.error('❌ Missing Sanity env (need write token for --live)'); process.exit(1); }
const client = createClient({ projectId, dataset, token, apiVersion: '2025-01-01', useCdn: false });

/* Each fix: which variant of which product, and the image index that is the 3/4 hero. */
const FIXES = [
  { id: '45c6c851-303a-485d-b02e-fb8dd3e4adde', label: 'Riga Střední – Černá',    vkey: '9af7dea98753', heroIndex: 4 },
  { id: '92e33803-b8db-4394-83bd-6e4f3243cbb5', label: 'Riga Velký – Stříbrná',    vkey: 'f6a4cc596fbe', heroIndex: 2 },
];

const refOf = (im: any) => im?.asset?._ref ?? '?';

async function main() {
  console.log(`Mode: ${live ? 'LIVE' : 'DRY'}\n`);
  for (const fx of FIXES) {
    const doc = await client.fetch<any>(
      `*[_id==$id][0]{ "images": variants[_key==$vkey][0].images }`,
      { id: fx.id, vkey: fx.vkey },
    );
    const images: any[] = doc?.images ?? [];
    if (images.length === 0) { console.log(`  ⚠ ${fx.label}: variant/images not found — skipped`); continue; }
    if (fx.heroIndex >= images.length) { console.log(`  ⚠ ${fx.label}: heroIndex ${fx.heroIndex} out of range (len ${images.length}) — skipped`); continue; }
    if (fx.heroIndex === 0) { console.log(`  · ${fx.label}: 3/4 shot already at [0] — nothing to do`); continue; }

    const hero = images[fx.heroIndex];
    const reordered = [hero, ...images.filter((_, i) => i !== fx.heroIndex)];

    console.log(`  ✓ ${fx.label}`);
    console.log(`      old [0]: ${refOf(images[0])}`);
    console.log(`      new [0]: ${refOf(hero)}  (was [${fx.heroIndex}])`);
    console.log(`      order:   ${images.map(refOf).map((r) => r.slice(6, 12)).join(',')}  ->  ${reordered.map(refOf).map((r) => r.slice(6, 12)).join(',')}`);

    if (live) {
      await client.patch(fx.id).set({ [`variants[_key=="${fx.vkey}"].images`]: reordered }).commit();
      console.log(`      written.`);
    }
  }
  console.log(`\n${live ? '✅ Done.' : 'DRY — nothing written. Re-run with --live.'}`);
}
main().catch((e) => { console.error('❌', e); process.exit(1); });
