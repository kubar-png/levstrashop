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
        className="inline-flex h-9 w-9 items-center justify-center md:hidden"
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
        className={`fixed inset-y-0 right-0 z-50 w-[82%] max-w-sm transform bg-white shadow-2xl transition-transform duration-300 md:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
          <span className="text-sm font-semibold tracking-[0.25em]">LEVSTRA</span>
          <button
            type="button"
            aria-label="Zavřít menu"
            onClick={() => setOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center"
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
              className="font-display rounded-lg px-4 py-3 text-xl hover:bg-neutral-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-neutral-200 bg-neutral-50 px-6 py-5 text-sm text-neutral-600">
          <a
            href="https://instagram.com/levstra"
            target="_blank"
            rel="noreferrer"
            className="font-medium"
          >
            Instagram @levstra →
          </a>
        </div>
      </aside>
    </>
  );
}
