import type { CSSProperties } from 'react';

/**
 * The brand lockup: sparkle mark + "ciaobag" wordmark.
 *
 * Both the mark and the wordmark are sized in `em`, so the whole lockup
 * scales from a single font-size — keeping identical proportions everywhere
 * it's used (header, footer, mobile menu). Colour is inherited via
 * `currentColor`, so the parent link controls it.
 */
export function BrandLogo({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`inline-flex items-center gap-[0.3em] font-serif leading-none tracking-tight ${className ?? ''}`}
      style={style}
    >
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        aria-hidden="true"
        style={{ width: '0.9em', height: '0.9em', flexShrink: 0 }}
      >
        <path
          d="M16 2c1.5 5.2 4.3 8 9.5 9.5C20.3 13 17.5 15.8 16 21c-1.5-5.2-4.3-8-9.5-9.5C11.7 10 14.5 7.2 16 2Z"
          opacity="0.92"
        />
        <path
          d="M16 11c1.5 5.2 4.3 8 9.5 9.5C20.3 22 17.5 24.8 16 30c-1.5-5.2-4.3-8-9.5-9.5C11.7 19 14.5 16.2 16 11Z"
          opacity="0.92"
        />
      </svg>
      <span>ciaobag</span>
    </span>
  );
}
