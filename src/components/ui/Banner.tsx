import { type ReactNode } from 'react';

/**
 * Inline callout banner — used for warnings, info messages, and the
 * legal-review banner on terms/gdpr/cookies pages.
 *
 *   <Banner tone="warning" title="VZOR — čeká na právní kontrolu">
 *     Tento dokument je pracovní šablona…
 *   </Banner>
 */
export function Banner({
  children,
  title,
  tone = 'warning',
}: {
  children?: ReactNode;
  title?: ReactNode;
  tone?: 'warning' | 'info' | 'success';
}) {
  const fg =
    tone === 'success'
      ? 'var(--color-success)'
      : tone === 'info'
        ? 'var(--color-forest)'
        : 'var(--color-warning)';
  // Soft tint of the foreground color, derived using color-mix for one source of truth.
  const bg = `color-mix(in srgb, ${fg} 14%, var(--color-cream))`;
  const border = `color-mix(in srgb, ${fg} 38%, transparent)`;

  return (
    <div
      role={tone === 'warning' ? 'alert' : 'note'}
      className="flex items-start gap-3 p-4"
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 'var(--radius-md)',
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        style={{ color: fg, flexShrink: 0, marginTop: 2 }}
      >
        {tone === 'success' ? (
          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
      </svg>
      <div className="flex-1">
        {title ? (
          <p
            className="font-poppins-semibold"
            style={{ color: fg, fontSize: 'var(--text-small)', letterSpacing: '0.02em' }}
          >
            {title}
          </p>
        ) : null}
        {children ? (
          <div
            className={title ? 'mt-1' : ''}
            style={{
              color: 'var(--color-ink)',
              fontSize: 'var(--text-small)',
              lineHeight: 1.55,
            }}
          >
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}
