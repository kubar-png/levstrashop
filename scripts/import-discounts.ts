/**
 * Apply the OLD e-shop's discounts to products we also sell on the new shop.
 *
 * Source: the company price tables (Běžná cena = original, Cena = sale price).
 *   ~/Desktop/Levstra product foto/03_Tabulky a status/{á moda-MG.xlsx, HSD_vyběr_kufry.xlsx}
 *
 * A product is "on sale" where Běžná cena > Cena. We join the table to our Sanity
 * variants by the Marina Galanti / Swissbrand product CODE embedded in the variant
 * SKU (e.g. SKU "MB0493HO1-green" → code "MB0493HO1"). For each of our variants whose
 * code is on sale in the table, we set `compareAtPrice = Běžná cena` — BUT ONLY when
 * Běžná > our current selling price, so the struck-through original always reads as a
 * genuine, larger price. We DO NOT change the actual selling price.
 *
 *   npx tsx scripts/import-discounts.ts          # DRY RUN (default)
 *   npx tsx scripts/import-discounts.ts --live    # write compareAtPrice (publishes)
 *   npx tsx scripts/import-discounts.ts --clear --live   # remove all compareAtPrice
 */
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import * as XLSX from 'xlsx';
import { createClient } from '@sanity/client';

if (fs.existsSync('.env.local.sanity')) dotenv.config({ path: '.env.local.sanity', override: false });
dotenv.config({ path: '.env.local', override: false });

const live = process.argv.includes('--live');
const clear = process.argv.includes('--clear');
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || (!token && live)) { console.error('❌ Missing Sanity env (need write token for --live)'); process.exit(1); }
const client = createClient({ projectId, dataset, token, apiVersion: '2025-01-01', useCdn: false });

const TBL = `${process.env.HOME}/Desktop/Levstra product foto/03_Tabulky a status`;
const FILES = ['á moda-MG.xlsx', 'HSD_vyběr_kufry.xlsx'];

/** Pull the MG/Swissbrand product code out of a SKU or table "Kód". */
function baseCode(s: string): string | null {
  const t = String(s).trim();
  const mg = t.match(/^(MBP?\d{3,4}[A-Z]{2}\d(?:VZ)?)/i);
  if (mg) return mg[1].toUpperCase();
  const sw = t.match(/^(SW[A-Z]+\d*)/i); // Swissbrand (kufry) — included for completeness
  if (sw) return sw[1].toUpperCase();
  return null;
}

/** code → { bezna, cena } for rows that are on sale (Běžná > Cena), max Běžná per code. */
function loadSaleMap(): Map<string, { bezna: number; cena: number }> {
  const map = new Map<string, { bezna: number; cena: number }>();
  for (const file of FILES) {
    const full = path.join(TBL, file);
    if (!fs.existsSync(full)) { console.log(`⚠ table not found: ${file}`); continue; }
    const wb = XLSX.readFile(full);
    const aoa = XLSX.utils.sheet_to_json<string[]>(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });
    const h = aoa.findIndex((r) => r.includes('Kód'));
    if (h < 0) continue;
    const cols = aoa[h]; const ci = (n: string) => cols.indexOf(n);
    const iK = ci('Kód'), iB = ci('Běžná cena'), iC = ci('Cena');
    for (const r of aoa.slice(h + 1)) {
      const code = baseCode(r[iK] as string);
      const b = Number(r[iB]), c = Number(r[iC]);
      if (!code || !(b > 0 && c > 0 && b > c)) continue;
      const prev = map.get(code);
      if (!prev || b > prev.bezna) map.set(code, { bezna: b, cena: c });
    }
  }
  return map;
}

type V = { _key: string; sku?: string; color?: string; price?: number; compareAtPrice?: number };
type P = { _id: string; title: string; variants: V[] };

async function main() {
  console.log(`Mode: ${live ? 'LIVE WRITE' : 'DRY RUN'}${clear ? ' · CLEAR compareAtPrice' : ''}\n`);
  const products = await client.fetch<P[]>(
    `*[_type=="product"]{_id, title, variants[]{_key, sku, color, price, compareAtPrice}} | order(title asc)`);

  if (clear) {
    let n = 0;
    for (const p of products) for (const v of p.variants ?? []) if (v.compareAtPrice != null) {
      console.log(`  ✕ ${p.title} / ${v.color ?? v.sku}: clear compareAtPrice`);
      if (live) { await client.patch(p._id).unset([`variants[_key=="${v._key}"].compareAtPrice`]).commit(); }
      n++;
    }
    console.log(`\n${live ? '✅' : 'DRY'} cleared ${n} variant(s).`);
    return;
  }

  const sale = loadSaleMap();
  console.log(`On-sale product codes in tables: ${sale.size}\n`);

  let applied = 0, skippedPrice = 0;
  const matchedProducts = new Set<string>();
  for (const p of products) {
    for (const v of p.variants ?? []) {
      const code = baseCode(v.sku ?? '');
      const deal = code ? sale.get(code) : undefined;
      if (!deal) continue;
      const price = v.price ?? 0;
      if (deal.bezna <= price) { skippedPrice++; continue; } // strikethrough must be larger than our price
      const pct = Math.round((1 - price / deal.bezna) * 100);
      console.log(`  ★ ${p.title} / ${v.color ?? v.sku} (${code}): ${price} Kč  ← původní ${deal.bezna} Kč  (−${pct} %)`);
      matchedProducts.add(p.title);
      applied++;
      if (live) { await client.patch(p._id).set({ [`variants[_key=="${v._key}"].compareAtPrice`]: deal.bezna }).commit(); }
    }
  }

  console.log(`\n────────────────────────────────`);
  console.log(`Variants ${live ? 'updated' : 'to update'}: ${applied}  ·  products: ${matchedProducts.size}`);
  console.log(`Skipped (table original ≤ our price, no valid discount): ${skippedPrice}`);
  console.log(live ? '✅ Done — published.' : 'DRY RUN — re-run with --live to apply.');
}
main().catch((e) => { console.error('❌', e); process.exit(1); });
