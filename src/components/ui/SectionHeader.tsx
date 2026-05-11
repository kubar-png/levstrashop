import { type ReactNode } from 'react';
import { Eyebrow } from './Eyebrow';

/**
 * Standard section header: optional eyebrow, h2 title, optional lead
 * paragraph, optional trailing action (usually a .btn-secondary link).
 *
 *   <SectionHeader
 *     eyebrow="Kategorie"
 *     title="Nakupujte podle kategorie"
 *     lead="Kufry a kabelky pro každou cestu."
 *     action={<Link className="btn-secondary" href="/shop">Vše</Link>}
 *   />
 */
export function SectionHeader({
  eyebrow,
  title,
  lead,
  action,
  align = 'left',
  as = 'h2',
  tone = 'forest',
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  action?: ReactNode;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2' | 'h3';
  tone?: 'forest' | 'ink' | 'on-dark';
  className?: string;
}) {
  const Heading = as;
  const titleSize =
    as === 'h1' ? 'var(--text-h1)' : as === 'h2' ? 'var(--text-h2)' : 'var(--text-h3)';
  const titleColor =
    tone === 'on-dark' ? '#fff' : tone === 'ink' ? 'var(--color-ink)' : 'var(--color-forest)';
  const leadColor =
    tone === 'on-dark' ? 'rgba(255,255,255,0.78)' : 'var(--color-text-muted)';

  return (
    <div
      className={[
        'flex flex-col gap-3',
        align === 'center' ? 'items-center text-center' : 'items-start',
        action ? 'md:flex-row md:items-end md:justify-between md:gap-8' : '',
        className ?? '',
      ].join(' ')}
    >
      <div className={align === 'center' ? 'mx-auto max-w-3xl' : 'max-w-3xl'}>
        {eyebrow ? (
          <div className="mb-2">
            <Eyebrow tone={tone === 'on-dark' ? 'on-dark' : 'forest'}>{eyebrow}</Eyebrow>
          </div>
        ) : null}
        <Heading
          className="font-poppins-semibold leading-[1.1]"
          style={{
            fontSize: titleSize,
            color: titleColor,
            letterSpacing: '-0.025em',
          }}
        >
          {title}
        </Heading>
        {lead ? (
          <p
            className="mt-3 font-serif"
            style={{
              fontSize: 'var(--text-lead)',
              color: leadColor,
              lineHeight: 1.45,
              maxWidth: '46ch',
            }}
          >
            {lead}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
