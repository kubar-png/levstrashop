import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { CookieBanner } from '@/components/CookieBanner';

const manrope = Manrope({
  variable: '--font-sans',
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://levstrashop.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Levstra — Cestujte se stylem',
    template: '%s | Levstra',
  },
  description:
    'Kabelky a kufry Marina Galanti. Módu dovážíme už přes dvě desetiletí. Doprava zdarma nad 1 500 Kč.',
  keywords: ['kabelky', 'kufry', 'Marina Galanti', 'cestovní zavazadla', 'Levstra'],
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    siteName: 'Levstra',
    title: 'Levstra — Cestujte se stylem',
    description: 'Kabelky a kufry Marina Galanti. Módu dovážíme už přes dvě desetiletí.',
  },
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={`${manrope.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <CookieBanner />
      </body>
    </html>
  );
}
