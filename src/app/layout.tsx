import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { CookieBanner } from '@/components/CookieBanner';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin', 'latin-ext'],
});
const playfair = Playfair_Display({
  variable: '--font-serif',
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://levstra.cz';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Levstra — Cestujte se stylem',
    template: '%s | Levstra',
  },
  description:
    'Kabelky a kufry Marina Galanti. Módu dovážíme už přes dvě desetiletí. Doprava zdarma nad 1 500 Kč.',
  keywords: [
    'kabelky',
    'kufry',
    'Marina Galanti',
    'cestovní zavazadla',
    'Levstra',
    'módní doplňky',
  ],
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    siteName: 'Levstra',
    title: 'Levstra — Cestujte se stylem',
    description:
      'Kabelky a kufry Marina Galanti. Módu dovážíme už přes dvě desetiletí.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Levstra' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Levstra — Cestujte se stylem',
    description: 'Kabelky a kufry Marina Galanti.',
    images: ['/og.png'],
  },
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="cs"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fdfaf6] text-neutral-900 font-sans">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <CookieBanner />
      </body>
    </html>
  );
}
