import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ciaobag — Cestujte se stylem',
    short_name: 'Ciaobag',
    description: 'Kabelky a kufry Marina Galanti. Doprava zdarma nad 1 500 Kč.',
    start_url: '/',
    display: 'standalone',
    lang: 'cs',
    background_color: '#f2f0eb',
    theme_color: '#2d5143',
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { src: '/icon', sizes: '64x64', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
