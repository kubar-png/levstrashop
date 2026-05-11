'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const NAV = [
  { href: '/', label: 'Domů' },
  { href: '/shop', label: 'E-shop' },
  { href: '/shop/kabelky', label: 'Kabelky' },
  { href: '/shop/kufry', label: 'Kufry' },
  { href: '/o-nas', label: 'O nás' },
  { href: '/blog', label: 'Blog' },
  { href: '/doprava', label: 'Doprava' },
  { href: '/kontakt', label: 'Kontakt' },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

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

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        aria-hidden={!open}
        className={`fixed inset-y-0 right-0 z-50 w-[82%] max-w-sm transform shadow-2xl transition-transform duration-300 md:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: '#fff' }}
      >
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
        >
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="font-serif leading-none"
            style={{ fontSize: '1.5rem', color: 'var(--color-ink)' }}
          >
            levstra
          </Link>
          <button
            type="button"
            aria-label="Zavřít menu"
            onClick={() => setOpen(false)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full"
            style={{ color: 'var(--color-ink)' }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
              <line x1="5" y1="5" x2="17" y2="17" stroke="currentColor" strokeWidth="1.6" />
              <line x1="17" y1="5" x2="5" y2="17" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-3 py-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="font-poppins-medium transition-colors duration-150"
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '1.15rem',
                color: 'var(--color-ink)',
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
        <div
          className="absolute bottom-0 left-0 right-0 px-6 py-5"
          style={{
            background: 'var(--color-cream)',
            borderTop: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-small)',
          }}
        >
          <a
            href="https://instagram.com/levstra"
            target="_blank"
            rel="noreferrer"
            className="font-poppins-medium hover:underline"
            style={{ color: 'var(--color-ink)' }}
          >
            Sledujte @levstra na Instagramu →
          </a>
        </div>
      </aside>
    </>
  );
}
