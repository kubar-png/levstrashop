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
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="text-2xl font-medium">Vyzvednutí na PPL ParcelShopu</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Zadejte PSČ a vyberte nejbližší výdejnu.
      </p>

      <div className="mt-5 flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          placeholder="612 00"
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\s/g, ''))}
          className="flex-1 rounded-full border border-neutral-300 px-5 py-2.5 text-sm focus:border-neutral-900 focus:outline-none"
        />
        <button
          onClick={search}
          disabled={loading || zip.length < 5}
          className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:bg-neutral-400"
        >
          {loading ? 'Hledám…' : 'Najít'}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {shops.length > 0 && (
        <ul className="mt-5 max-h-72 divide-y divide-neutral-200 overflow-y-auto rounded-lg border border-neutral-200">
          {shops.map((shop) => (
            <li key={shop.id}>
              <button
                onClick={() => pick(shop)}
                className={`flex w-full flex-col gap-1 px-4 py-3 text-left text-sm transition ${
                  chosen === shop.id ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-50'
                }`}
              >
                <span className="font-medium">{shop.name}</span>
                <span className={chosen === shop.id ? 'text-neutral-300' : 'text-neutral-500'}>
                  {shop.street}, {shop.city} {shop.zip}
                </span>
                {shop.openingHours && (
                  <span
                    className={`text-xs ${
                      chosen === shop.id ? 'text-neutral-400' : 'text-neutral-500'
                    }`}
                  >
                    {shop.openingHours}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
