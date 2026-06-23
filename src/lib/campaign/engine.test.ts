import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildBatch } from './engine.ts';
import { salePercent } from './copy.ts';
import { LIFESTYLE_TEMPLATES } from './types.ts';
import type { CampaignProduct } from './types.ts';

const products: CampaignProduct[] = [
  { id: 'a', title: 'Marina Galanti Hobo', category: 'Kabelky', priceCents: 159900, compareAtCents: 199900, imageUrl: 'a.jpg' },
  { id: 'b', title: 'Swissbrand Riga', category: 'Kufry', priceCents: 249900, imageUrl: 'b.jpg' },
  { id: 'c', title: 'Marina Galanti Květa', category: 'Kabelky', priceCents: 99900, imageUrl: 'c.jpg' },
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

test('sale template only appears on a product that is actually on sale', () => {
  for (let seed = 0; seed < 60; seed++) {
    for (const v of buildBatch(seed, products, '1x1', 6)) {
      if (v.template === 'sale') assert.notEqual(salePercent(v.product), null);
    }
  }
});

test('lifestyle templates only on a category-matched product, and carry a lifestyleUrl; others have none', () => {
  for (let seed = 0; seed < 60; seed++) {
    for (const v of buildBatch(seed, products, '1x1', 6)) {
      if (LIFESTYLE_TEMPLATES.includes(v.template)) {
        assert.equal(v.product.category, 'Kabelky'); // never a suitcase (no matching photo)
        assert.ok(v.lifestyleUrl);
      } else {
        assert.equal(v.lifestyleUrl, undefined);
      }
    }
  }
});

test('a Kufry product (no matching photo) never gets a lifestyle template', () => {
  for (const v of buildBatch(99, products, '1x1', 8, 'b')) {
    assert.equal(v.product.id, 'b');
    assert.equal(LIFESTYLE_TEMPLATES.includes(v.template), false);
  }
});
