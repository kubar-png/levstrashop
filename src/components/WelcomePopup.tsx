'use client';

/**
 * Exit-intent welcome popup — "Sleva 10 % na první nákup".
 *
 * Captures an e-mail (stored as a Sanity `subscriber` via /api/welcome — no
 * Ecomail, no e-mail send), then reveals the VITEJTE10 code and auto-applies it
 * to the cart by re-validating through /api/discount/validate so the cart holds
 * a server-computed discountCents.
 *
 * Shown at most once per visitor (localStorage flag), triggered by either an
 * exit-intent gesture (cursor leaving toward the top of the viewport) or a
 * ~20s fallback timer. Never shown when a discount is already applied.
 *
 * Portaled to <body> like CartDrawer — escapes the SiteHeader backdrop-filter
 * containing block, and overlays the whole page.
 */

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCart, type AppliedDiscount } from '@/lib/cart';

const STORAGE_KEY = 'cb-welcome-popup';
const FALLBACK_DELAY_MS = 20_000;
/* Default shipping basis for the validate call. VITEJTE10 is a percent code,
   so shipping only affects free-shipping codes; the cart re-validates anyway. */
const DEFAULT_SHIPPING_CENTS = 19900;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Phase = 'form' | 'success';

export function WelcomePopup() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('form');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  /* Has the popup already been shown/dismissed this lifetime? */
  const seenRef = useRef(false);

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* storage may be unavailable (private mode) — ignore */
    }
  }, []);

  /* ── Trigger logic: exit-intent + fallback timer, once per visitor ── */
  useEffect(() => {
    setMounted(true);

    let alreadySeen = false;
    try {
      alreadySeen = localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      alreadySeen = false;
    }
    /* Don't reopen if a discount is already applied in the cart. */
    const hasDiscount = !!useCart.getState().discount;
    if (alreadySeen || hasDiscount) return;

    const reveal = () => {
      if (seenRef.current) return;
      /* Re-check at fire time — the buyer may have applied a code meanwhile. */
      if (useCart.getState().discount) return;
      seenRef.current = true;
      setOpen(true);
      /* Persist immediately so a reload won't show it again. */
      try {
        localStorage.setItem(STORAGE_KEY, '1');
      } catch {
        /* ignore */
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      /* Cursor leaving through the top edge → likely heading for the tab bar. */
      if (e.clientY <= 0 && !e.relatedTarget) reveal();
    };

    const timer = window.setTimeout(reveal, FALLBACK_DELAY_MS);
    document.addEventListener('mouseout', onMouseOut);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  /* Lock body scroll while open. */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  /* Esc to close + focus the input (or close button after success). */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => {
      if (phase === 'form') inputRef.current?.focus();
      else closeRef.current?.focus();
    }, 60);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
    };
  }, [open, phase, dismiss]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (busy) return;
    if (!EMAIL_RE.test(value)) {
      setError('Zadejte platný e-mail.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value }),
      });
      const data = (await res.json()) as
        | { ok: true; code: string; percent: number }
        | { ok: false; error: string };
      if (!data.ok) {
        setError(data.error || 'Něco se nepovedlo, zkuste to znovu.');
        return;
      }
      setCode(data.code);
      setPhase('success');
      /* Auto-apply to the cart — server computes a proper discountCents. */
      void applyToCart(data.code);
    } catch {
      setError('Něco se nepovedlo, zkuste to znovu.');
    } finally {
      setBusy(false);
    }
  }

  async function applyToCart(welcomeCode: string) {
    try {
      const subtotalCents = useCart.getState().totalCents();
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: welcomeCode,
          subtotalCents,
          shippingCents: DEFAULT_SHIPPING_CENTS,
        }),
      });
      const data = (await res.json()) as
        | {
            ok: true;
            code: string;
            type: AppliedDiscount['type'];
            value: number;
            discountCents: number;
            forcesFreeShipping: boolean;
          }
        | { ok: false; error: string };
      if (!data.ok) return;
      const applied: AppliedDiscount = {
        code: data.code,
        type: data.type,
        value: data.value,
        discountCents: data.discountCents,
        forcesFreeShipping: data.forcesFreeShipping,
      };
      useCart.getState().applyDiscount(applied);
    } catch {
      /* Non-fatal — the buyer can still type the code at checkout. */
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (!mounted || !open) return null;

  const modal = (
    <>
      <div
        aria-hidden="true"
        onClick={dismiss}
        className="fixed inset-0 z-[120] bg-black/45 transition-opacity duration-300"
        style={{ backdropFilter: 'blur(2px)' }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-popup-title"
        className="fixed inset-0 z-[121] flex items-end justify-center sm:items-center"
        style={{ padding: 'calc(env(safe-area-inset-top) + 1rem) 1rem calc(env(safe-area-inset-bottom) + 1rem)' }}
      >
        <div
          className="relative w-full max-w-[440px] overflow-hidden shadow-[0_24px_60px_-18px_rgba(0,0,0,0.5)]"
          style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)' }}
        >
          {/* ── Close ── */}
          <button
            ref={closeRef}
            type="button"
            aria-label="Zavřít"
            onClick={dismiss}
            className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-[var(--color-cream)]"
            style={{ color: 'var(--color-ink)' }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
              <line x1="5" y1="5" x2="17" y2="17" stroke="currentColor" strokeWidth="1.6" />
              <line x1="17" y1="5" x2="5" y2="17" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>

          {/* ── Lime header band ── */}
          <div
            className="px-7 pb-5 pt-8 text-center"
            style={{ background: 'var(--color-lime)' }}
          >
            <p
              className="font-poppins-semibold"
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--color-forest-deep)',
              }}
            >
              Vítejte u Ciaobag
            </p>
            <h2
              id="welcome-popup-title"
              className="font-serif mt-1 leading-tight"
              style={{ fontSize: 'var(--text-h2)', color: 'var(--color-ink)' }}
            >
              Sleva 10 % na první nákup
            </h2>
          </div>

          <div className="px-7 pb-7 pt-6">
            {phase === 'form' ? (
              <>
                <p
                  className="font-poppins-light text-center"
                  style={{ fontSize: 'var(--text-body)', color: 'var(--color-text-muted)' }}
                >
                  Nechte nám e-mail a obratem vám pošleme slevový kód na první
                  objednávku. Žádný spam — jen pár novinek.
                </p>

                <form onSubmit={submit} className="mt-5" noValidate>
                  <label htmlFor="welcome-email" className="sr-only">
                    Váš e-mail
                  </label>
                  <input
                    ref={inputRef}
                    id="welcome-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="vas@email.cz"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'welcome-email-error' : undefined}
                    className="font-poppins-regular w-full"
                    style={{
                      minHeight: 48,
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${error ? 'var(--color-danger)' : 'var(--color-border-strong)'}`,
                      fontSize: 'var(--text-body)',
                      color: 'var(--color-ink)',
                      background: '#fff',
                      outline: 'none',
                    }}
                  />
                  {error && (
                    <p
                      id="welcome-email-error"
                      role="alert"
                      className="font-poppins-regular mt-2"
                      style={{ fontSize: 'var(--text-small)', color: 'var(--color-danger)' }}
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    aria-disabled={busy}
                    className="btn-primary mt-4 w-full"
                    style={{ background: 'var(--color-forest)', color: '#fff', borderColor: 'var(--color-forest)' }}
                  >
                    {busy ? 'Odesílám…' : 'Odeslat'}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={dismiss}
                  className="font-poppins-medium mt-3 block w-full text-center transition-opacity hover:opacity-70"
                  style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', padding: '0.5rem' }}
                >
                  Teď ne, děkuji
                </button>
              </>
            ) : (
              <div className="text-center">
                <p
                  className="font-poppins-light"
                  style={{ fontSize: 'var(--text-body)', color: 'var(--color-text-muted)' }}
                >
                  Hotovo! Tady je váš slevový kód — už jsme ho vložili do košíku.
                </p>

                {/* ── The code, shown prominently ── */}
                <div
                  className="mt-4 flex items-center justify-between gap-3 px-5 py-4"
                  style={{
                    background: 'var(--color-cream)',
                    border: '1.5px dashed var(--color-forest)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <span
                    className="font-poppins-semibold tabular-nums"
                    style={{ fontSize: 'var(--text-h3)', letterSpacing: '0.08em', color: 'var(--color-forest)' }}
                  >
                    {code}
                  </span>
                  <button
                    type="button"
                    onClick={copyCode}
                    className="font-poppins-semibold shrink-0 transition-transform active:scale-[0.97]"
                    style={{
                      minHeight: 44,
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-forest)',
                      color: '#fff',
                      fontSize: 'var(--text-small)',
                    }}
                  >
                    {copied ? 'Zkopírováno' : 'Zkopírovat'}
                  </button>
                </div>

                <p
                  className="font-poppins-regular mt-3"
                  style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}
                >
                  Platí 7 dní
                </p>

                <Link
                  href="/shop"
                  onClick={dismiss}
                  className="btn-primary mt-5 w-full"
                  style={{ background: 'var(--color-forest)', color: '#fff', borderColor: 'var(--color-forest)' }}
                >
                  Nakupovat
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modal, document.body);
}
