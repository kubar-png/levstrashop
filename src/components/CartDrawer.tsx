'use client';

/**
 * Slide-in mini cart that opens after Add-to-Cart and from the header
 * cart icon. Provides confirmation + free-shipping nudge + two CTAs
 * (Pokračovat v nákupu / K pokladně) so the buyer stays in flow.
 *
 * Portaled to <body> for the same reason as MobileMenu — escapes the
 * SiteHeader's backdrop-filter containing block.
 */

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/format';

const FREE_THRESHOLD_CENTS = 150000;

export function CartDrawer() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const open = useCart((s) => s.drawerOpen);
  const close = useCart((s) => s.closeDrawer);
  const subtotal = useCart((s) => s.totalCents());

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  /* Close on Escape — small accessibility touch. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const freeShipping = subtotal >= FREE_THRESHOLD_CENTS;
  const remaining = Math.max(0, FREE_THRESHOLD_CENTS - subtotal);
  const progress = Math.min((subtotal / FREE_THRESHOLD_CENTS) * 100, 100);

  const overlay = (
    <>
      <div
        aria-hidden="true"
        onClick={close}
        className={`fixed inset-0 z-[110] bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        style={{ backdropFilter: open ? 'blur(2px)' : undefined }}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Košík"
        aria-hidden={!open}
        className={`fixed inset-y-0 right-0 z-[111] flex w-[92%] max-w-[440px] flex-col shadow-[0_18px_50px_-12px_rgba(0,0,0,0.4)] transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: '#fff' }}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <div
          className="flex shrink-0 items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
        >
          <div>
            <p
              className="font-poppins-semibold"
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
              }}
            >
              Váš košík
            </p>
            <h2
              className="font-serif leading-none"
              style={{ fontSize: 'var(--text-h3)', color: 'var(--color-ink)', marginTop: 2 }}
            >
              {items.length === 0
                ? 'Prázdný'
                : `${items.length} ${items.length === 1 ? 'položka' : items.length < 5 ? 'položky' : 'položek'}`}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Zavřít košík"
            onClick={close}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-[var(--color-cream)]"
            style={{ color: 'var(--color-ink)' }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
              <line x1="5" y1="5" x2="17" y2="17" stroke="currentColor" strokeWidth="1.6" />
              <line x1="17" y1="5" x2="5" y2="17" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>

        {/* ── Free-shipping progress (only when items exist) ── */}
        {items.length > 0 && (
          <div
            className="shrink-0 px-5 py-3.5"
            style={{
              background: freeShipping ? 'var(--color-lime)' : 'var(--color-cream)',
              borderBottom: '1px solid var(--color-border-subtle)',
            }}
          >
            {freeShipping ? (
              <p
                className="font-poppins-semibold flex items-center gap-2"
                style={{ fontSize: 'var(--text-small)', color: 'var(--color-ink)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Doprava zdarma odemčena
              </p>
            ) : (
              <>
                <p
                  className="font-poppins-medium"
                  style={{ fontSize: 'var(--text-small)', color: 'var(--color-forest)' }}
                >
                  Do dopravy zdarma zbývá{' '}
                  <span className="font-poppins-semibold tabular-nums">
                    {formatPrice(remaining)}
                  </span>
                </p>
                <div
                  className="mt-2 h-1 w-full overflow-hidden rounded-full"
                  style={{ background: 'rgba(45,81,67,0.18)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progress}%`, background: 'var(--color-forest)' }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Items list (scrollable) ──────────────────── */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
              <svg
                viewBox="0 0 56 56"
                width="44"
                height="44"
                fill="none"
                aria-hidden="true"
                className="mb-5 opacity-30"
              >
                <circle cx="28" cy="28" r="27" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--color-ink)' }} />
                <path d="M17 28h22M28 17v22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: 'var(--color-ink)' }} />
              </svg>
              <p
                className="font-serif"
                style={{ fontSize: 'var(--text-h3)', color: 'var(--color-forest)' }}
              >
                Zatím prázdno.
              </p>
              <p
                className="font-poppins-light mt-2"
                style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}
              >
                Vyberte si něco z e-shopu — pošleme do 1–2 dnů.
              </p>
              <Link
                href="/shop"
                onClick={close}
                className="btn-secondary mt-6"
              >
                Prohlédnout e-shop
              </Link>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
              {items.map((item) => (
                <li key={item.variantSku} className="flex gap-3 px-5 py-4">
                  <Link
                    href={`/shop/p/${item.slug}`}
                    onClick={close}
                    className="relative h-20 w-20 shrink-0 overflow-hidden"
                    style={{
                      background: 'var(--color-cream)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-contain"
                      />
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/shop/p/${item.slug}`}
                        onClick={close}
                        className="font-poppins-semibold truncate hover:underline"
                        style={{ fontSize: 'var(--text-small)', color: 'var(--color-ink)' }}
                      >
                        {item.title}
                      </Link>
                      <button
                        type="button"
                        aria-label="Odebrat položku"
                        onClick={() => remove(item.variantSku)}
                        className="shrink-0 transition-colors hover:opacity-60"
                        style={{
                          color: 'var(--color-text-muted)',
                          padding: 4,
                          marginRight: -4,
                          marginTop: -2,
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                          <line x1="3" y1="3" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" />
                          <line x1="11" y1="3" x2="3" y2="11" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </button>
                    </div>

                    {[item.size, item.color].filter(Boolean).length > 0 && (
                      <p
                        className="font-poppins-regular mt-0.5"
                        style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}
                      >
                        {[item.size, item.color].filter(Boolean).join(' · ')}
                      </p>
                    )}

                    <div className="mt-auto flex items-end justify-between pt-3">
                      <div
                        className="inline-flex items-center"
                        style={{
                          border: '1px solid var(--color-border-strong)',
                          borderRadius: 999,
                        }}
                      >
                        <button
                          type="button"
                          aria-label="Ubrat"
                          onClick={() => setQty(item.variantSku, item.qty - 1)}
                          className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-[var(--color-cream)]"
                          style={{ color: 'var(--color-ink)', borderRadius: 999 }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                            <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.6" />
                          </svg>
                        </button>
                        <span
                          className="font-poppins-semibold w-6 text-center tabular-nums"
                          style={{ fontSize: 'var(--text-small)', color: 'var(--color-ink)' }}
                        >
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          aria-label="Přidat"
                          onClick={() => setQty(item.variantSku, item.qty + 1)}
                          className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-[var(--color-cream)]"
                          style={{ color: 'var(--color-ink)', borderRadius: 999 }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                            <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.6" />
                            <line x1="6" y1="2" x2="6" y2="10" stroke="currentColor" strokeWidth="1.6" />
                          </svg>
                        </button>
                      </div>
                      <span
                        className="font-poppins-semibold tabular-nums"
                        style={{ fontSize: 'var(--text-small)', color: 'var(--color-ink)' }}
                      >
                        {formatPrice(item.priceCents * item.qty)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Footer with subtotal + CTAs ─────────────── */}
        {items.length > 0 && (
          <div
            className="shrink-0"
            style={{
              borderTop: '1px solid var(--color-border-subtle)',
              background: '#ffffff',
              padding: '16px 20px calc(16px + env(safe-area-inset-bottom)) 20px',
            }}
          >
            <div className="flex items-baseline justify-between">
              <span
                className="font-poppins-regular"
                style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}
              >
                Mezisoučet
              </span>
              <span
                className="font-poppins-semibold tabular-nums"
                style={{ fontSize: 'var(--text-h3)', color: 'var(--color-ink)' }}
              >
                {formatPrice(subtotal)}
              </span>
            </div>
            <p
              className="font-poppins-light mt-1"
              style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}
            >
              Dopravu a kontakt vyplníte na další stránce.
            </p>

            <Link
              href="/cart"
              onClick={close}
              className="cta-shine font-poppins-semibold mt-4 flex w-full items-center justify-between overflow-hidden transition-transform duration-200 active:scale-[0.985]"
              style={{
                background: 'var(--color-forest)',
                color: '#ffffff',
                padding: '18px 20px',
                borderRadius: 'var(--radius-lg)',
                minHeight: 56,
                boxShadow: '0 10px 24px -10px rgba(45,81,67,0.55)',
              }}
            >
              <span className="flex flex-col items-start leading-tight">
                <span
                  className="font-poppins-regular"
                  style={{
                    fontSize: '0.62rem',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--color-lime)',
                  }}
                >
                  Váš košík
                </span>
                <span style={{ fontSize: '1.05rem', lineHeight: 1.1 }}>Prohlédnout košík</span>
              </span>
              <span
                aria-hidden="true"
                className="cta-circle flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ background: 'var(--color-lime)', color: 'var(--color-ink)' }}
              >
                <svg className="cta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12h13M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>

            <button
              type="button"
              onClick={close}
              className="font-poppins-medium mt-3 block w-full text-center transition-opacity hover:opacity-70"
              style={{
                fontSize: 'var(--text-small)',
                color: 'var(--color-text-muted)',
                padding: '0.5rem',
              }}
            >
              Pokračovat v nákupu
            </button>
          </div>
        )}
      </aside>
    </>
  );

  return mounted ? createPortal(overlay, document.body) : null;
}
