'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '@/lib/cart';

export function CartButton() {
  const count = useCart((s) => s.itemCount());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Link
      href="/cart"
      aria-label="Košík"
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors"
      style={{
        border: '1.5px solid var(--color-border-strong)',
        color: 'var(--color-ink)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-forest)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border-strong)';
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 7h12l-1.4 11.2A2 2 0 0 1 14.6 20H9.4a2 2 0 0 1-2-1.8L6 7Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M9 7V5a3 3 0 0 1 6 0v2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      {mounted && count > 0 && (
        <span
          className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 font-semibold"
          style={{
            background: 'var(--color-forest)',
            color: '#fff',
            fontSize: '11px',
          }}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
