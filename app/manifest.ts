import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Construx Group',
    short_name: 'Construx',
    description: 'A portfolio of AI-first ventures built at the frontier.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000008',
    theme_color: '#F97316',
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
    ],
  };
}
