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
      className="relative inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-1.5 text-sm hover:border-neutral-900"
    >
      Cart
      {mounted && count > 0 && (
        <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-xs font-medium text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
