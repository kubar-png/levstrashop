'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/',      label: 'Domů',  exact: true },
  { href: '/shop',  label: 'e-shop' },
  { href: '/o-nas', label: 'O nás' },
  { href: '/blog',  label: 'Blog' },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {LINKS.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="nav-link font-poppins-medium text-[15px]"
            data-active={active ? 'true' : undefined}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}
