import type { Metadata } from 'next';
import { Poppins, Forum } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { CookieBanner } from '@/components/CookieBanner';
import { PageTransition } from '@/components/PageTransition';
import { CartDrawer } from '@/components/CartDrawer';

const poppins = Poppins({
  variable: '--font-sans',
  subsets: ['latin', 'latin-ext'],
  weight: ['200', '300', '400', '500', '600', '700'],
});

const forum = Forum({
  variable: '--font-serif',
  subsets: ['latin', 'latin-ext'],
  weight: ['400'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ciaobag.cz';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Ciaobag — Cestujte se stylem',
    template: '%s | Ciaobag',
  },
  description:
    'Kabelky a kufry Marina Galanti. Módu dovážíme už přes dvě desetiletí. Doprava zdarma nad 1 500 Kč.',
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    siteName: 'Ciaobag',
    title: 'Ciaobag — Cestujte se stylem',
    description: 'Kabelky a kufry Marina Galanti.',
  },
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={`${poppins.variable} ${forum.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1 pt-[76px] md:pt-[88px]">
          <PageTransition>{children}</PageTransition>
        </main>
        <SiteFooter />
        <CartDrawer />
        <CookieBanner />
      </body>
    </html>
  );
}
