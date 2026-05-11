'use client';

import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';

/**
 * Unified pill / chip for filter buttons, size pickers, category tabs.
 * Replaces the three different chip shapes that exist today
 * (rounded-lg category pills, rounded-xl size chips, rounded-full filters).
 *
 *   <Chip selected={isActive} onClick={...}>Vše</Chip>
 *   <Chip selected={isActive} kind="size">M</Chip>
 */
type ChipKind = 'filter' | 'size';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  selected?: boolean;
  kind?: ChipKind;
  size?: 'sm' | 'md';
  indicator?: boolean;
};

export const Chip = forwardRef<HTMLButtonElement, Props>(function Chip(
  {
    children,
    selected = false,
    kind = 'filter',
    size = 'md',
    indicator = false,
    className,
    type = 'button',
    ...rest
  },
  ref,
) {
  const minHeight = size === 'sm' ? 36 : 40;
  const padX = size === 'sm' ? '0.7rem' : '0.9rem';
  const padY = size === 'sm' ? '0.35rem' : '0.5rem';

  return (
    <button
      ref={ref}
      type={type}
      aria-pressed={selected}
      className={[
        'inline-flex items-center justify-center gap-1.5',
        'font-poppins-semibold',
        'transition-colors duration-200',
        className ?? '',
      ].join(' ')}
      style={{
        minHeight,
        padding: `${padY} ${padX}`,
        borderRadius: kind === 'size' ? 'var(--radius-md)' : '999px',
        fontSize: 'var(--text-small)',
        letterSpacing: '-0.005em',
        color: selected ? '#fff' : 'var(--color-ink)',
        background: selected ? 'var(--color-forest)' : 'transparent',
        border: `1.5px solid ${
          selected ? 'var(--color-forest)' : 'var(--color-border-strong)'
        }`,
        cursor: 'pointer',
      }}
      {...rest}
    >
      {indicator && selected ? (
        <span
          aria-hidden="true"
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: 'var(--color-lime)',
            display: 'inline-block',
          }}
        />
      ) : null}
      <span style={{ position: 'relative' }}>{children}</span>
    </button>
  );
});
