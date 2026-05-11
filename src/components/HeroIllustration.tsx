/** Abstract suitcase illustration on a soft peach background — placeholder for the RIGA ORANGE hero. */
export function HeroIllustration() {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#f8d4b0] via-[#f0b888] to-[#e9a878]">
      <div className="absolute inset-0 opacity-30 mix-blend-overlay [background:radial-gradient(circle_at_30%_30%,white,transparent_50%)]" />
      <svg
        viewBox="0 0 400 500"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {/* shadow */}
        <ellipse cx="200" cy="425" rx="140" ry="14" fill="#000" opacity="0.18" />

        {/* handle */}
        <rect x="180" y="100" width="40" height="60" rx="6" fill="none" stroke="#3d2418" strokeWidth="6" />

        {/* suitcase body */}
        <rect x="80" y="160" width="240" height="250" rx="24" fill="#c46a3d" />
        <rect x="80" y="160" width="240" height="250" rx="24" fill="url(#sheen)" opacity="0.4" />

        {/* center seam */}
        <line x1="200" y1="160" x2="200" y2="410" stroke="#3d2418" strokeWidth="2" opacity="0.4" />

        {/* corner protectors */}
        <rect x="80" y="160" width="40" height="40" rx="24" fill="#3d2418" opacity="0.85" />
        <rect x="280" y="160" width="40" height="40" rx="24" fill="#3d2418" opacity="0.85" />
        <rect x="80" y="370" width="40" height="40" rx="24" fill="#3d2418" opacity="0.85" />
        <rect x="280" y="370" width="40" height="40" rx="24" fill="#3d2418" opacity="0.85" />

        {/* latch */}
        <rect x="186" y="178" width="28" height="14" rx="3" fill="#3d2418" />

        {/* brand tag */}
        <rect x="148" y="260" width="104" height="36" rx="6" fill="#fdfaf6" opacity="0.95" />
        <text
          x="200"
          y="284"
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          letterSpacing="3"
          fill="#3d2418"
          fontFamily="system-ui, sans-serif"
        >
          LEVSTRA
        </text>

        <defs>
          <linearGradient id="sheen" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="40%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function HandbagIllustration() {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#fbe3d4] to-[#f0c8a8]">
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <ellipse cx="200" cy="345" rx="120" ry="10" fill="#000" opacity="0.15" />
        {/* strap */}
        <path
          d="M 130 200 C 130 110, 270 110, 270 200"
          fill="none"
          stroke="#3d2418"
          strokeWidth="8"
        />
        {/* bag body */}
        <path d="M 100 200 L 110 340 L 290 340 L 300 200 Z" fill="#8a4a2a" />
        <path d="M 100 200 L 110 340 L 290 340 L 300 200 Z" fill="url(#bagSheen)" opacity="0.5" />
        {/* clasp */}
        <rect x="186" y="234" width="28" height="22" rx="4" fill="#d6a86a" />
        <rect x="192" y="240" width="16" height="10" rx="2" fill="#3d2418" />

        <defs>
          <linearGradient id="bagSheen" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
