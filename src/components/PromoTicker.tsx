/**
 * Edge-to-edge marquee. Renders the message many times so the CSS animation
 * (translateX -50%) loops seamlessly regardless of viewport width.
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
    <div className="relative w-full overflow-hidden text-white" style={{ background: 'var(--color-promo)' }}>
      <div className="flex w-max gap-10 whitespace-nowrap py-4 ticker-track">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center gap-10">
            {items.map((_, i) => (
              <span
                key={`${dup}-${i}`}
                className="flex items-center gap-10 text-sm font-semibold uppercase tracking-[0.22em]"
              >
                <span aria-hidden="true" className="text-white/55 text-xs">
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
