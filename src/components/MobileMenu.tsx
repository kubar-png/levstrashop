'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Secondary nav links. The primary "E-shop" action is intentionally lifted
 * out into a thumb-zone CTA at the bottom of the drawer — see below.
 */
const NAV = [
  { href: '/', label: 'Domů' },
  { href: '/shop/kabelky', label: 'Kabelky' },
  { href: '/shop/kufry', label: 'Kufry' },
  { href: '/o-nas', label: 'O nás' },
  { href: '/blog', label: 'Blog' },
  { href: '/doprava', label: 'Doprava' },
  { href: '/kontakt', label: 'Kontakt' },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const close = () => setOpen(false);

  /**
   * Drawer + backdrop are portaled to <body> so they're positioned relative to
   * the viewport instead of the SiteHeader pill — the pill uses backdrop-filter,
   * which creates a containing block for `position: fixed` descendants and
   * would otherwise leak ~32px of the closed drawer onto the screen.
   */
  const overlay = (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        aria-hidden={!open}
        className={`fixed inset-y-0 right-0 z-[101] flex w-[86%] max-w-sm flex-col shadow-[0_18px_50px_-12px_rgba(0,0,0,0.35)] transition-transform duration-300 md:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: '#fff' }}
      >
        {/* ── Header ───────────────────────────────────────── */}
        <div
          className="flex shrink-0 items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
        >
          <Link
            href="/"
            onClick={close}
            className="font-serif leading-none"
            style={{ fontSize: '1.5rem', color: 'var(--color-ink)' }}
          >
            levstra
          </Link>
          <button
            type="button"
            aria-label="Zavřít menu"
            onClick={close}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full"
            style={{ color: 'var(--color-ink)' }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
              <line x1="5" y1="5" x2="17" y2="17" stroke="currentColor" strokeWidth="1.6" />
              <line x1="17" y1="5" x2="5" y2="17" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable nav links ────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className="font-poppins-medium block transition-colors duration-150 active:opacity-60"
              style={{
                padding: '0.95rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '1.15rem',
                color: 'var(--color-ink)',
                minHeight: 52,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-cream)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '';
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* ── Bottom thumb-zone CTA ────────────────────────
            Primary action lives where the thumb naturally rests so
            opening the menu is one tap closer to a purchase.
            Safe-area-inset handles iPhone notch / home indicator. */}
        <div
          className="shrink-0"
          style={{
            background: 'var(--color-cream)',
            borderTop: '1px solid var(--color-border-subtle)',
            padding: '18px 20px calc(18px + env(safe-area-inset-bottom)) 20px',
          }}
        >
          <Link
            href="/shop"
            onClick={close}
            aria-label="Otevřít e-shop"
            className="font-poppins-semibold relative flex w-full items-center justify-between overflow-hidden transition-transform duration-200 active:scale-[0.98]"
            style={{
              background: 'var(--color-forest)',
              color: '#ffffff',
              padding: '20px 22px',
              borderRadius: 'var(--radius-lg)',
              fontSize: '1.05rem',
              letterSpacing: '0.01em',
              minHeight: 60,
              boxShadow: '0 10px 24px -10px rgba(45,81,67,0.55)',
            }}
          >
            <span className="relative z-10 flex flex-col items-start gap-0.5">
              <span
                className="font-poppins-regular"
                style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--color-lime)',
                }}
              >
                Začít nakupovat
              </span>
              <span style={{ fontSize: '1.15rem', lineHeight: 1 }}>Otevřít e-shop</span>
            </span>
            <span
              aria-hidden="true"
              className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ background: 'var(--color-lime)', color: 'var(--color-ink)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

          <a
            href="https://instagram.com/levstra"
            target="_blank"
            rel="noreferrer"
            className="font-poppins-medium mt-4 inline-block hover:underline"
            style={{
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-small)',
            }}
          >
            Sledujte @levstra →
          </a>
        </div>
      </aside>
    </>
  );

  return (
    <>
      <button
        type="button"
        aria-label="Otevřít menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ color: 'var(--color-ink)' }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
          <line x1="3" y1="6" x2="19" y2="6" stroke="currentColor" strokeWidth="1.6" />
          <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="1.6" />
          <line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>

      {mounted ? createPortal(overlay, document.body) : null}
    </>
  );
}
