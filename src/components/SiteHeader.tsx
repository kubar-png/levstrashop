import Link from 'next/link';
import { CartButton } from './CartButton';
import { MobileMenu } from './MobileMenu';

/**
 * Floating pill header. Fixed at top with side margins so the rounded
 * pill sits over the hero image (homepage) or on the gray bg (other pages).
 */
export function SiteHeader() {
  return (
    <header className="fixed inset-x-3 top-3 z-50 md:inset-x-5 md:top-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full bg-white/95 px-4 py-2.5 shadow-md ring-1 ring-black/5 backdrop-blur md:px-6 md:py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 pl-1">
          <LogoMark />
          <span className="text-base font-semibold tracking-tight md:text-lg">logo</span>
        </Link>

        {/* Center nav — 4 items as in Wix */}
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link href="/" className="text-[#c0473a]" aria-current="page">Domů</Link>
          <Link href="/shop" className="text-neutral-700 hover:text-black">e-shop</Link>
          <Link href="/o-nas" className="text-neutral-700 hover:text-black">O nás</Link>
          <Link href="/blog" className="text-neutral-700 hover:text-black">Blog</Link>
        </nav>

        {/* Right: search + cart */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Najít"
            className="hidden h-9 items-center gap-2 rounded-full px-3 text-sm font-medium text-neutral-700 hover:text-black md:inline-flex"
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
    <span className="inline-flex h-7 w-7 items-center justify-center text-[#2d5143]" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M12 2c0 3 1.5 5 4 6-2.5 1-4 3-4 6 0-3-1.5-5-4-6 2.5-1 4-3 4-6Z" opacity="0.9" />
        <path d="M12 10c0 3 1.5 5 4 6-2.5 1-4 3-4 6 0-3-1.5-5-4-6 2.5-1 4-3 4-6Z" opacity="0.9" transform="rotate(45 12 16)" />
      </svg>
    </span>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <line x1="16" y1="16" x2="20" y2="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
