'use client';

/**
 * Last-resort error boundary that catches errors thrown by the ROOT layout
 * itself (where the regular error.tsx can't render). It replaces the whole
 * document, so it must ship its own <html>/<body> and inline styles — the
 * site layout, globals.css and fonts are not available here.
 */

import { useEffect } from 'react';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="cs">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
          padding: '2rem',
          textAlign: 'center',
          background: '#f2f0eb',
          color: '#2b312f',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <title>Něco se nepovedlo — Ciaobag</title>
        <p
          style={{
            margin: 0,
            fontSize: '0.72rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#2d5143',
          }}
        >
          Ciaobag
        </p>
        <h1 style={{ margin: 0, fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', color: '#2d5143' }}>
          Něco se nepovedlo
        </h1>
        <p style={{ margin: 0, maxWidth: '32rem', lineHeight: 1.6, color: 'rgba(43,49,47,0.7)' }}>
          Při načítání stránky nastala neočekávaná chyba. Zkuste to prosím znovu.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              background: '#2d5143',
              color: '#fff',
              border: 0,
              borderRadius: '10px',
              padding: '0.8rem 1.5rem',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Zkusit znovu
          </button>
          <a
            href="/"
            style={{ alignSelf: 'center', color: '#2b312f', textDecoration: 'underline', fontWeight: 600 }}
          >
            Zpět na úvod
          </a>
        </div>
        {error.digest ? (
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(43,49,47,0.5)' }}>
            Kód chyby: <span style={{ fontFamily: 'monospace' }}>{error.digest}</span>
          </p>
        ) : null}
      </body>
    </html>
  );
}
