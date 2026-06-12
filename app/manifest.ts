import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Construx Group',
    short_name: 'Construx',
    description:
      'A UK engineering studio that designs and ships AI-native products — from research to production.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F4F2ED',
    theme_color: '#F4F2ED',
    categories: ['business', 'productivity'],
    icons: [
      {
        src: '/brand/construx-mark-512px.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
