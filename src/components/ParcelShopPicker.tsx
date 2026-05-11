'use client';

import { useState } from 'react';

export type SelectedParcelShop = {
  id: string;
  name: string;
  street: string;
  city: string;
  zip: string;
};

type Shop = SelectedParcelShop & { openingHours?: string };

export function ParcelShopPicker({
  onSelect,
}: {
  onSelect: (shop: SelectedParcelShop | null) => void;
}) {
  const [zip, setZip] = useState('');
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);

  async function search() {
    setLoading(true);
    setError(null);
    setShops([]);
    try {
      const res = await fetch(`/api/ppl/parcelshops?zip=${encodeURIComponent(zip)}`);
      if (!res.ok) throw new Error((await res.json()).error || 'Chyba při vyhledávání');
      const data: { shops: Shop[] } = await res.json();
      setShops(data.shops);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chyba při vyhledávání');
    } finally {
      setLoading(false);
    }
  }

  function pick(shop: Shop) {
    setChosen(shop.id);
    onSelect({ id: shop.id, name: shop.name, street: shop.street, city: shop.city, zip: shop.zip });
  }

  return (
    <div
      className="p-5"
      style={{
        background: '#fff',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <h2
        className="font-poppins-semibold"
        style={{ fontSize: 'var(--text-h3)', color: 'var(--color-forest)' }}
      >
        Vyzvednutí na PPL ParcelShopu
      </h2>
      <p
        className="mt-1"
        style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}
      >
        Zadejte PSČ a vyberte nejbližší výdejnu.
      </p>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          placeholder="612 00"
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\s/g, ''))}
          aria-label="PSČ"
          className="flex-1 outline-none transition-colors"
          style={{
            padding: '0.6rem 1rem',
            minHeight: 44,
            borderRadius: '999px',
            border: '1.5px solid var(--color-border-strong)',
            fontSize: 'var(--text-small)',
            color: 'var(--color-ink)',
            background: '#fff',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-forest)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
        />
        <button
          type="button"
          onClick={search}
          disabled={loading || zip.length < 5}
          aria-disabled={loading || zip.length < 5}
          className="btn-secondary"
          style={{ borderRadius: '999px' }}
        >
          {loading ? 'Hledám…' : 'Najít'}
        </button>
      </div>

      {error && (
        <p
          className="mt-3 font-poppins-medium"
          style={{ fontSize: 'var(--text-small)', color: 'var(--color-danger)' }}
        >
          {error}
        </p>
      )}

      {shops.length > 0 && (
        <ul
          className="mt-5 overflow-y-auto"
          style={{
            maxHeight: '20rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          {shops.map((shop, i) => {
            const isChosen = chosen === shop.id;
            return (
              <li
                key={shop.id}
                style={{
                  borderBottom: i < shops.length - 1 ? '1px solid var(--color-border-subtle)' : undefined,
                }}
              >
                <button
                  type="button"
                  onClick={() => pick(shop)}
                  aria-pressed={isChosen}
                  className="flex w-full flex-col gap-1 text-left transition"
                  style={{
                    padding: '0.85rem 1rem',
                    background: isChosen ? 'var(--color-forest)' : 'transparent',
                    color: isChosen ? '#fff' : 'var(--color-ink)',
                  }}
                >
                  <span
                    className="font-poppins-semibold"
                    style={{ fontSize: 'var(--text-small)' }}
                  >
                    {shop.name}
                  </span>
                  <span
                    style={{
                      fontSize: 'var(--text-micro)',
                      color: isChosen ? 'rgba(255,255,255,0.85)' : 'var(--color-text-muted)',
                    }}
                  >
                    {shop.street}, {shop.city} {shop.zip}
                  </span>
                  {shop.openingHours && (
                    <span
                      style={{
                        fontSize: 'var(--text-micro)',
                        color: isChosen ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)',
                      }}
                    >
                      {shop.openingHours}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
