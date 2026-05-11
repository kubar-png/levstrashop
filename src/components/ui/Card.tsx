import { type ReactNode } from 'react';

/**
 * Surface container. Replaces ad-hoc `border rounded-2xl p-6 bg-white`
 * blocks used in kontakt info cards, cookies categories, cart summary,
 * parcel-shop list rows, etc.
 *
 *   <Card>{children}</Card>
 *   <Card tone="cream" radius="xl">{children}</Card>
 *   <Card tone="forest" interactive>{children}</Card>
 */
export function Card({
  children,
  tone = 'surface',
  radius = 'lg',
  padding = 'md',
  bordered = true,
  interactive = false,
  className,
  as: As = 'div',
}: {
  children: ReactNode;
  tone?: 'surface' | 'cream' | 'forest' | 'forest-deep' | 'sky';
  radius?: 'md' | 'lg' | 'xl' | '2xl';
  padding?: 'sm' | 'md' | 'lg' | 'none';
  bordered?: boolean;
  interactive?: boolean;
  className?: string;
  as?: 'div' | 'article' | 'section' | 'li';
}) {
  const bg =
    tone === 'cream'
      ? 'var(--color-cream)'
      : tone === 'forest'
        ? 'var(--color-forest)'
        : tone === 'forest-deep'
          ? 'var(--color-forest-deep)'
          : tone === 'sky'
            ? 'var(--color-sky-light)'
            : '#fff';

  const color =
    tone === 'forest' || tone === 'forest-deep' ? '#fff' : 'var(--color-ink)';

  const pad =
    padding === 'none'
      ? ''
      : padding === 'sm'
        ? 'p-4 md:p-5'
        : padding === 'lg'
          ? 'p-6 md:p-8'
          : 'p-5 md:p-6';

  const borderRadius = `var(--radius-${radius})`;

  return (
    <As
      className={[pad, className ?? ''].join(' ')}
      style={{
        background: bg,
        color,
        borderRadius,
        border: bordered ? '1px solid var(--color-border-subtle)' : '0',
        transition: interactive
          ? 'transform var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)'
          : undefined,
      }}
    >
      {children}
    </As>
  );
}
