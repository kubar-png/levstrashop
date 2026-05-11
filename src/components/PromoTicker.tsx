/**
 * Edge-to-edge marquee. Renders the message twice so the CSS animation
 * (translateX -50%) can loop seamlessly.
 */
export function PromoTicker({
  message,
  separator = '✦',
}: {
  message: string;
  separator?: string;
}) {
  const items = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div
      className="relative w-full overflow-hidden text-white"
      style={{ background: '#0c1a2e' }}
    >
      <div className="flex w-max gap-8 whitespace-nowrap py-3 ticker-track">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center gap-8">
            {items.map((i) => (
              <span
                key={`${dup}-${i}`}
                className="flex items-center gap-8 text-sm font-medium uppercase tracking-[0.18em]"
              >
                <span aria-hidden="true" className="text-white/60">
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
