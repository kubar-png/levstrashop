import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = { title: 'Ciaobag Studio' };
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/** Studio takes the full viewport — opt out of the storefront chrome. */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
