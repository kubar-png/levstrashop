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

const WIDGET_SRC = 'https://www.ppl.cz/sources/map/main.js';
const SCRIPT_ID = 'ppl-parcelshop-widget';

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

  /* The widget dispatches a CustomEvent on `document` when the user confirms
     a pickup point. Listen once for the component's lifetime. */
  useEffect(() => {
    function handle(e: Event) {
      const detail = (e as CustomEvent<PplWidgetDetail>).detail;
      if (!detail?.code) return;
      const shop: SelectedParcelShop = {
        id: detail.code,
        name: detail.name ?? detail.code,
        street: detail.street ?? '',
        city: detail.city ?? '',
        zip: detail.zipCode ?? '',
        type: detail.accessPointType,
      };
      setChosen(shop);
      onSelectRef.current(shop);
      setOpen(false);
    }
    document.addEventListener('ppl-parcelshop-map', handle);
    return () => document.removeEventListener('ppl-parcelshop-map', handle);
  }, []);

  /* Load (and re-load) the widget script while the modal is open so it
     re-scans the freshly mounted container each time. */
  useEffect(() => {
    if (!open) return;
    document.getElementById(SCRIPT_ID)?.remove();
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = WIDGET_SRC;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, [open]);

  /* Lock body scroll behind the modal. */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(43,49,47,0.55)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="flex w-full max-w-3xl flex-col overflow-hidden"
            style={{
              background: '#fff',
              borderRadius: 'var(--radius-lg)',
              height: 'auto',
              maxHeight: '94vh',
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
            >
              <span
                className="font-poppins-semibold"
                style={{ fontSize: 'var(--text-small)', color: 'var(--color-ink)' }}
              >
                Vyberte výdejní místo
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Zavřít"
                className="flex h-9 w-9 items-center justify-center rounded-full transition-opacity hover:opacity-60"
                style={{ color: 'var(--color-ink)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {/* PPL widget renders into this container. An explicit height
                (>400px) is required — the widget adapts to it and fits its
                own footer button inside. With flex/0 height it self-sizes to
                80vh and overflows the panel, clipping the bottom button. */}
            <div
              id="ppl-parcelshop-map"
              style={{ width: '100%', height: 'min(80vh, 760px)', minHeight: 420 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
