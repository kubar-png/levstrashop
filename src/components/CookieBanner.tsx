'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'levstra-cookie-consent';

type Consent = 'all' | 'essential' | null;

export function CookieBanner() {
  const [consent, setConsent] = useState<Consent>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as Consent | null;
    setConsent(stored);
  }, []);

  function accept(value: 'all' | 'essential') {
    localStorage.setItem(STORAGE_KEY, value);
    setConsent(value);
  }

  if (!mounted || consent) return null;

  return (
    <div
      role="dialog"
      aria-label="Souhlas s používáním cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white shadow-xl"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-neutral-700">
          Používáme cookies k zajištění základní funkčnosti e-shopu a — s vaším souhlasem — k
          měření návštěvnosti.{' '}
          <Link href="/cookies" className="underline">
            Více informací
          </Link>
          .
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => accept('essential')}
            className="rounded-full border border-neutral-300 px-5 py-2 text-sm hover:border-neutral-900"
          >
            Pouze nezbytné
          </button>
          <button
            onClick={() => accept('all')}
            className="rounded-full bg-neutral-900 px-5 py-2 text-sm text-white hover:bg-neutral-700"
          >
            Přijmout vše
          </button>
        </div>
      </div>
    </div>
  );
}
