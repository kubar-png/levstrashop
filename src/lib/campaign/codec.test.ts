import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeSpec, decodeSpec } from './codec.ts';
import type { VariantSpec } from './types.ts';

const sample: VariantSpec = {
  format: '9x16',
  template: 'sale',
  product: { id: 'p1', title: 'Kufr Příběh — žlutý', category: 'Kufry', priceCents: 249900, compareAtCents: 299900, imageUrl: 'https://cdn.sanity.io/x.jpg' },
  lifestyleUrl: 'https://static.wixstatic.com/media/y.jpg',
  headline: 'Sleva 17 % na cestovní klasiku',
  cta: 'Koupit teď',
  benefits: ['Doprava zdarma', 'Prémiové materiály', 'Cestujte se stylem'],
  palette: { bg: '#2d5143', ink: '#f2f0eb', accent: '#e1f861', cta: '#e1f861', ctaInk: '#2b312f' },
};

test('encodeSpec → decodeSpec round-trips, including Czech diacritics', () => {
  const out = decodeSpec(encodeSpec(sample));
  assert.deepEqual(out, sample);
});

test('encoded form is URL-safe (no +, /, =, or spaces)', () => {
  const s = encodeSpec(sample);
  assert.ok(!/[+/=\s]/.test(s), `unexpected char in ${s}`);
});
