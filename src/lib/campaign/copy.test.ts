import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickHeadline, pickCta, salePercent } from './copy.ts';
import type { CampaignProduct } from './types.ts';

const sale: CampaignProduct = { id: 'a', title: 'Kufr Příběh', priceCents: 249900, compareAtCents: 299900, imageUrl: 'x' };
const plain: CampaignProduct = { id: 'b', title: 'Kabelka Lucia', priceCents: 159900, imageUrl: 'x' };
const first = () => 0; // deterministic: always the first candidate

test('salePercent computes rounded discount or null', () => {
  assert.equal(salePercent(sale), 17); // (299900-249900)/299900 ≈ 16.7 → 17
  assert.equal(salePercent(plain), null);
});

test('sale headline mentions the discount and substitutes the title', () => {
  const h = pickHeadline('sale', sale, first);
  assert.match(h, /17/);
  assert.match(h, /Kufr Příběh/);
});

test('non-sale archetype substitutes the title and never invents a price off', () => {
  const h = pickHeadline('lifestyle', plain, first);
  assert.match(h, /Kabelka Lucia/);
  assert.doesNotMatch(h, /%/);
});

test('pickCta returns a non-empty Czech CTA', () => {
  assert.ok(pickCta(first).length > 0);
});
