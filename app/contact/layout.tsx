import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Construx Group. We respond to every message, usually same day.',
  openGraph: {
    title: 'Contact | Construx Group',
    description: 'Get in touch with Construx Group. We respond to every message, usually same day.',
  },
  twitter: {
    title: 'Contact | Construx Group',
    description: 'Get in touch with Construx Group. We respond to every message, usually same day.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
