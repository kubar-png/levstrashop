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
    setConsent(localStorage.getItem(STORAGE_KEY) as Consent | null);
  }, []);

  function accept(value: 'all' | 'essential') {
    localStorage.setItem(STORAGE_KEY, value);
    setConsent(value);
    // Let analytics (and any other consent-gated scripts) react without a reload.
    window.dispatchEvent(new Event('cookie-consent'));
  }

  if (!mounted || consent) return null;

  return (
    <div
      role="dialog"
      aria-label="Souhlas s používáním cookies"
      className="fixed inset-x-8 bottom-6 z-50 md:inset-x-10 md:bottom-8"
    >
      <div
        className="flex flex-col gap-4 px-6 py-5 shadow-[0_4px_22px_-8px_rgba(0,0,0,0.22)] ring-1 ring-black/5 backdrop-blur md:flex-row md:items-center md:justify-between md:gap-8 md:px-8"
        style={{
          background: 'var(--color-pill-bg)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-ink)', fontSize: 'var(--text-body)' }}
        >
          Používáme cookies k zajištění základní funkčnosti e-shopu a — s vaším souhlasem — k
          měření návštěvnosti.{' '}
          <Link
            href="/cookies"
            className="underline underline-offset-2 transition hover:opacity-70"
          >
            Více informací
          </Link>
          .
        </p>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => accept('essential')} className="btn-secondary">
            Pouze nezbytné
          </button>
          <button type="button" onClick={() => accept('all')} className="btn-primary">
            Přijmout vše
          </button>
        </div>
      </div>
    </div>
  );
}
