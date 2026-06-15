/**
 * Sales-reinforcement trust badges — the same three benefits shown on the
 * product page, reused on the cart to strengthen the buyer's decision.
 */

const BADGES = [
  {
    label: 'Doručení 1–2 dny',
    note: 'PPL na adresu i ParcelShop',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
        <path d="M3 7h13l5 5v5h-3M6 17H3V7M9 17h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7.5" cy="17.5" r="2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17.5" cy="17.5" r="2" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    label: 'Vrácení do 14 dní',
    note: 'Bez udání důvodu',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
        <path d="M21 12c0 5-4 8-9 9-5-1-9-4-9-9V5l9-3 9 3v7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Bezpečná platba',
    note: 'Karta i bankovní převod',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
        <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
        <path d="M7 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function TrustBadges({ className }: { className?: string }) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-3 ${className ?? ''}`}
      style={{
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-xl)',
      }}
    >
      {BADGES.map((b) => (
        <div key={b.label} className="flex items-center gap-3">
          <span className="shrink-0" style={{ color: 'var(--color-forest)' }}>
            {b.icon}
          </span>
          <div className="min-w-0">
            <p
              className="font-poppins-semibold leading-tight"
              style={{ fontSize: 'var(--text-small)', color: 'var(--color-ink)' }}
            >
              {b.label}
            </p>
            <p
              className="font-poppins-regular leading-tight"
              style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}
            >
              {b.note}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
