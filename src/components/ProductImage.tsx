import Image from 'next/image';
import type { PlaceholderSpec } from '@/lib/data';

/** Real image or per-product SVG placeholder, in a rounded card. */
export function ProductImage({
  src,
  alt,
  placeholder,
  sizes,
  priority,
  className,
  aspect = '1/1',
}: {
  src: string | null | undefined;
  alt: string;
  placeholder?: PlaceholderSpec;
  sizes?: string;
  priority?: boolean;
  className?: string;
  aspect?: '4/5' | '1/1' | '3/4';
}) {
  const aspectClass =
    aspect === '1/1' ? 'aspect-square' : aspect === '3/4' ? 'aspect-[3/4]' : 'aspect-[4/5]';

  if (src) {
    return (
      <div
        className={`relative ${aspectClass} overflow-hidden ${className ?? ''}`}
        style={{ background: 'var(--color-cream)', borderRadius: 'var(--radius-md)' }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain transition duration-700 group-hover:scale-[1.04]"
        />
      </div>
    );
  }

  const spec = placeholder ?? { kind: 'suitcase' as const, color: '#c46a3d', accent: '#3d2418' };
  return (
    <div
      className={`relative ${aspectClass} overflow-hidden rounded-md ${className ?? ''}`}
      style={{
        background: `linear-gradient(135deg, ${shade(spec.color, 0.35)} 0%, ${spec.color} 60%, ${shade(spec.color, -0.15)} 100%)`,
      }}
      aria-label={alt}
    >
      {spec.kind === 'suitcase' ? (
        <SuitcaseSvg color={spec.color} accent={spec.accent} />
      ) : (
        <HandbagSvg color={spec.color} accent={spec.accent} />
      )}
    </div>
  );
}

function SuitcaseSvg({ color, accent }: { color: string; accent: string }) {
  return (
    <svg
      viewBox="0 0 400 500"
      className="absolute inset-0 h-full w-full transition duration-700 group-hover:scale-[1.04]"
      aria-hidden="true"
    >
      <ellipse cx="200" cy="430" rx="130" ry="12" fill="#000" opacity="0.18" />
      <rect x="180" y="105" width="40" height="55" rx="5" fill="none" stroke={accent} strokeWidth="6" />
      <rect x="85" y="160" width="230" height="255" rx="22" fill={color} />
      <rect x="85" y="160" width="230" height="255" rx="22" fill="url(#sheen)" opacity="0.4" />
      <line x1="200" y1="160" x2="200" y2="415" stroke={accent} strokeWidth="2" opacity="0.35" />
      <rect x="85" y="160" width="36" height="36" rx="22" fill={accent} opacity="0.85" />
      <rect x="279" y="160" width="36" height="36" rx="22" fill={accent} opacity="0.85" />
      <rect x="85" y="379" width="36" height="36" rx="22" fill={accent} opacity="0.85" />
      <rect x="279" y="379" width="36" height="36" rx="22" fill={accent} opacity="0.85" />
      <rect x="187" y="178" width="26" height="13" rx="3" fill={accent} />
      <defs>
        <linearGradient id="sheen" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="40%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function HandbagSvg({ color, accent }: { color: string; accent: string }) {
  return (
    <svg
      viewBox="0 0 400 500"
      className="absolute inset-0 h-full w-full transition duration-700 group-hover:scale-[1.04]"
      aria-hidden="true"
    >
      <ellipse cx="200" cy="430" rx="120" ry="10" fill="#000" opacity="0.18" />
      <path
        d="M 130 250 C 130 160, 270 160, 270 250"
        fill="none"
        stroke={accent}
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path d="M 95 250 L 110 415 L 290 415 L 305 250 Z" fill={color} />
      <path d="M 95 250 L 110 415 L 290 415 L 305 250 Z" fill="url(#bagSheen)" opacity="0.45" />
      <rect x="184" y="295" width="32" height="22" rx="4" fill={accent} />
      <rect x="192" y="302" width="16" height="8" rx="2" fill={color} />
      <defs>
        <linearGradient id="bagSheen" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function shade(hex: string, amount: number): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const adjust = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v + (amount > 0 ? (255 - v) * amount : v * amount))));
  return `#${adjust(r).toString(16).padStart(2, '0')}${adjust(g).toString(16).padStart(2, '0')}${adjust(b).toString(16).padStart(2, '0')}`;
}
