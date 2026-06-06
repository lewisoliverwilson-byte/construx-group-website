import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Nav from '@/components/nav/Nav';
import Footer from '@/components/footer/Footer';
import PostHogProvider from '@/components/PostHogProvider';
import ConsoleGreeting from '@/components/ConsoleGreeting';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import CommandPalette from '@/components/CommandPalette';
import { getAllPostMeta } from '@/lib/posts';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

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
  const allPosts = getAllPostMeta();
  const postCount = allPosts.length;
  return (
    <html lang="en" className={`noise scanlines ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:font-semibold focus:text-black focus:bg-construx focus:uppercase focus:tracking-wider"
          style={{ borderRadius: '3px' }}
        >
          Skip to content
        </a>
        <PostHogProvider>
          <ConsoleGreeting postCount={postCount} />
          <KeyboardShortcuts />
          <CommandPalette posts={allPosts} />
          <Nav postCount={postCount} />
          <main id="main-content">{children}</main>
          <Footer />
        </PostHogProvider>
      </body>
    </html>
  );
}
