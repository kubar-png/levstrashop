import Link from 'next/link';
import { Eyebrow } from '@/components/ui';

/**
 * Root not-found UI. In the App Router this also catches every unmatched URL
 * across the whole site, so it doubles as the global 404 page. It renders
 * inside the root layout, so the header, footer and cart drawer come for free.
 */
export default function NotFound() {
  return (
    <div
      className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center"
      style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}
    >
      <Eyebrow>Chyba 404</Eyebrow>

      <p
        aria-hidden
        className="font-serif select-none leading-none"
        style={{
          fontSize: 'clamp(5.5rem, 20vw, 12rem)',
          color: 'var(--color-forest)',
          letterSpacing: '-0.04em',
          marginTop: '0.75rem',
        }}
      >
        404
      </p>

      <h1
        className="mt-4 font-poppins-semibold leading-[1.05]"
        style={{
          fontSize: 'var(--text-h1)',
          color: 'var(--color-forest)',
          letterSpacing: '-0.03em',
        }}
      >
        Tudy cesta nevede
      </h1>

      <p
        className="mt-4 font-poppins-light"
        style={{
          fontSize: 'var(--text-lead)',
          color: 'var(--color-text-muted)',
          maxWidth: '34rem',
        }}
      >
        Stránku, kterou hledáte, se nám nepodařilo najít. Možná změnila adresu,
        nebo už neexistuje. Vraťte se na rozcestí a pokračujte v cestě za novou
        kabelkou či kufrem.
      </p>

      <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
        <Link href="/shop" className="btn-primary">
          Prohlédnout obchod
        </Link>
        <Link href="/" className="btn-tertiary">
          Zpět na úvod
        </Link>
      </div>

      <div
        className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}
      >
        <span>Nebo zkuste:</span>
        <Link href="/o-nas" className="hover:underline" style={{ color: 'var(--color-ink)' }}>
          O nás
        </Link>
        <Link href="/blog" className="hover:underline" style={{ color: 'var(--color-ink)' }}>
          Blog
        </Link>
        <Link href="/kontakt" className="hover:underline" style={{ color: 'var(--color-ink)' }}>
          Kontakt
        </Link>
      </div>
    </div>
  );
}
