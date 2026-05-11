import Link from 'next/link';
import { CartButton } from './CartButton';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold tracking-[0.2em]">
          LEVSTRA
        </Link>
        <nav className="hidden gap-8 text-sm text-neutral-600 md:flex">
          <Link href="/" className="hover:text-neutral-900">Domů</Link>
          <Link href="/shop" className="hover:text-neutral-900">E-shop</Link>
          <Link href="/shop/kabelky" className="hover:text-neutral-900">Kabelky</Link>
          <Link href="/shop/kufry" className="hover:text-neutral-900">Kufry</Link>
          <Link href="/o-nas" className="hover:text-neutral-900">O nás</Link>
          <Link href="/blog" className="hover:text-neutral-900">Blog</Link>
        </nav>
        <CartButton />
      </div>
    </header>
  );
}
