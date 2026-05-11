import Link from 'next/link';
import { CartButton } from './CartButton';
import { MobileMenu } from './MobileMenu';

/**
 * Floating pill header — light cream pill, Forum-serif logotype,
 * 4 Poppins nav items with active state in red.
 */
export function SiteHeader() {
  return (
    <header className="fixed inset-x-3 top-3 z-50 md:inset-x-6 md:top-5">
      <div
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full px-4 py-2.5 shadow-[0_4px_22px_-8px_rgba(0,0,0,0.18)] ring-1 ring-black/5 backdrop-blur md:px-7 md:py-3"
        style={{ background: 'var(--color-pill-bg)' }}
      >
        {/* Logo — mark + Forum-serif wordmark */}
        <Link href="/" className="flex items-center gap-2 pl-1 text-[var(--color-pill-ink)]">
          <LogoMark />
          <span className="font-serif text-xl leading-none tracking-tight md:text-2xl">
            levstra
          </span>
        </Link>

        {/* Center nav — Poppins Regular, active 'Domů' in red */}
        <nav className="hidden items-center gap-7 text-[15px] md:flex">
          <Link
            href="/"
            aria-current="page"
            className="font-poppins-medium"
            style={{ color: 'var(--color-red)' }}
          >
            Domů
          </Link>
          <Link
            href="/shop"
            className="font-poppins-regular text-[var(--color-pill-ink)]/85 hover:text-[var(--color-pill-ink)]"
          >
            e-shop
          </Link>
          <Link
            href="/o-nas"
            className="font-poppins-regular text-[var(--color-pill-ink)]/85 hover:text-[var(--color-pill-ink)]"
          >
            O nás
          </Link>
          <Link
            href="/blog"
            className="font-poppins-regular text-[var(--color-pill-ink)]/85 hover:text-[var(--color-pill-ink)]"
          >
            Blog
          </Link>
        </nav>

        {/* Right: Najít + cart + mobile menu trigger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Najít"
            className="hidden h-9 items-center gap-1.5 rounded-full px-2 text-[15px] font-poppins-regular text-[var(--color-pill-ink)]/85 hover:text-[var(--color-pill-ink)] md:inline-flex"
          >
            <span>Najít</span>
            <SearchIcon />
          </button>
          <CartButton />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

/** Stylized 4-petal mark — geometric flower / asterisk in pill ink. */
function LogoMark() {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center" aria-hidden="true">
      <svg viewBox="0 0 32 32" width="22" height="22" fill="currentColor">
        <path d="M16 2c1.5 5.2 4.3 8 9.5 9.5C20.3 13 17.5 15.8 16 21c-1.5-5.2-4.3-8-9.5-9.5C11.7 10 14.5 7.2 16 2Z" opacity="0.92" />
        <path d="M16 11c1.5 5.2 4.3 8 9.5 9.5C20.3 22 17.5 24.8 16 30c-1.5-5.2-4.3-8-9.5-9.5C11.7 19 14.5 16.2 16 11Z" opacity="0.92" />
      </svg>
    </span>
  );
}

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <line x1="16" y1="16" x2="20" y2="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
