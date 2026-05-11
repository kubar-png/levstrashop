'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import { ParcelShopPicker, type SelectedParcelShop } from '@/components/ParcelShopPicker';

type ShippingMode = 'home' | 'parcelshop';

const HOME_CENTS   = 19900;
const PARCEL_CENTS = 12900;
const FREE_THRESHOLD = 150000;

export default function CartPage() {
  const { items, setQty, remove, totalCents, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [mode, setMode]       = useState<ShippingMode>('home');
  const [shop, setShop]       = useState<SelectedParcelShop | null>(null);
  const [email, setEmail]     = useState('');

  const subtotal     = totalCents();
  const freeShipping = subtotal >= FREE_THRESHOLD;
  const shippingCents = freeShipping ? 0 : mode === 'home' ? HOME_CENTS : PARCEL_CENTS;
  const total        = subtotal + shippingCents;
  const progress     = Math.min((subtotal / FREE_THRESHOLD) * 100, 100);

  async function checkout() {
    if (mode === 'parcelshop' && !shop) { setError('Vyberte prosím výdejnu PPL ParcelShop.'); return; }
    if (!email || !email.includes('@'))  { setError('Zadejte prosím platný e-mail.');          return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, email, shippingMode: mode, parcelShop: shop }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Chyba při platbě');
      const { url } = await res.json();
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chyba při platbě');
      setLoading(false);
    }
  }

  /* ── Empty state ── */
  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <svg viewBox="0 0 56 56" width="52" height="52" fill="none" aria-hidden="true" className="mb-6 opacity-25">
          <circle cx="28" cy="28" r="27" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--color-ink)' }} />
          <path d="M17 28h22M28 17v22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: 'var(--color-ink)' }} />
        </svg>
        <p className="font-serif" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: 'var(--color-forest)' }}>
          Košík je prázdný.
        </p>
        <p className="font-poppins-light mt-3" style={{ fontSize: '14px', color: 'var(--color-gray-warm)', maxWidth: '260px' }}>
          Ještě jste nic nevybrali — prozkoumejte naši kolekci.
        </p>
        <Link
          href="/shop"
          className="marina-btn mt-8 inline-flex items-center rounded-xl border-2 px-8 py-3.5 font-poppins-semibold"
          style={{ borderColor: 'var(--color-ink)', fontSize: '14px' }}
        >
          <span className="marina-btn-text" style={{ color: 'var(--color-ink)' }}>
            Prohlédnout e-shop
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pb-24 pt-28 md:px-6 md:pt-32">
      <div className="mx-auto max-w-6xl">

        {/* ── Page heading ── */}
        <div className="mb-10">
          <p
            className="font-serif"
            style={{ fontSize: '12px', letterSpacing: '0.12em', color: 'var(--color-forest)', textTransform: 'uppercase' }}
          >
            Nákup
          </p>
          <h1
            className="font-poppins-semibold mt-0.5 leading-none"
            style={{ fontSize: 'clamp(2.6rem, 6vw, 5rem)', letterSpacing: '-0.035em', color: 'var(--color-ink)' }}
          >
            Košík
          </h1>
          <p className="font-poppins-light mt-1.5" style={{ fontSize: '13px', color: 'var(--color-gray-warm)' }}>
            {items.length}&nbsp;{items.length === 1 ? 'položka' : items.length < 5 ? 'položky' : 'položek'}
          </p>
        </div>

        {/* ── Two-column layout ── */}
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-8 xl:grid-cols-[1fr_420px] xl:gap-12">

          {/* ── LEFT: Item list ── */}
          <div className="space-y-3">
            <div className="overflow-hidden rounded-3xl" style={{ background: 'var(--color-cream)' }}>
              {items.map((item, i) => (
                <div
                  key={item.variantSku}
                  className="flex gap-4 sm:gap-5"
                  style={{
                    padding: '20px 24px',
                    borderBottom: i < items.length - 1 ? '1px solid rgba(43,49,47,0.08)' : undefined,
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    className="relative shrink-0 overflow-hidden rounded-2xl"
                    style={{ width: '84px', height: '104px', background: '#e5e1d8' }}
                  >
                    {item.image && (
                      <Image src={item.image} alt={item.title} fill className="object-cover" sizes="84px" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 min-w-0 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/shop/p/${item.slug}`}
                        className="font-poppins-semibold leading-tight hover:opacity-50 transition-opacity duration-200"
                        style={{ fontSize: '14px', color: 'var(--color-ink)' }}
                      >
                        {item.title}
                      </Link>
                      <span
                        className="font-poppins-semibold shrink-0"
                        style={{ fontSize: '14px', color: 'var(--color-ink)' }}
                      >
                        {formatPrice(item.priceCents * item.qty)}
                      </span>
                    </div>

                    {[item.size, item.color].filter(Boolean).length > 0 && (
                      <p
                        className="font-poppins-regular mt-0.5"
                        style={{ fontSize: '11px', color: 'var(--color-gray-warm)' }}
                      >
                        {[item.size, item.color].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p
                      className="font-poppins-light mt-0.5"
                      style={{ fontSize: '11px', color: 'var(--color-gray-warm)' }}
                    >
                      {formatPrice(item.priceCents)} / ks
                    </p>

                    {/* Qty + remove */}
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setQty(item.variantSku, item.qty - 1)}
                          aria-label="Ubrat"
                          className="flex h-7 w-7 items-center justify-center rounded-full transition-opacity hover:opacity-60"
                          style={{ background: 'var(--color-ink)', color: '#fff' }}
                        >
                          <span style={{ fontSize: '15px', lineHeight: 1 }}>−</span>
                        </button>
                        <span
                          className="font-poppins-semibold w-7 text-center tabular-nums"
                          style={{ fontSize: '13px', color: 'var(--color-ink)' }}
                        >
                          {item.qty}
                        </span>
                        <button
                          onClick={() => setQty(item.variantSku, item.qty + 1)}
                          aria-label="Přidat"
                          className="flex h-7 w-7 items-center justify-center rounded-full transition-opacity hover:opacity-60"
                          style={{ background: 'var(--color-ink)', color: '#fff' }}
                        >
                          <span style={{ fontSize: '15px', lineHeight: 1 }}>+</span>
                        </button>
                      </div>
                      <button
                        onClick={() => remove(item.variantSku)}
                        className="font-poppins-regular transition-opacity hover:opacity-40"
                        style={{ fontSize: '11px', color: 'var(--color-gray-warm)' }}
                      >
                        Odebrat
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Free shipping progress */}
            {!freeShipping ? (
              <div className="rounded-2xl px-5 py-4" style={{ background: 'var(--color-sky-light)' }}>
                <p className="font-poppins-semibold" style={{ fontSize: '12px', color: 'var(--color-forest)' }}>
                  Do dopravy zdarma zbývá {formatPrice(FREE_THRESHOLD - subtotal)}
                </p>
                <div
                  className="mt-2.5 h-1 w-full overflow-hidden rounded-full"
                  style={{ background: 'rgba(45,81,67,0.18)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progress}%`, background: 'var(--color-forest)' }}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl px-5 py-3.5" style={{ background: 'var(--color-lime)' }}>
                <p className="font-poppins-semibold" style={{ fontSize: '12px', color: 'var(--color-ink)' }}>
                  ✓&nbsp; Máte dopravu zdarma
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT: Summary panel ── */}
          <div className="mt-4 space-y-3 lg:mt-0">
            <div className="sticky top-28 space-y-3">

              {/* Shipping */}
              <div className="rounded-3xl p-6" style={{ background: 'var(--color-cream)' }}>
                <p
                  className="font-poppins-semibold"
                  style={{ fontSize: '11px', letterSpacing: '0.08em', color: 'var(--color-gray-warm)', textTransform: 'uppercase' }}
                >
                  Doprava
                </p>
                <div className="mt-3.5 space-y-2">
                  <ShippingCard active={mode === 'home'} onClick={() => setMode('home')}
                    title="PPL na adresu" price={freeShipping ? 'Zdarma' : '199 Kč'} eta="1–2 pracovní dny" />
                  <ShippingCard active={mode === 'parcelshop'} onClick={() => setMode('parcelshop')}
                    title="PPL ParcelShop" price={freeShipping ? 'Zdarma' : '129 Kč'} eta="1–3 pracovní dny" />
                </div>

                {mode === 'parcelshop' && (
                  <div className="mt-4">
                    <ParcelShopPicker onSelect={setShop} />
                    {shop && (
                      <div
                        className="mt-3 rounded-xl px-4 py-3"
                        style={{ background: 'rgba(45,81,67,0.07)' }}
                      >
                        <p className="font-poppins-semibold" style={{ fontSize: '12px', color: 'var(--color-forest)' }}>
                          {shop.name}
                        </p>
                        <p className="font-poppins-regular" style={{ fontSize: '11px', color: 'var(--color-gray-warm)' }}>
                          {shop.street}, {shop.city}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Contact */}
              <div className="rounded-3xl p-6" style={{ background: 'var(--color-cream)' }}>
                <p
                  className="font-poppins-semibold"
                  style={{ fontSize: '11px', letterSpacing: '0.08em', color: 'var(--color-gray-warm)', textTransform: 'uppercase' }}
                >
                  Kontakt
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="váš@email.cz"
                  required
                  className="mt-3.5 w-full rounded-xl px-4 py-3 font-poppins-regular outline-none"
                  style={{
                    background: 'var(--color-bg)',
                    border: '1.5px solid rgba(43,49,47,0.14)',
                    fontSize: '14px',
                    color: 'var(--color-ink)',
                    transition: 'border-color 0.18s ease',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-forest)')}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = 'rgba(43,49,47,0.14)')}
                />
              </div>

              {/* Totals + CTA */}
              <div className="rounded-3xl p-6" style={{ background: 'var(--color-forest)' }}>
                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="font-poppins-regular" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>
                      Mezisoučet
                    </span>
                    <span className="font-poppins-regular" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-poppins-regular" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>
                      Doprava
                    </span>
                    <span
                      className="font-poppins-regular"
                      style={{ fontSize: '13px', color: freeShipping ? 'var(--color-lime)' : 'rgba(255,255,255,0.55)' }}
                    >
                      {freeShipping ? 'Zdarma' : formatPrice(shippingCents)}
                    </span>
                  </div>
                  <div
                    className="flex justify-between pt-3"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    <span className="font-poppins-semibold" style={{ fontSize: '16px', color: '#fff' }}>
                      Celkem
                    </span>
                    <span className="font-poppins-semibold" style={{ fontSize: '16px', color: '#fff' }}>
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {error && (
                  <p
                    className="mt-4 rounded-xl px-3 py-2.5 font-poppins-regular"
                    style={{ fontSize: '12px', color: '#fff', background: 'rgba(180,62,46,0.45)', lineHeight: 1.4 }}
                  >
                    {error}
                  </p>
                )}

                <button
                  onClick={checkout}
                  disabled={loading}
                  className="marina-btn mt-5 w-full rounded-xl border-2 py-4 font-poppins-semibold disabled:opacity-40"
                  style={{ borderColor: 'var(--color-lime)', fontSize: '15px', letterSpacing: '-0.01em' }}
                >
                  <span className="marina-btn-text" style={{ color: '#fff' }}>
                    {loading ? 'Přesměrování…' : 'K platbě →'}
                  </span>
                </button>

                <button
                  onClick={clear}
                  className="mt-4 w-full font-poppins-regular transition-opacity hover:opacity-40"
                  style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}
                >
                  Vyprázdnit košík
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShippingCard({
  active, onClick, title, price, eta,
}: {
  active: boolean; onClick: () => void;
  title: string; price: string; eta: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-3.5 text-left transition-all duration-200"
      style={{
        background: active ? 'var(--color-forest-deep)' : 'var(--color-bg)',
        border: `1.5px solid ${active ? 'transparent' : 'rgba(43,49,47,0.10)'}`,
        outline: active ? '1.5px solid var(--color-forest-deep)' : 'none',
      }}
    >
      <div>
        <p className="font-poppins-semibold" style={{ fontSize: '13px', color: active ? '#fff' : 'var(--color-ink)' }}>
          {title}
        </p>
        <p className="font-poppins-light mt-0.5" style={{ fontSize: '11px', color: active ? 'rgba(255,255,255,0.5)' : 'var(--color-gray-warm)' }}>
          {eta}
        </p>
      </div>
      <p
        className="font-poppins-semibold ml-4 shrink-0"
        style={{ fontSize: '13px', color: active ? 'var(--color-lime)' : 'var(--color-ink)' }}
      >
        {price}
      </p>
    </button>
  );
}
