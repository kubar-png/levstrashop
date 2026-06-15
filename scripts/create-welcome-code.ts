/**
 * Create (or overwrite) the welcome-popup discount code VITEJTE10.
 *
 *   code:          VITEJTE10
 *   type:          percent
 *   value:         10        (= 10 %)
 *   minOrderCents: none      (no minimum)
 *   validityType:  unlimited (platí pořád)
 *   active:        true
 *
 * Deterministic _id so re-running is idempotent (createOrReplace upserts).
 * Once-per-customer is enforced at validation time via `redeemedEmails` — this
 * script does not touch that field, so re-running won't wipe redemptions.
 *
 *   npx tsx scripts/create-welcome-code.ts          # DRY RUN (default)
 *   npx tsx scripts/create-welcome-code.ts --live    # write (publishes)
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

const DOC = {
  _id: 'discount.welcome-vitejte10',
  _type: 'discount',
  code: 'VITEJTE10',
  description: 'Welcome popup — sleva 10 % na první nákup (jednou na zákazníka).',
  active: true,
  type: 'percent',
  value: 10,
  validityType: 'unlimited',
  redemptionCount: 0,
} as const;

async function main() {
  console.log(`Mode: ${live ? 'LIVE WRITE' : 'DRY RUN'}\n`);
  console.log('  createOrReplace discount:');
  console.log(`    code:         ${DOC.code}`);
  console.log(`    type:         ${DOC.type} (${DOC.value} %)`);
  console.log(`    minOrderCents: (none)`);
  console.log(`    validityType: ${DOC.validityType}`);
  console.log(`    active:       ${DOC.active}`);
  console.log(`    _id:          ${DOC._id}\n`);

  if (live) {
    await client.createOrReplace(DOC);
    console.log('✅ Done — VITEJTE10 published.');
  } else {
    console.log('DRY RUN — re-run with --live to apply.');
  }
}
main().catch((e) => { console.error('❌', e); process.exit(1); });
