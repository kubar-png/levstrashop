/**
 * Rename Marina Galanti products: title → "Marina Galanti <Name>",
 * move the original verbose title into the description.
 *
 *   npx tsx scripts/rename-mg.ts [--dry-run]
 */

import dotenv from 'dotenv';
import fs from 'node:fs';
import { createClient } from '@sanity/client';
dotenv.config({ path: '.env.local' });

const dryRun = process.argv.includes('--dry-run');

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !token) {
  console.error('❌ Missing Sanity env vars');
  process.exit(1);
}
const client = createClient({
  projectId, dataset: 'production', token, apiVersion: '2025-01-01', useCdn: false,
});

/* baseSku (colorGroup) → product model name (+ optional disambiguator) */
const NAMES: Record<string, { name: string; suffix?: string; descriptor?: string }> = {
  MB0393CY2:   { name: 'Olivie',   descriptor: 'crossbody bag' },
  MB0406BK2:   { name: 'Sara',     descriptor: 'módní batoh' },
  MB0411HO2:   { name: 'Eli',      descriptor: 'hobo bag' },
  MB0411HO2VZ: { name: 'Eli',      descriptor: 'hobo bag', suffix: 'imitace hadí kůže' },
  MB0464BK2:   { name: 'Sylva',    descriptor: 'batoh' },
  MB0480CY2:   { name: 'Gertruda', descriptor: 'crossbody bag' },
  MB0493HO1:   { name: 'Cecil',    descriptor: 'hobo bag' },
  MB0527HG2:   { name: 'Jitka',    descriptor: 'handbag',  suffix: 'do ruky' },
  MB0527HO1:   { name: 'Jitka',    descriptor: 'hobo bag', suffix: 'přes rameno' },
  MB0530SG3:   { name: 'Liana',    descriptor: 'shopping bag' },
  MB0531CY2:   { name: 'Květa',    descriptor: 'crossbody bag' },
  MB0531HG3:   { name: 'Květa',    descriptor: 'handbag',  suffix: 'do ruky' },
  MB0553HG2:   { name: 'Cabrini',  descriptor: 'handbag',  suffix: 'do ruky' },
  MB0553SG2:   { name: 'Cabrini',  descriptor: 'shopping bag' },
  MBP007BK2:   { name: 'April',    descriptor: 'designový batoh' },
  MBP013BT1:   { name: 'Bucket Bag', descriptor: 'malá kabelka' },
  MBP014SG2:   { name: 'Luxus',    descriptor: 'jednoduchá luxusní kožená kabelka' },
  MBP028SR2:   { name: 'Hobo',     descriptor: 'kožená kabelka přes rameno – hobo bag' },
  MBP048WT2:   { name: 'Lukrecia', descriptor: 'waistbag / kožená ledvinka' },
  MBP056HO2:   { name: 'Cecilia',  descriptor: 'hobo bag, strukturovaná kůže' },
  MBP072SG3:   { name: 'Ilsa',     descriptor: 'do ruky / přes tělo, strukturovaná kůže' },
  MBP076HO1:   { name: 'Odona',    descriptor: 'hobo bag, hladká kůže' },
};

type Product = {
  _id: string;
  title: string;
  colorGroup?: string;
  description?: unknown;
};

function buildTitle(baseSku: string): string {
  const m = NAMES[baseSku];
  if (!m) return `Marina Galanti — ${baseSku}`;
  return m.suffix ? `Marina Galanti ${m.name} — ${m.suffix}` : `Marina Galanti ${m.name}`;
}

function buildDescription(originalTitle: string, baseSku: string) {
  const m = NAMES[baseSku];
  // Use existing verbose title as the description body, prefixed by descriptor if helpful.
  // Strip trailing " - <color>" / " – <color>" / " v <color>" patterns to avoid color-specific wording.
  const cleaned = originalTitle
    .replace(/\s*[-–—]\s*[a-záčďéěíňóřšťúůýž]+(?:\s+[a-záčďéěíňóřšťúůýž]+)?\s*$/i, '')
    .replace(/\s+v\s+[a-záčďéěíňóřšťúůýž]+(?:\s+[a-záčďéěíňóřšťúůýž]+)?\s*$/i, '')
    .replace(/^Marina Galanti[-\s]*/i, '')
    .trim();
  const body = cleaned || (m?.descriptor ?? '');
  const capitalized = body.charAt(0).toUpperCase() + body.slice(1);
  return [
    {
      _type: 'block',
      _key: `desc-${baseSku}`,
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: `desc-span-${baseSku}`, text: capitalized + '.' }],
    },
  ];
}

async function main() {
  const products = await client.fetch<Product[]>(
    `*[_type=="product" && defined(colorGroup) && colorGroup in $bases]{_id, title, colorGroup, description}`,
    { bases: Object.keys(NAMES) },
  );
  console.log(`Found ${products.length} products to rename. Mode: ${dryRun ? 'DRY' : 'LIVE'}\n`);

  for (const p of products) {
    const newTitle = buildTitle(p.colorGroup!);
    const newDesc = buildDescription(p.title, p.colorGroup!);
    console.log(`  ${p.colorGroup}`);
    console.log(`    title:  ${p.title}`);
    console.log(`         → ${newTitle}`);
    console.log(`    desc:   ${(newDesc[0].children[0].text as string).slice(0, 100)}…`);
    if (!dryRun) {
      await client.patch(p._id).set({ title: newTitle, description: newDesc }).commit();
    }
  }
  console.log(`\n✅ ${dryRun ? 'Dry run complete' : 'Renamed ' + products.length + ' products'}`);
}

main().catch((e) => { console.error('❌', e); process.exit(1); });
