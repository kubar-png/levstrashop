/**
 * Curate the homepage "featured" products.
 *   - UNFEATURE: clear `featured` on the listed product ids.
 *   - FEATURE:   set `featured=true`, point `heroColor` at the chosen colour, and
 *                copy that colour variant's images to the product-level images[]
 *                (the featured card renders images[0], so the hero must be that colour).
 *
 *   npx tsx scripts/set-featured.ts          # DRY RUN (default)
 *   npx tsx scripts/set-featured.ts --live    # write (publishes)
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

const UNFEATURE = [
  { id: 'e3523775-1fed-4d31-b775-f431f48fe69e', label: 'Marina Galanti Nikol' },
  { id: 'af0cf404-1eb7-4f61-ae60-0773c42c3162', label: 'Test produkt' },
  { id: '45c6c851-303a-485d-b02e-fb8dd3e4adde', label: 'Swissbrand Riga Střední' },
  { id: '92e33803-b8db-4394-83bd-6e4f3243cbb5', label: 'Swissbrand Riga Velký' },
];

// Order here = order in the homepage "Nejoblíbenější" row (left → right) via featuredRank.
// Bucket Bag first (leftmost), suitcases last (rightmost).
const FEATURE: { id: string; label: string; color: string }[] = [
  { id: 'pgEc5d7mmeSB7eUxGRgyHV', label: 'Marina Galanti Bucket Bag', color: 'hořčicová' },
  { id: 'T5me9kJ1Md13zsQPkfvyOH', label: 'Marina Galanti Cecilia',    color: 'šalvějová' },
  { id: 'E7nXCLPw2spSaMTC3ZAiwy', label: 'Marina Galanti Hobo',       color: 'koňaková' },
  { id: 'T5me9kJ1Md13zsQPkfvp4c', label: 'Marina Galanti April',      color: 'světle modrá' },
  { id: 'pgEc5d7mmeSB7eUxGRgycb', label: 'Marina Galanti Luxus',      color: 'tělová' },
  { id: 'riga-set3-modra',        label: 'Swissbrand Riga Set 3',     color: 'Stříbrná' },
];

async function main() {
  console.log(`Mode: ${live ? 'LIVE WRITE (publishes)' : 'DRY RUN'}\n`);

  console.log('── UNFEATURE ──────────────────────────────');
  for (const u of UNFEATURE) {
    console.log(`  ✕ ${u.label}`);
    if (live) await client.patch(u.id).set({ featured: false }).commit();
  }

  console.log('\n── FEATURE ────────────────────────────────');
  for (let idx = 0; idx < FEATURE.length; idx++) {
    const f = FEATURE[idx];
    const rank = idx + 1;
    const imgs = await client.fetch<any[] | null>(
      `*[_id==$id][0].variants[color==$c][0].images`, { id: f.id, c: f.color });
    const n = imgs?.length ?? 0;
    console.log(`  ★ #${rank} ${f.label} — ${f.color}  (${n} variant image(s) → product hero)`);
    if (n === 0) console.log(`     ⚠ no images on "${f.color}" variant — will set featured+heroColor only, hero image unchanged`);
    if (!live) continue;

    const patch: Record<string, unknown> = { featured: true, featuredRank: rank, heroColor: f.color };
    if (n > 0) patch.images = imgs!.map((im, i) => ({ ...im, _key: `img-${i}` }));
    await client.patch(f.id).set(patch).commit();
    console.log('     ✅ written');
  }

  console.log(`\n${live ? '✅ Done — published.' : 'DRY RUN — re-run with --live.'}`);
}
main().catch((e) => { console.error('❌', e); process.exit(1); });
