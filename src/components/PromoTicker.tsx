/**
 * Edge-to-edge lime marquee — the brand's primary promo strip.
 * Background sampled directly from the Wix render (#e1f861).
 */
export function PromoTicker({
  message,
  separator = '✦',
  repeat = 12,
}: {
  message: string;
  separator?: string;
  repeat?: number;
}) {
  const items = Array.from({ length: repeat });

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ background: 'var(--color-lime)', color: 'var(--color-forest)' }}
    >
      <div className="flex w-max gap-12 whitespace-nowrap ticker-track" style={{ paddingTop: '1.1rem', paddingBottom: '1.1rem' }}>
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center gap-12">
            {items.map((_, i) => (
              <span
                key={`${dup}-${i}`}
                className="flex items-center gap-12 font-bold uppercase tracking-[0.18em]"
                style={{ fontSize: '1.4rem' }}
              >
                <span aria-hidden="true" className="opacity-50" style={{ fontSize: '0.9rem' }}>
                  {separator}
                </span>
                <span>{message}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
