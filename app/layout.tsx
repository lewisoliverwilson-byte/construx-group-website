import type { Metadata, Viewport } from 'next';
import './globals.css';
import Nav from '@/components/nav/Nav';
import Footer from '@/components/footer/Footer';
import PostHogProvider from '@/components/PostHogProvider';

export const metadata: Metadata = {
  title: {
    default: 'Construx Group — AI-First Ventures',
    template: '%s | Construx Group',
  },
  description:
    'Construx Group is a portfolio of AI-first ventures built by a small team operating at the frontier of what AI makes possible.',
  keywords: ['AI ventures', 'AI-first startup', 'Construx Group', 'Scoutr', 'The Marqet', 'The Hyve'],
  authors: [{ name: 'Construx Group' }],
  creator: 'Construx Group',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://construxgroup.io'),
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'Construx Group',
    title: 'Construx Group — AI-First Ventures',
    description:
      'A portfolio of AI-first ventures built by a small team operating at the frontier of what AI makes possible.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Construx Group — AI-First Ventures',
    description:
      'A portfolio of AI-first ventures built by a small team operating at the frontier of what AI makes possible.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large' },
  },
};

export const viewport: Viewport = {
  themeColor: '#000008',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="noise scanlines">
      <body>
        <PostHogProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
        </PostHogProvider>
      </body>
    </html>
  );
}
