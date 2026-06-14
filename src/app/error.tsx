'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Eyebrow } from '@/components/ui';

/**
 * Route-level error boundary. Must be a Client Component. Catches unexpected
 * runtime errors in the page/segment below it and shows a branded fallback.
 * `unstable_retry` re-fetches and re-renders the segment (Next 16.2+); it
 * replaces the older `reset` prop for transient failures.
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Surface the error to logs / monitoring.
    console.error(error);
  }, [error]);

  return (
    <div
      className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center"
      style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}
    >
      <Eyebrow>Chyba</Eyebrow>

      <h1
        className="mt-3 font-poppins-semibold leading-[1.05]"
        style={{
          fontSize: 'var(--text-h1)',
          color: 'var(--color-forest)',
          letterSpacing: '-0.03em',
        }}
      >
        Něco se nepovedlo
      </h1>

      <p
        className="mt-4 font-poppins-light"
        style={{
          fontSize: 'var(--text-lead)',
          color: 'var(--color-text-muted)',
          maxWidth: '34rem',
        }}
      >
        Při načítání stránky nastala neočekávaná chyba. Zkuste to prosím znovu.
        Pokud potíže přetrvávají, ozvěte se nám a rádi pomůžeme.
      </p>

      <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
        <button type="button" onClick={() => unstable_retry()} className="btn-primary">
          Zkusit znovu
        </button>
        <Link href="/" className="btn-tertiary">
          Zpět na úvod
        </Link>
      </div>

      {error.digest ? (
        <p
          className="mt-12"
          style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}
        >
          Kód chyby: <span className="font-mono">{error.digest}</span>
        </p>
      ) : null}
    </div>
  );
}
