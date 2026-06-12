'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/ventures', label: 'Projects' },
  { href: '/manifesto', label: 'Manifesto' },
  { href: '/journal', label: 'Journal' },
  { href: '/founders', label: 'Studio' },
  { href: '/contact', label: 'Contact' },
];

interface Props {
  postCount?: number;
}

export default function Nav({ postCount }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled || menuOpen
            ? 'border-b'
            : 'border-b border-transparent'
        )}
        style={{
          background: scrolled || menuOpen ? 'rgba(244,242,237,0.94)' : 'transparent',
          backdropFilter: scrolled || menuOpen ? 'blur(12px)' : 'none',
          borderColor: scrolled || menuOpen ? 'var(--hairline)' : 'transparent',
        }}
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3.5 group flex-shrink-0" aria-label="Construx Group home">
            <Image
              src="/brand/construx-mark-512px.png"
              alt=""
              width={26}
              height={26}
              priority
              className="logo-mark"
            />
            <span
              className="font-display text-[14px] tracking-[0.16em] uppercase"
              style={{ fontWeight: 600, color: 'var(--ink)' }}
            >
              Construx<span className="ml-2 font-normal tracking-[0.2em]" style={{ color: 'var(--ink-faint)' }}>Group</span>
            </span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-9" aria-label="Primary navigation">
            {links.map(({ href, label }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-150 py-2 ${active ? '' : 'nav-link'}`}
                  style={{ color: active ? 'var(--ink)' : 'var(--ink-muted)' }}
                >
                  {label}
                  {href === '/journal' && postCount ? (
                    <span className="ml-1.5 tabular-nums" style={{ color: 'var(--ink-faint)' }}>
                      {postCount}
                    </span>
                  ) : null}
                  {active && (
                    <span
                      className="absolute -bottom-0.5 left-0 right-0 h-[1.5px]"
                      style={{ background: 'var(--orange)' }}
                    />
                  )}
                </Link>
              );
            })}
            <Link href="/work-with-us" className="btn-line" style={{ padding: '9px 18px' }}>
              Work with us
            </Link>
          </nav>

          {/* Mobile burger */}
          <button
            className="md:hidden flex items-center justify-center h-9 w-9 transition-colors"
            style={{ color: 'var(--ink-muted)' }}
            onClick={() => setMenuOpen(p => !p)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(22,24,26,0.3)' }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 240 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 flex flex-col pt-24 pb-8 px-7 md:hidden border-l"
              style={{ background: 'var(--paper)', borderColor: 'var(--hairline)' }}
            >
              <div className="flex flex-col gap-1">
                {[...links, { href: '/work-with-us', label: 'Work With Us' }].map(({ href, label }, i) => {
                  const active = pathname === href || (href !== '/' && pathname.startsWith(href));
                  return (
                    <motion.div
                      key={href}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 + 0.08 }}
                    >
                      <Link
                        href={href}
                        className="flex items-center gap-3 py-3 font-mono text-[12px] uppercase tracking-[0.14em] transition-colors"
                        style={{ color: active ? 'var(--ink)' : 'var(--ink-muted)' }}
                      >
                        {active && <span className="reg-mark" style={{ transform: 'scale(0.7)' }} />}
                        {label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-auto pt-6 border-t" style={{ borderColor: 'var(--hairline)' }}>
                <p className="t-meta">Construx Group · AI Development Studio</p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
