'use client';

import { useEffect, useRef, useState } from 'react';

export type SelectedParcelShop = {
  id: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  /** PPL access-point type — picks the product (ParcelShop→SMAR, *Box→SBOX). */
  type?: string;
};

/** Shape of the PPL widget's `ppl-parcelshop-map` event detail. */
type PplWidgetDetail = {
  code: string;
  name?: string;
  accessPointType?: string;
  street?: string;
  city?: string;
  zipCode?: string;
  country?: string;
};

/**
 * The PPL widget renders its UI directly into the DOM it's mounted in, so the
 * site's global CSS (Tailwind preflight resets `button`, `svg`, `display`, …)
 * leaks in and breaks the widget's internal layout — which clipped its own
 * "Vybrat" button no matter how we sized the container.
 *
 * Fix: render it inside an isolated <iframe> that loads PPL's official JS + CSS
 * in its own document (our styles can't reach it), and relay the selection
 * event out via postMessage.
 */
const WIDGET_DOC = `<!doctype html><html lang="cs"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://www.ppl.cz/sources/map/main.css">
<style>html,body{margin:0;padding:0;height:100%}#ppl-parcelshop-map{height:100vh;width:100%}</style>
</head><body>
<div id="ppl-parcelshop-map" data-language="cs" data-country="cz"></div>
<script>
document.addEventListener('ppl-parcelshop-map', function (e) {
  parent.postMessage({ __pplShop: true, detail: e.detail }, '*');
});
</script>
<script src="https://www.ppl.cz/sources/map/main.js" async></script>
</body></html>`;

export function ParcelShopPicker({
  onSelect,
}: {
  onSelect: (shop: SelectedParcelShop | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<SelectedParcelShop | null>(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  /* Selection arrives from inside the iframe via postMessage. */
  useEffect(() => {
    function handle(e: MessageEvent) {
      const data = e.data as { __pplShop?: boolean; detail?: PplWidgetDetail };
      if (!data?.__pplShop || !data.detail?.code) return;
      const d = data.detail;
      const shop: SelectedParcelShop = {
        id: d.code,
        name: d.name ?? d.code,
        street: d.street ?? '',
        city: d.city ?? '',
        zip: d.zipCode ?? '',
        type: d.accessPointType,
      };
      setChosen(shop);
      onSelectRef.current(shop);
      setOpen(false);
    }
    window.addEventListener('message', handle);
    return () => window.removeEventListener('message', handle);
  }, []);

  /* Lock body scroll + close on Escape while the modal is open. */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div
      className="p-5"
      style={{
        background: '#fff',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <h2
        className="font-poppins-semibold"
        style={{ fontSize: 'var(--text-h3)', color: 'var(--color-forest)' }}
      >
        Výdejní místo PPL
      </h2>
      <p
        className="mt-1"
        style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}
      >
        {chosen
          ? 'Vybrané výdejní místo:'
          : 'Vyberte výdejnu, ParcelBox nebo AlzaBox na mapě.'}
      </p>

      {chosen && (
        <div
          className="mt-3 p-3"
          style={{
            background: 'var(--color-cream)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <p className="font-poppins-semibold" style={{ fontSize: 'var(--text-small)', color: 'var(--color-ink)' }}>
            {chosen.name}
          </p>
          <p style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}>
            {[chosen.street, chosen.city, chosen.zip].filter(Boolean).join(', ')}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-secondary mt-4"
        style={{ width: '100%' }}
      >
        {chosen ? 'Změnit výdejní místo' : 'Vybrat výdejní místo na mapě'}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Výběr výdejního místa PPL"
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
          style={{ background: 'rgba(43,49,47,0.55)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden"
            style={{
              background: '#fff',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            {/* No header bar — it only stole vertical space from the widget and
                pushed its "Vybrat" button toward the fold. A floating close
                button keeps the full height for the map. */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Zavřít"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-opacity hover:opacity-80"
              style={{ background: '#fff', color: 'var(--color-ink)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            {/* Isolated iframe — PPL's own JS + CSS, untouched by our global
                styles. Height clears the widget's 550px minimum even on phones
                (86vh ≈ 573px on a 667px-tall screen); the widget adapts to fill
                it and keeps its "Vybrat" button inside. */}
            <iframe
              title="Mapa výdejních míst PPL"
              srcDoc={WIDGET_DOC}
              style={{ width: '100%', height: 'min(640px, 86vh)', border: 0, display: 'block' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
