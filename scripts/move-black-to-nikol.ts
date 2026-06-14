/**
 * Move the mislabeled "black" bag from Ilsa to Nikol.
 *  - Adds a new "černá" variant to Nikol reusing Ilsa's 3 black photos (price 2290, stock 1).
 *  - Removes the black variant from Ilsa, leaving only "šedohnědá".
 *  - Repoints Ilsa's product/hero images to the taupe placeholder so the black bag no longer shows.
 *  - Does NOT delete the underlying image assets — Nikol now reuses them.
 *
 *   npx tsx scripts/move-black-to-nikol.ts [--live]
 */
import dotenv from 'dotenv';
import fs from 'node:fs';
import { createClient } from '@sanity/client';
if (fs.existsSync('.env.local.sanity')) dotenv.config({ path: '.env.local.sanity', override: false });
dotenv.config({ path: '.env.local', override: false });

const live = process.argv.includes('--live');
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2025-01-01',
  useCdn: false,
});

const ILSA_ID = 'T5me9kJ1Md13zsQPkfvzby';
const NIKOL_ID = 'e3523775-1fed-4d31-b775-f431f48fe69e';

const BLACK_PHOTOS = [
  'image-e0e797ef12af580f31ceb8caa177a4ee4f0fd309-2048x2048-png',
  'image-0cd537d9aa5a27b8cdb3db57eeaf04d7aeed547f-2048x2048-png',
  'image-c5ab6887cc78c1231ced3be20d4b0962c6805d4f-2048x2048-png',
];

async function main() {
  const ilsa = await client.fetch<any>(`*[_id==$id][0]{ _id, variants }`, { id: ILSA_ID });
  const nikol = await client.fetch<any>(`*[_id==$id][0]{ _id, variants }`, { id: NIKOL_ID });
  if (!ilsa || !nikol) throw new Error('Product(s) not found');

  // --- Nikol: append new black variant ---
  const newBlack = {
    _type: 'variant',
    _key: 'v-nikol-black',
    sku: '1002',
    color: 'černá',
    colorHex: '#1a1a1a',
    price: 2290,
    stock: 1,
    images: BLACK_PHOTOS.map((ref, i) => ({
      _type: 'image',
      _key: `nikol-black-${i}`,
      asset: { _type: 'reference', _ref: ref },
      alt: 'Marina Galanti Nikol – černá',
    })),
  };
  const nikolHasBlack = (nikol.variants ?? []).some((v: any) => v.sku === '1002' || v.color === 'černá');
  const nikolVariants = nikolHasBlack ? nikol.variants : [...(nikol.variants ?? []), newBlack];

  // --- Ilsa: drop black variant, keep taupe; repoint product/hero images to taupe placeholder ---
  const taupe = (ilsa.variants ?? []).find((v: any) => v.color === 'šedohnědá');
  const ilsaVariants = (ilsa.variants ?? []).filter((v: any) => v.color !== 'černá');
  const taupeImages = (taupe?.images ?? []).map((im: any, i: number) => ({
    _type: 'image',
    _key: `img-${i}`,
    asset: { _type: 'reference', _ref: im.asset._ref },
    alt: im.alt ?? 'Marina Galanti Ilsa – šedohnědá',
  }));

  console.log('Nikol variants:', nikolVariants.map((v: any) => `${v.color}/${v.sku}`).join(', '));
  console.log('Ilsa variants :', ilsaVariants.map((v: any) => `${v.color}/${v.sku}`).join(', '));
  console.log('Ilsa product images →', taupeImages.length, 'taupe placeholder image(s)');

  if (!live) {
    console.log('\nDRY — nothing written. Re-run with --live to apply.');
    return;
  }

  await client
    .transaction()
    .patch(NIKOL_ID, (p) => p.set({ variants: nikolVariants }))
    .patch(ILSA_ID, (p) => p.set({ variants: ilsaVariants, images: taupeImages, heroColor: 'šedohnědá' }))
    .commit();

  console.log('\n✅ Done.');
}
main().catch((e) => { console.error('❌', e); process.exit(1); });
