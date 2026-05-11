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
      <div className="flex w-max gap-10 whitespace-nowrap py-3.5 ticker-track">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center gap-10">
            {items.map((_, i) => (
              <span
                key={`${dup}-${i}`}
                className="flex items-center gap-10 text-sm font-bold uppercase tracking-[0.22em]"
              >
                <span aria-hidden="true" className="text-[var(--color-forest)]/60 text-xs">
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
