import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Nav from '@/components/nav/Nav';
import Footer from '@/components/footer/Footer';
import PostHogProvider from '@/components/PostHogProvider';
import ConsoleGreeting from '@/components/ConsoleGreeting';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import CommandPalette from '@/components/CommandPalette';
import { getAllPostMeta } from '@/lib/posts';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Construx Group — AI Development Studio',
    template: '%s | Construx Group',
  },
  description:
    'Construx Group is a UK engineering studio that designs and ships AI-native products — from research to production.',
  keywords: ['AI development studio', 'AI engineering', 'Construx Group', 'AI-native software'],
  authors: [{ name: 'Construx Group' }],
  creator: 'Construx Group',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://construxgroup.io'),
  icons: {
    icon: '/brand/construx-mark-512px.png',
    apple: '/brand/construx-mark-512px.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'Construx Group',
    title: 'Construx Group — AI Development Studio',
    description:
      'A UK engineering studio that designs and ships AI-native products — from research to production.',
    images: [{ url: '/brand/construx-social-light-1000px.png', width: 1000, height: 1000 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Construx Group — AI Development Studio',
    description:
      'A UK engineering studio that designs and ships AI-native products — from research to production.',
    images: ['/brand/construx-social-light-1000px.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large' },
  },
  alternates: {
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: 'Construx Group — Journal' }],
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#F4F2ED',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const allPosts = getAllPostMeta();
  const postCount = allPosts.length;
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@700,600,500,400&f[]=erode@400,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:font-semibold focus:text-[#F4F2ED] focus:bg-[#16181A] focus:uppercase focus:tracking-wider"
          style={{ borderRadius: '2px' }}
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
