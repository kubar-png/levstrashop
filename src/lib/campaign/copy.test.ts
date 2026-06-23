import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickHeadline, pickCta, pickBenefits, salePercent } from './copy.ts';
import type { CampaignProduct } from './types.ts';

const sale: CampaignProduct = { id: 'a', title: 'Kufr Příběh', priceCents: 249900, compareAtCents: 299900, imageUrl: 'x' };
const plain: CampaignProduct = { id: 'b', title: 'Kabelka Lucia', priceCents: 159900, imageUrl: 'x' };
const first = () => 0; // deterministic: always the first candidate

test('salePercent computes rounded discount or null', () => {
  assert.equal(salePercent(sale), 17); // (299900-249900)/299900 ≈ 16.7 → 17
  assert.equal(salePercent(plain), null);
});

test('sale-biased headline mentions the discount and substitutes the title', () => {
  const h = pickHeadline(sale, first, { sale: true });
  assert.match(h, /17/);
  assert.match(h, /Kufr Příběh/);
});

test('a non-sale product never gets a discount headline (whole pool)', () => {
  for (let i = 0; i < 8; i++) {
    const h = pickHeadline(plain, () => i);
    assert.doesNotMatch(h, /%/);
    assert.doesNotMatch(h, /[Ss]leva|výprodej/);
  }
});

test('pickCta is neutral — never the gendered "Chci ji"', () => {
  for (let i = 0; i < 6; i++) {
    const c = pickCta(() => i);
    assert.ok(c.length > 0);
    assert.notEqual(c, 'Chci ji');
  }
});

test('pickBenefits returns n distinct lines', () => {
  const b = pickBenefits(first, 3);
  assert.equal(b.length, 3);
  assert.equal(new Set(b).size, 3);
});
