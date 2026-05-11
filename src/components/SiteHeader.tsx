import Link from 'next/link';
import { CartButton } from './CartButton';
import { MobileMenu } from './MobileMenu';
import { NavLinks } from './NavLinks';

export function SiteHeader() {
  return (
    <header className="fixed inset-x-8 top-6 z-50 md:inset-x-10 md:top-8">
      <div
        className="flex w-full items-center justify-between gap-6 rounded-full px-4 py-2.5 shadow-[0_4px_22px_-8px_rgba(0,0,0,0.18)] ring-1 ring-black/5 backdrop-blur md:px-6 md:py-3"
        style={{ background: 'var(--color-pill-bg)' }}
      >
        {/* Left: logo + nav */}
        <div className="flex items-center gap-7">
          <Link href="/" className="flex items-center gap-2 shrink-0 text-[var(--color-pill-ink)]">
            <LogoMark />
            <span className="font-serif text-xl leading-none tracking-tight md:text-2xl">
              levstra
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <NavLinks />
          </nav>
        </div>

        {/* Right: search + cart + mobile */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Najít"
            className="hidden h-9 cursor-pointer items-center gap-1.5 rounded-full px-2 text-[15px] font-poppins-regular transition-colors duration-200 md:inline-flex"
            style={{ color: 'var(--color-pill-ink)' }}
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
