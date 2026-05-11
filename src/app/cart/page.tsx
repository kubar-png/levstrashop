'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import { ParcelShopPicker, type SelectedParcelShop } from '@/components/ParcelShopPicker';

type ShippingMode = 'home' | 'parcelshop';

export default function CartPage() {
  const { items, setQty, remove, totalCents, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ShippingMode>('home');
  const [shop, setShop] = useState<SelectedParcelShop | null>(null);

  const FREE_SHIPPING_THRESHOLD = 150000; // 1500 Kč
  const subtotal = totalCents();
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  async function checkout() {
    if (mode === 'parcelshop' && !shop) {
      setError('Vyberte prosím výdejnu PPL ParcelShop.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shippingMode: mode, parcelShop: shop }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Chyba při platbě');
      const { url } = await res.json();
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chyba při platbě');
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Nákup</p>
      <h1 className="mt-2 text-5xl font-medium md:text-6xl">Košík</h1>

      {items.length === 0 ? (
        <div className="mt-12 text-neutral-600">
          Košík je prázdný.{' '}
          <Link href="/shop" className="underline">
            Pokračovat v nákupu
          </Link>
          .
        </div>
      ) : (
        <>
          <ul className="mt-10 divide-y divide-neutral-200">
            {items.map((item) => (
              <li key={item.variantSku} className="flex gap-5 py-6">
                <div className="relative h-24 w-20 overflow-hidden rounded-md bg-neutral-100">
                  {item.image && (
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <Link href={`/shop/p/${item.slug}`} className="font-medium hover:underline">
                      {item.title}
                    </Link>
                    <p className="font-medium">{formatPrice(item.priceCents * item.qty)}</p>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">
                    {[item.size, item.color].filter(Boolean).join(' · ')}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center gap-3 text-sm">
                      <button
                        onClick={() => setQty(item.variantSku, item.qty - 1)}
                        className="rounded-full border border-neutral-300 px-3 py-1 hover:border-neutral-900"
                      >
                        −
                      </button>
                      <span>{item.qty} ks</span>
                      <button
                        onClick={() => setQty(item.variantSku, item.qty + 1)}
                        className="rounded-full border border-neutral-300 px-3 py-1 hover:border-neutral-900"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => remove(item.variantSku)}
                      className="text-sm text-neutral-500 hover:text-red-600"
                    >
                      Odebrat
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Shipping mode picker */}
          <div className="mt-10">
            <h2 className="text-2xl font-medium">Doprava</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ShippingOption
                active={mode === 'home'}
                onClick={() => setMode('home')}
                title="PPL na adresu"
                price={freeShipping ? 'Zdarma' : '199 Kč'}
                eta="1–2 prac. dny"
              />
              <ShippingOption
                active={mode === 'parcelshop'}
                onClick={() => setMode('parcelshop')}
                title="PPL ParcelShop"
                price={freeShipping ? 'Zdarma' : '129 Kč'}
                eta="1–3 prac. dny"
              />
            </div>

            {mode === 'parcelshop' && (
              <div className="mt-5">
                <ParcelShopPicker onSelect={setShop} />
                {shop && (
                  <p className="mt-3 text-sm text-neutral-700">
                    Vybráno: <strong>{shop.name}</strong>, {shop.street}, {shop.city}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-10 border-t border-neutral-200 pt-6">
            <div className="flex justify-between text-lg font-medium">
              <span>Mezisoučet</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {!freeShipping && (
              <p className="mt-2 text-sm text-neutral-500">
                Do dopravy zdarma vám chybí{' '}
                <strong>{formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}</strong>.
              </p>
            )}
            {freeShipping && (
              <p className="mt-2 text-sm text-emerald-700">✓ Doprava zdarma</p>
            )}

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex gap-3">
              <button
                onClick={checkout}
                disabled={loading}
                className="flex-1 rounded-full bg-neutral-900 py-3 text-sm font-medium text-white hover:bg-neutral-700 disabled:bg-neutral-400"
              >
                {loading ? 'Přesměrování…' : 'K platbě'}
              </button>
              <button
                onClick={clear}
                className="rounded-full border border-neutral-300 px-6 py-3 text-sm hover:border-neutral-900"
              >
                Vyprázdnit
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ShippingOption({
  active,
  onClick,
  title,
  price,
  eta,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  price: string;
  eta: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
        active ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 hover:border-neutral-900'
      }`}
    >
      <div>
        <div className="font-medium">{title}</div>
        <div className={`text-sm ${active ? 'text-neutral-300' : 'text-neutral-500'}`}>{eta}</div>
      </div>
      <div className="font-medium">{price}</div>
    </button>
  );
}
