/**
 * READ-ONLY: list Swiss Brand Riga products, their variants and image URLs,
 * so we can spot which variant has a close-up where the 3/4 hero shot belongs.
 *
 *   npx tsx scripts/inspect-riga.ts
 */
import dotenv from 'dotenv';
import fs from 'node:fs';
import { createClient } from '@sanity/client';

if (fs.existsSync('.env.local.sanity')) dotenv.config({ path: '.env.local.sanity', override: false });
dotenv.config({ path: '.env.local', override: false });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const client = createClient({ projectId, dataset, apiVersion: '2025-01-01', useCdn: false });

const urlOf = (ref: string) => {
  // image-<hash>-<w>x<h>-<fmt>  ->  https://cdn.sanity.io/images/<pid>/<ds>/<hash>-<w>x<h>.<fmt>
  const [, hash, dims, fmt] = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/) ?? [];
  return hash ? `https://cdn.sanity.io/images/${projectId}/${dataset}/${hash}-${dims}.${fmt}` : ref;
};

async function main() {
  const products = await client.fetch<any[]>(
    `*[_type=="product" && (title match "Riga*" || colorGroup match "*riga*")]{
      _id, title, "slug": slug.current, colorGroup, heroColor,
      "productImages": images[]{ "ref": asset._ref, alt },
      variants[]{ _key, sku, size, color,
        "images": images[]{ "_key": _key, "ref": asset._ref, alt } }
    } | order(title asc)`,
  );
  console.log(`Found ${products.length} Riga product(s)\n`);
  for (const p of products) {
    console.log(`\n=== ${p.title}  (slug: ${p.slug}, colorGroup: ${p.colorGroup}, heroColor: ${p.heroColor ?? '—'})`);
    console.log(`    _id: ${p._id}`);
    console.log(`    product-level images: ${(p.productImages ?? []).length}`);
    for (const v of p.variants ?? []) {
      console.log(`  • variant "${v.color}" (${v.size ?? '?'}, sku ${v.sku}, _key ${v._key}) — ${(v.images ?? []).length} img`);
      (v.images ?? []).forEach((im: any, i: number) => {
        console.log(`      [${i}] key=${im._key} alt=${JSON.stringify(im.alt ?? '')}`);
        console.log(`          ${urlOf(im.ref)}`);
      });
    }
  }
}
main().catch((e) => { console.error('❌', e); process.exit(1); });
