/**
 * One-off: deactivate the test product(s) — keep the document in Sanity but set
 * active=false so it disappears from the storefront (and dynamic sitemap).
 *
 *   npx tsx scripts/deactivate-test-product.ts          # dry run (lists candidates)
 *   npx tsx scripts/deactivate-test-product.ts --live   # apply active=false
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

type Product = { _id: string; title: string; slug?: string; active?: boolean };

async function main() {
  const all = await client.fetch<Product[]>(
    `*[_type=="product"]{_id, title, "slug": slug.current, active}`,
  );
  // Match anything that looks like a test fixture by title or slug.
  const candidates = all.filter(
    (p) => /test/i.test(p.title || '') || /test/i.test(p.slug || ''),
  );

  console.log(`Scanned ${all.length} products, ${candidates.length} test candidate(s). Mode: ${live ? 'LIVE' : 'DRY'}\n`);
  for (const p of candidates) {
    console.log(`  ${p.active === false ? '(already inactive)' : 'ACTIVE     '}  "${p.title}"  [${p.slug ?? '—'}]  ${p._id}`);
  }

  if (!candidates.length) {
    console.log('\nNo product matched /test/ in title or slug — nothing to do.');
    return;
  }
  if (!live) {
    console.log('\nDRY — nothing written. Re-run with --live to set active=false.');
    return;
  }

  const toDeactivate = candidates.filter((p) => p.active !== false);
  for (const p of toDeactivate) {
    await client.patch(p._id).set({ active: false }).commit();
    console.log(`  ✅ deactivated: "${p.title}"`);
  }
  console.log(`\n✅ Done. Set active=false on ${toDeactivate.length} product(s).`);
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
