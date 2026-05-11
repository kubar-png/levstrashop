import Link from 'next/link';
import { CartButton } from './CartButton';
import { MobileMenu } from './MobileMenu';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-[#faf8f4]/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
        <Link href="/" className="text-lg font-semibold tracking-[0.22em]">
          LEVSTRA
        </Link>
        <nav className="hidden gap-8 text-sm font-medium text-neutral-700 md:flex">
          <Link href="/" className="hover:text-black">Domů</Link>
          <Link href="/shop" className="hover:text-black">E-shop</Link>
          <Link href="/shop/kabelky" className="hover:text-black">Kabelky</Link>
          <Link href="/shop/kufry" className="hover:text-black">Kufry</Link>
          <Link href="/o-nas" className="hover:text-black">O nás</Link>
          <Link href="/blog" className="hover:text-black">Blog</Link>
        </nav>
        <div className="flex items-center gap-2">
          <CartButton />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
