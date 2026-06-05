import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Construx Group',
    short_name: 'Construx',
    description: 'A portfolio of AI-first ventures built at the frontier.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#000008',
    theme_color: '#F97316',
    categories: ['business', 'productivity'],
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icon-192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
