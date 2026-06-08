'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/ventures', label: 'Ventures' },
  { href: '/manifesto', label: 'Manifesto' },
  { href: '/founders', label: 'Founders' },
  { href: '/work-with-us', label: 'Work With Us' },
  { href: '/journal', label: 'Journal' },
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
          'fixed top-0 left-0 right-0 z-50 transition-all duration-400',
          scrolled || menuOpen
            ? 'glass border-b border-border'
            : 'bg-transparent border-b border-transparent'
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0" aria-label="Construx Group home">
            <div
              className="h-8 w-8 flex items-center justify-center border border-white/[0.15] group-hover:border-white/30 transition-colors"
              style={{ borderRadius: '4px' }}
            >
              <span
                className="font-display font-700 text-[11px] tracking-wider text-white/80 group-hover:text-white transition-colors select-none"
                style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700 }}
              >
                CX
              </span>
            </div>
            <div className="flex flex-col leading-none gap-0.5">
              <span
                className="text-[13px] font-semibold tracking-[0.14em] text-white/90 uppercase"
                style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 600 }}
              >
                Construx
              </span>
              <span className="text-[9px] font-mono tracking-[0.2em] text-white/30 uppercase">Group</span>
            </div>
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-0.5" aria-label="Primary navigation">
            {links.map(({ href, label }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative px-3.5 py-2 text-[13px] font-light tracking-wide transition-colors duration-150',
                    active ? 'text-white' : 'text-white/45 hover:text-white/80'
                  )}
                >
                  {label}
                  {active && (
                    <span
                      className="absolute bottom-0 left-3.5 right-3.5 h-px bg-white/40"
                    />
                  )}
                  {href === '/journal' && postCount ? (
                    <span
                      className="ml-1.5 font-mono text-[9px] tabular-nums px-1.5 py-0.5"
                      style={{
                        background: active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '3px',
                        color: active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.28)',
                      }}
                    >
                      {postCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* Right: status dot */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <span className="flex items-center gap-1.5 font-mono text-[9px] text-white/22 uppercase tracking-[0.18em]">
              <span
                className="inline-block rounded-full animate-glow-pulse"
                style={{
                  width: '5px', height: '5px',
                  background: '#4ade80',
                  boxShadow: '0 0 5px rgba(74,222,128,0.7)',
                }}
              />
              Online
            </span>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden flex items-center justify-center h-9 w-9 text-white/45 hover:text-white/80 transition-colors"
            style={{ borderRadius: '4px' }}
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
                {links.map(({ href, label }, i) => {
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
                          'flex items-center px-4 py-3 text-sm font-light tracking-wide transition-colors',
                          active ? 'text-white' : 'text-white/45 hover:text-white/75'
                        )}
                      >
                        {active && <span className="w-1 h-1 rounded-full bg-white/50 mr-3 flex-shrink-0" />}
                        {label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-auto pt-6 border-t border-border">
                <p className="font-mono text-[9px] text-white/20 tracking-[0.2em] uppercase">
                  Construx Group · All Systems Online
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
