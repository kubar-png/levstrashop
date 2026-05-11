import { type ReactNode } from 'react';

type EyebrowSize = 'sm' | 'md';

/**
 * Uppercase, letter-spaced label that sits above a heading.
 * Replaces ad-hoc `text-xs uppercase tracking-[0.3em]` patterns.
 *
 *   <Eyebrow>O značce</Eyebrow>
 *   <Eyebrow size="md" tone="forest">Kategorie</Eyebrow>
 */
export function Eyebrow({
  children,
  size = 'sm',
  tone = 'muted',
  serif = false,
  className,
}: {
  children: ReactNode;
  size?: EyebrowSize;
  tone?: 'muted' | 'forest' | 'ink' | 'on-dark';
  serif?: boolean;
  className?: string;
}) {
  const fontSize = size === 'md' ? 'var(--text-small)' : 'var(--text-micro)';
  const color =
    tone === 'forest'
      ? 'var(--color-forest)'
      : tone === 'ink'
        ? 'var(--color-ink)'
        : tone === 'on-dark'
          ? 'rgba(255,255,255,0.78)'
          : 'var(--color-text-muted)';

  return (
    <p
      className={[
        serif ? 'font-serif' : 'font-poppins-medium',
        'uppercase',
        className ?? '',
      ].join(' ')}
      style={{
        fontSize,
        letterSpacing: '0.22em',
        color,
        lineHeight: 1.2,
      }}
    >
      {children}
    </p>
  );
}
