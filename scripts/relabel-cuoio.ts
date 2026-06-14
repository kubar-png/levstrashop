/**
 * One-off: rename the variant colour label "hnědá (cuoio)" → "koňaková".
 *
 *   npx tsx scripts/relabel-cuoio.ts [--live]
 */

import dotenv from 'dotenv';
import fs from 'node:fs';
import { createClient } from '@sanity/client';

if (fs.existsSync('.env.local.sanity')) dotenv.config({ path: '.env.local.sanity', override: false });
dotenv.config({ path: '.env.local', override: false });

const live = process.argv.includes('--live');
const OLD = 'hnědá (cuoio)';
const NEW = 'koňaková';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || (!token && live)) {
  console.error('❌ Missing Sanity env (need write token for --live)');
  process.exit(1);
}
const client = createClient({ projectId, dataset, token, apiVersion: '2025-01-01', useCdn: false });

type Product = { _id: string; title: string; variants: { _key: string; color?: string }[] };

async function main() {
  const products = await client.fetch<Product[]>(
    `*[_type=="product" && $old in variants[].color]{_id, title, variants[]{_key, color}}`,
    { old: OLD },
  );
  console.log(`Found ${products.length} product(s) with "${OLD}". Mode: ${live ? 'LIVE' : 'DRY'}\n`);

  for (const p of products) {
    const hits = p.variants.filter((v) => v.color === OLD);
    console.log(`  ${p.title}: ${hits.length} variant(s)`);
    if (!live) continue;
    let patch = client.patch(p._id);
    for (const v of hits) patch = patch.set({ [`variants[_key=="${v._key}"].color`]: NEW });
    await patch.commit();
  }
  console.log(`\n${live ? '✅ Relabelled to "' + NEW + '"' : 'DRY — nothing written'}.`);
}

main().catch((e) => { console.error('❌', e); process.exit(1); });
