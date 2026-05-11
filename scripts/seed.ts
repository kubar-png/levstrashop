/**
 * One-shot seed:  `npm run seed`
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET
 *   SANITY_API_WRITE_TOKEN  (Editor permissions)
 *
 * Idempotent: products are upserted by slug; running again refreshes content
 * but does NOT duplicate. Images are re-used by their Wix URL hash.
 */

import 'dotenv/config';
import { createClient } from '@sanity/client';
import { seedCategories, seedProducts } from './seed-data';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || projectId === 'placeholder' || !token) {
  console.error(
    '❌  Missing Sanity credentials. Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local',
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2025-01-01',
  useCdn: false,
});

/** Cache of Wix-url → Sanity asset _ref so we don't re-upload across products. */
const assetCache = new Map<string, string>();

async function uploadImage(url: string): Promise<string> {
  if (assetCache.has(url)) return assetCache.get(url)!;
  console.log(`  ↑ uploading ${url.split('/').pop()}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const filename = url.split('/').pop() || 'image.jpg';
  const asset = await client.assets.upload('image', buf, { filename });
  assetCache.set(url, asset._id);
  return asset._id;
}

async function upsert<T extends { _type: string; slug?: { current: string } | string }>(
  doc: T & { _id?: string },
): Promise<{ _id: string }> {
  const slug =
    typeof doc.slug === 'string'
      ? doc.slug
      : (doc.slug as { current: string } | undefined)?.current;
  if (!slug) throw new Error('upsert requires a slug');

  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type==$type && slug.current==$slug][0]{_id}`,
    { type: doc._type, slug },
  );

  if (existing) {
    const { _id: _drop, ...patch } = doc;
    void _drop;
    await client.patch(existing._id).set(patch).commit();
    return { _id: existing._id };
  }
  const created = await client.create({ ...doc, _id: doc._id });
  return { _id: created._id };
}

async function main() {
  console.log(`▶ Seeding dataset "${dataset}" in project ${projectId}\n`);

  console.log('1/2  Categories');
  const categoryIds = new Map<string, string>();
  for (const cat of seedCategories) {
    const res = await upsert({
      _type: 'category',
      title: cat.title,
      slug: { _type: 'slug', current: cat.slug },
      description: cat.description,
    });
    categoryIds.set(cat.slug, res._id);
    console.log(`  ✓ ${cat.title}`);
  }

  console.log('\n2/2  Products');
  for (const p of seedProducts) {
    console.log(`\n  ${p.title}`);
    const images = await Promise.all(
      p.imageUrls.map(async (url, i) => ({
        _type: 'image',
        _key: `img-${i}`,
        asset: { _type: 'reference', _ref: await uploadImage(url) },
        alt: p.title,
      })),
    );

    await upsert({
      _type: 'product',
      title: p.title,
      slug: { _type: 'slug', current: p.slug },
      category: { _type: 'reference', _ref: categoryIds.get(p.category)! },
      shortDescription: p.shortDescription,
      description: [
        {
          _type: 'block',
          _key: 'desc',
          style: 'normal',
          children: [{ _type: 'span', _key: 'span', text: p.description }],
        },
      ],
      images,
      variants: p.variants.map((v, i) => ({ _type: 'variant', _key: `v-${i}`, ...v })),
      featured: p.featured ?? false,
      active: true,
    });
    console.log(`  ✓ ${p.title} (${p.variants.length} variants)`);
  }

  console.log('\n✅  Seed complete.');
}

main().catch((err) => {
  console.error('\n❌  Seed failed:', err);
  process.exit(1);
});
