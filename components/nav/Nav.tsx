'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/ventures', label: 'Ventures' },
  { href: '/manifesto', label: 'Manifesto' },
  { href: '/journal', label: 'Journal' },
  { href: '/founders', label: 'Founders' },
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
            ? 'glass border-b border-border'
            : 'bg-transparent border-b border-transparent'
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0" aria-label="Construx Group home">
            <div
              className="h-[30px] w-[30px] flex items-center justify-center transition-all duration-200 group-hover:border-white/35"
              style={{
                border: '1px solid rgba(255,255,255,0.16)',
                borderRadius: '7px',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <span
                className="font-display text-[10px] tracking-[0.08em] text-white/85 group-hover:text-white transition-colors select-none"
                style={{ fontWeight: 700 }}
              >
                CX
              </span>
            </div>
            <span
              className="font-display text-[13px] tracking-[0.16em] text-white/90 uppercase"
              style={{ fontWeight: 600 }}
            >
              Construx<span className="text-white/30 ml-1.5 font-normal tracking-[0.2em]">Group</span>
            </span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
            {links.map(({ href, label }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative px-3.5 py-2 text-[13px] font-light tracking-wide transition-all duration-150 rounded-md',
                    active
                      ? 'text-white bg-white/[0.06]'
                      : 'text-white/45 hover:text-white/85 hover:bg-white/[0.03]'
                  )}
                >
                  {label}
                  {href === '/journal' && postCount ? (
                    <span
                      className="ml-1.5 font-mono text-[9px] tabular-nums px-1.5 py-0.5 rounded"
                      style={{
                        background: active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                        color: active ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.28)',
                      }}
                    >
                      {postCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* Right: CTA */}
          <div className="hidden md:flex items-center flex-shrink-0">
            <Link
              href="/work-with-us"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[12.5px] font-light text-white/85 hover:text-white transition-all duration-200 rounded-md"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.13)',
              }}
            >
              Work with us
              <ArrowUpRight size={12} className="opacity-50" />
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden flex items-center justify-center h-9 w-9 text-white/45 hover:text-white/80 transition-colors rounded-md"
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
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 240 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 glass border-l border-border flex flex-col pt-20 pb-8 px-6 md:hidden"
            >
              <div className="flex flex-col gap-0.5">
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
                        className={cn(
                          'flex items-center px-4 py-3 text-sm font-light tracking-wide transition-colors rounded-md',
                          active ? 'text-white bg-white/[0.05]' : 'text-white/45 hover:text-white/75'
                        )}
                      >
                        {label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-auto pt-6 border-t border-border">
                <p className="t-meta">Construx Group · Five live ventures</p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
