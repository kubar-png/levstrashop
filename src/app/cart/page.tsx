'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import { ParcelShopPicker, type SelectedParcelShop } from '@/components/ParcelShopPicker';
import { Eyebrow, FormField } from '@/components/ui';
import { NewsletterSignup } from '@/components/NewsletterSignup';

type ShippingMode = 'home' | 'parcelshop';

const HOME_CENTS   = 19900;
const PARCEL_CENTS = 12900;
const FREE_THRESHOLD = 150000;

export default function CartPage() {
  const { items, setQty, remove, totalCents, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [mode, setMode]       = useState<ShippingMode>('home');
  const [shop, setShop]       = useState<SelectedParcelShop | null>(null);
  const [email, setEmail]     = useState('');

  const subtotal     = totalCents();
  const freeShipping = subtotal >= FREE_THRESHOLD;
  const shippingCents = freeShipping ? 0 : mode === 'home' ? HOME_CENTS : PARCEL_CENTS;
  const total        = subtotal + shippingCents;
  const progress     = Math.min((subtotal / FREE_THRESHOLD) * 100, 100);

  function validateEmail(v: string): string | null {
    if (!v) return 'Zadejte prosím e-mail.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Zadejte prosím platný e-mail.';
    return null;
  }

  async function checkout() {
    if (mode === 'parcelshop' && !shop) { setError('Vyberte prosím výdejnu PPL ParcelShop.'); return; }
    const emailErr = validateEmail(email);
    if (emailErr) {
      setEmailError(emailErr);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    setEmailError(null);
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
      <div className="flex min-h-screen flex-col items-center justify-start px-6 pt-28 text-center md:pt-32">
        <svg viewBox="0 0 56 56" width="52" height="52" fill="none" aria-hidden="true" className="mb-6 opacity-25">
          <circle cx="28" cy="28" r="27" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--color-ink)' }} />
          <path d="M17 28h22M28 17v22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: 'var(--color-ink)' }} />
        </svg>
        <p
          className="font-serif"
          style={{ fontSize: 'var(--text-h1)', color: 'var(--color-forest)' }}
        >
          Košík je prázdný.
        </p>
        <p
          className="font-poppins-light mt-3"
          style={{ fontSize: 'var(--text-body)', color: 'var(--color-text-muted)', maxWidth: '260px' }}
        >
          Ještě jste nic nevybrali — prozkoumejte naši kolekci.
        </p>
        <Link href="/shop" className="btn-secondary mt-8">
          Prohlédnout e-shop
        </Link>

        {/* Highest-intent moment to capture an email — they care, just no items yet. */}
        <div
          className="mt-16 w-full max-w-md p-6 text-left"
          style={{
            background: 'var(--color-forest)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <p
            className="font-poppins-semibold"
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--color-lime)',
            }}
          >
            10 % sleva na první nákup
          </p>
          <p
            className="font-serif mt-2"
            style={{ fontSize: 'var(--text-h3)', color: '#fff', lineHeight: 1.15 }}
          >
            Než se rozhodnete — pošleme vám slevu na e-mail.
          </p>
          <div className="mt-4">
            <NewsletterSignup variant="dark" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pb-24 pt-28 md:px-6 md:pt-32">
      <div className="mx-auto max-w-6xl">

        {/* ── Page heading ── */}
        <div className="mb-10">
          <Eyebrow tone="forest" serif size="md">Nákup</Eyebrow>
          <h1
            className="font-poppins-semibold mt-1 leading-none"
            style={{
              fontSize: 'var(--text-display)',
              letterSpacing: '-0.035em',
              color: 'var(--color-ink)',
            }}
          >
            Košík
          </h1>
          <p
            className="font-poppins-light mt-1.5"
            style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}
          >
            {items.length}&nbsp;{items.length === 1 ? 'položka' : items.length < 5 ? 'položky' : 'položek'}
          </p>
        </div>

        {/* ── Two-column layout ── */}
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-8 xl:grid-cols-[1fr_420px] xl:gap-12">

          {/* ── LEFT: Item list ── */}
          <div className="space-y-3">
            <div
              className="overflow-hidden"
              style={{
                background: 'var(--color-cream)',
                borderRadius: 'var(--radius-xl)',
              }}
            >
              {items.map((item, i) => (
                <div
                  key={item.variantSku}
                  className="flex gap-4 sm:gap-5"
                  style={{
                    padding: '20px 24px',
                    borderBottom: i < items.length - 1 ? '1px solid var(--color-border-subtle)' : undefined,
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    className="relative shrink-0 overflow-hidden"
                    style={{
                      width: '84px',
                      height: '104px',
                      background: '#e5e1d8',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    {item.image && (
                      <Image src={item.image} alt={item.title} fill className="object-contain" sizes="84px" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 min-w-0 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/shop/p/${item.slug}`}
                        className="font-poppins-semibold leading-tight hover:opacity-50 transition-opacity duration-200"
                        style={{ fontSize: 'var(--text-body)', color: 'var(--color-ink)' }}
                      >
                        {item.title}
                      </Link>
                      <span
                        className="font-poppins-semibold shrink-0"
                        style={{ fontSize: 'var(--text-body)', color: 'var(--color-ink)' }}
                      >
                        {formatPrice(item.priceCents * item.qty)}
                      </span>
                    </div>

                    {[item.size, item.color].filter(Boolean).length > 0 && (
                      <p
                        className="font-poppins-regular mt-0.5"
                        style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}
                      >
                        {[item.size, item.color].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p
                      className="font-poppins-light mt-0.5"
                      style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}
                    >
                      {formatPrice(item.priceCents)} / ks
                    </p>

                    {/* Qty + remove */}
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setQty(item.variantSku, item.qty - 1)}
                          aria-label="Ubrat"
                          className="flex h-11 w-11 items-center justify-center rounded-full transition-opacity hover:opacity-70"
                          style={{ color: 'var(--color-ink)' }}
                        >
                          <span
                            className="flex h-7 w-7 items-center justify-center rounded-full"
                            style={{ background: 'var(--color-ink)', color: '#fff', fontSize: '15px', lineHeight: 1 }}
                          >−</span>
                        </button>
                        <span
                          className="font-poppins-semibold w-7 text-center tabular-nums"
                          style={{ fontSize: 'var(--text-small)', color: 'var(--color-ink)' }}
                        >
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(item.variantSku, item.qty + 1)}
                          aria-label="Přidat"
                          className="flex h-11 w-11 items-center justify-center rounded-full transition-opacity hover:opacity-70"
                          style={{ color: 'var(--color-ink)' }}
                        >
                          <span
                            className="flex h-7 w-7 items-center justify-center rounded-full"
                            style={{ background: 'var(--color-ink)', color: '#fff', fontSize: '15px', lineHeight: 1 }}
                          >+</span>
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(item.variantSku)}
                        className="btn-destructive"
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
              <div
                className="px-5 py-4"
                style={{
                  background: 'var(--color-sky-light)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <p
                  className="font-poppins-semibold"
                  style={{ fontSize: 'var(--text-small)', color: 'var(--color-forest)' }}
                >
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
              <div
                className="px-5 py-3.5"
                style={{
                  background: 'var(--color-lime)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <p
                  className="font-poppins-semibold"
                  style={{ fontSize: 'var(--text-small)', color: 'var(--color-ink)' }}
                >
                  ✓&nbsp; Máte dopravu zdarma
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT: Summary panel ── */}
          <div className="mt-4 space-y-3 lg:mt-0">
            <div className="sticky top-28 space-y-3">

              {/* Shipping */}
              <div
                className="p-6"
                style={{ background: 'var(--color-cream)', borderRadius: 'var(--radius-lg)' }}
              >
                <Eyebrow>Doprava</Eyebrow>
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
                        className="mt-3 px-4 py-3"
                        style={{
                          background: 'rgba(45,81,67,0.07)',
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <p
                          className="font-poppins-semibold"
                          style={{ fontSize: 'var(--text-small)', color: 'var(--color-forest)' }}
                        >
                          {shop.name}
                        </p>
                        <p
                          className="font-poppins-regular"
                          style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}
                        >
                          {shop.street}, {shop.city}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Contact */}
              <div
                className="p-6"
                style={{ background: 'var(--color-cream)', borderRadius: 'var(--radius-lg)' }}
              >
                <Eyebrow>Kontakt</Eyebrow>
                <div className="mt-3.5">
                  <FormField
                    label=""
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    onBlur={() => {
                      if (email) setEmailError(validateEmail(email));
                    }}
                    placeholder="váš@email.cz"
                    required
                    autoComplete="email"
                    error={emailError ?? undefined}
                    aria-label="E-mail"
                  />
                </div>
              </div>

              <PromoCodeField />


              {/* Totals + CTA */}
              <div
                className="p-6"
                style={{ background: 'var(--color-forest)', borderRadius: 'var(--radius-lg)' }}
              >
                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span
                      className="font-poppins-regular"
                      style={{ fontSize: 'var(--text-small)', color: 'rgba(255,255,255,0.65)' }}
                    >
                      Mezisoučet
                    </span>
                    <span
                      className="font-poppins-regular"
                      style={{ fontSize: 'var(--text-small)', color: 'rgba(255,255,255,0.65)' }}
                    >
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className="font-poppins-regular"
                      style={{ fontSize: 'var(--text-small)', color: 'rgba(255,255,255,0.65)' }}
                    >
                      Doprava
                    </span>
                    <span
                      className="font-poppins-regular"
                      style={{
                        fontSize: 'var(--text-small)',
                        color: freeShipping ? 'var(--color-lime)' : 'rgba(255,255,255,0.65)',
                      }}
                    >
                      {freeShipping ? 'Zdarma' : formatPrice(shippingCents)}
                    </span>
                  </div>
                  <div
                    className="flex justify-between pt-3"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.18)' }}
                  >
                    <span
                      className="font-poppins-semibold"
                      style={{ fontSize: 'var(--text-lead)', color: '#fff' }}
                    >
                      Celkem
                    </span>
                    <span
                      className="font-poppins-semibold"
                      style={{ fontSize: 'var(--text-lead)', color: '#fff' }}
                    >
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {error && (
                  <p
                    className="mt-4 px-3 py-2.5 font-poppins-regular"
                    style={{
                      fontSize: 'var(--text-small)',
                      color: '#fff',
                      background: 'rgba(180,62,46,0.55)',
                      borderRadius: 'var(--radius-md)',
                      lineHeight: 1.4,
                    }}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={checkout}
                  disabled={loading}
                  className="btn-primary mt-5 w-full"
                  data-on-dark="true"
                  style={{ borderRadius: 'var(--radius-md)' }}
                >
                  {loading ? 'Přesměrování…' : 'K platbě →'}
                </button>

                <div className="mt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={clear}
                    className="font-poppins-regular transition-opacity hover:opacity-70"
                    style={{
                      fontSize: 'var(--text-small)',
                      color: 'rgba(255,255,255,0.55)',
                      minHeight: 32,
                      padding: '0.25rem 0.5rem',
                    }}
                  >
                    Vyprázdnit košík
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PromoCodeField() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'invalid' | 'applied'>('idle');

  /* Visual affordance only for now — wiring to checkout discount flow is a
     separate task. Signals "promotions exist" to shoppers searching elsewhere. */
  function apply() {
    if (!code.trim()) return;
    setStatus('invalid');
  }

  return (
    <div
      className="overflow-hidden"
      style={{ background: 'var(--color-cream)', borderRadius: 'var(--radius-lg)' }}
    >
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="font-poppins-medium flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-[rgba(43,49,47,0.04)]"
          style={{ fontSize: 'var(--text-small)', color: 'var(--color-ink)' }}
        >
          <span className="inline-flex items-center gap-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M12 7v10" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2 2" />
            </svg>
            Mám slevový kód
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <div className="p-6">
          <Eyebrow>Slevový kód</Eyebrow>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (status !== 'idle') setStatus('idle');
              }}
              placeholder="VANOCE2026"
              autoComplete="off"
              spellCheck={false}
              className="font-poppins-regular flex-1 px-3.5 py-2.5 outline-none"
              style={{
                fontSize: 'var(--text-small)',
                color: 'var(--color-ink)',
                background: '#fff',
                border: '1.5px solid var(--color-border-strong)',
                borderRadius: 'var(--radius-md)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            />
            <button
              type="button"
              onClick={apply}
              className="font-poppins-semibold px-4 py-2.5 transition-opacity hover:opacity-85"
              style={{
                background: 'var(--color-ink)',
                color: '#fff',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-small)',
              }}
            >
              Uplatnit
            </button>
          </div>
          {status === 'invalid' && (
            <p
              className="font-poppins-regular mt-2.5"
              style={{ fontSize: 'var(--text-micro)', color: 'var(--color-danger)' }}
              role="alert"
            >
              Tento kód není platný nebo expiroval.
            </p>
          )}
          {status === 'applied' && (
            <p
              className="font-poppins-medium mt-2.5"
              style={{ fontSize: 'var(--text-micro)', color: 'var(--color-forest)' }}
            >
              ✓ Sleva byla uplatněna.
            </p>
          )}
        </div>
      )}
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
      aria-pressed={active}
      className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left transition-all duration-200"
      style={{
        background: active ? 'var(--color-forest-deep)' : 'var(--color-bg)',
        border: `1.5px solid ${active ? 'transparent' : 'var(--color-border-subtle)'}`,
        outline: active ? '1.5px solid var(--color-forest-deep)' : 'none',
        borderRadius: 'var(--radius-md)',
        minHeight: 56,
      }}
    >
      <div>
        <p
          className="font-poppins-semibold"
          style={{ fontSize: 'var(--text-small)', color: active ? '#fff' : 'var(--color-ink)' }}
        >
          {title}
        </p>
        <p
          className="font-poppins-light mt-0.5"
          style={{
            fontSize: 'var(--text-micro)',
            color: active ? 'rgba(255,255,255,0.6)' : 'var(--color-text-muted)',
          }}
        >
          {eta}
        </p>
      </div>
      <p
        className="font-poppins-semibold ml-4 shrink-0"
        style={{
          fontSize: 'var(--text-small)',
          color: active ? 'var(--color-lime)' : 'var(--color-ink)',
        }}
      >
        {price}
      </p>
    </button>
  );
}
