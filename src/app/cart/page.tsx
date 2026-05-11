'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/format';

export default function CartPage() {
  const { items, setQty, remove, totalCents, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
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
      <h1 className="text-4xl font-semibold tracking-tight">Košík</h1>

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

          <div className="mt-10 border-t border-neutral-200 pt-6">
            <div className="flex justify-between text-lg font-medium">
              <span>Mezisoučet</span>
              <span>{formatPrice(totalCents())}</span>
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              Doprava se vypočítá při platbě (PPL). Nad 1 500 Kč doprava zdarma.
            </p>

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
