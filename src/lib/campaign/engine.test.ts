import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildBatch } from './engine.ts';
import { salePercent } from './copy.ts';
import type { CampaignProduct } from './types.ts';

const products: CampaignProduct[] = [
  { id: 'a', title: 'Kufr Příběh', priceCents: 249900, compareAtCents: 299900, imageUrl: 'a.jpg' },
  { id: 'b', title: 'Kabelka Lucia', priceCents: 159900, imageUrl: 'b.jpg' },
  { id: 'c', title: 'Batoh Aria', priceCents: 99900, imageUrl: 'c.jpg' },
];

test('same seed → identical batch (deterministic)', () => {
  assert.deepEqual(buildBatch(42, products, '1x1', 6), buildBatch(42, products, '1x1', 6));
});

test('different seed → different batch (very likely)', () => {
  const same = JSON.stringify(buildBatch(1, products, '1x1', 6)) === JSON.stringify(buildBatch(2, products, '1x1', 6));
  assert.equal(same, false);
});

test('batch has the requested length and the requested format', () => {
  const batch = buildBatch(7, products, '9x16', 8);
  assert.equal(batch.length, 8);
  assert.ok(batch.every((v) => v.format === '9x16'));
});

test('sale archetype only appears on a product that is actually on sale', () => {
  for (let seed = 0; seed < 50; seed++) {
    for (const v of buildBatch(seed, products, '1x1', 6)) {
      if (v.archetype === 'sale') assert.notEqual(salePercent(v.product), null);
    }
  }
});

test('lifestyle archetypes carry a lifestyleUrl; colour archetypes do not', () => {
  for (const v of buildBatch(13, products, '1x1', 12)) {
    if (v.archetype === 'lifestyle' || v.archetype === 'productLifestyle') assert.ok(v.lifestyleUrl);
    else assert.equal(v.lifestyleUrl, undefined);
  }
});

test('lockProductId forces every variant to that product', () => {
  for (const v of buildBatch(99, products, '1x1', 6, 'b')) assert.equal(v.product.id, 'b');
});
