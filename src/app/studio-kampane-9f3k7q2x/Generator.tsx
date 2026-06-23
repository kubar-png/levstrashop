'use client';

import { useMemo, useState } from 'react';
import type { CampaignProduct, Format } from '@/lib/campaign/types';
import { buildBatch } from '@/lib/campaign/engine';
import { encodeSpec } from '@/lib/campaign/codec';

const BATCH = 8;
const BASE = '/studio-kampane-9f3k7q2x/render';

export default function Generator({ products }: { products: CampaignProduct[] }) {
  const [format, setFormat] = useState<Format>('1x1');
  const [seed, setSeed] = useState(1);

  const batch = useMemo(
    () => (products.length ? buildBatch(seed, products, format, BATCH) : []),
    [products, seed, format],
  );

  async function download(url: string, name: string) {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-bg, #eee)', color: 'var(--color-ink, #2b312f)', padding: '32px clamp(1rem,4vw,2rem)', fontFamily: 'var(--font-sans)' }}>
      <header style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
        <h1 style={{ fontWeight: 600, fontSize: 24, marginRight: 'auto' }}>Generátor kampaní</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['1x1', '9x16'] as Format[]).map((f) => (
            <button key={f} onClick={() => setFormat(f)} className="btn-secondary" aria-pressed={format === f}
              style={{ fontWeight: format === f ? 600 : 400 }}>
              {f === '1x1' ? '1:1' : '9:16'}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={() => setSeed((s) => s + 1)}>Generovat další</button>
      </header>

      {products.length === 0 ? (
        <p>Žádné produkty s fotkou k dispozici.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, alignItems: 'start' }}>
          {batch.map((spec, i) => {
            const url = `${BASE}?s=${encodeURIComponent(encodeSpec(spec))}`;
            const name = `ciaobag-${spec.template}-${spec.format}-${seed}-${i}.png`;
            return (
              <div key={url} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <img src={url} alt={spec.headline}
                  style={{ width: '100%', aspectRatio: spec.format === '1x1' ? '1 / 1' : '9 / 16', objectFit: 'cover', borderRadius: 12, background: '#fff', border: '1px solid rgba(43,49,47,0.12)' }} />
                <button className="btn-add" onClick={() => download(url, name)}>Stáhnout PNG</button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
