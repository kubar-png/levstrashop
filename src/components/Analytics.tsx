'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

// Measurement ID — overridable per environment, defaults to the live property.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-Q2N9P2Y9P1';
const STORAGE_KEY = 'levstra-cookie-consent';

/**
 * GDPR-compliant Google Analytics loader.
 *
 * The cookie banner promises visitors that traffic measurement runs only with
 * their consent, so gtag.js is injected ONLY once the visitor has clicked
 * "Přijmout vše" (consent = 'all'). It reacts live to that click (custom
 * `cookie-consent` event from CookieBanner) and to consent given in other tabs
 * (`storage` event), so no page reload is needed.
 */
export function Analytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const read = () => setAllowed(localStorage.getItem(STORAGE_KEY) === 'all');
    read();
    window.addEventListener('cookie-consent', read);
    window.addEventListener('storage', read);
    return () => {
      window.removeEventListener('cookie-consent', read);
      window.removeEventListener('storage', read);
    };
  }, []);

  if (!GA_ID || !allowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
