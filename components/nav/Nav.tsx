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

function useLiveClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);

  return time;
}

function pathToShell(pathname: string): string {
  if (pathname === '/') return '~';
  // e.g. /journal/dispatch-123 → ~/journal/dispatch-123
  return `~${pathname}`;
}

export default function Nav({ postCount }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const time = useLiveClock();
  const shellPath = pathToShell(pathname);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
            ? 'glass border-b border-border shadow-[0_1px_0_rgba(255,255,255,0.05)]'
            : 'bg-transparent border-b border-transparent'
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group flex-shrink-0"
            aria-label="Construx Group home"
          >
            <div className="relative">
              <div className="h-8 w-8 bg-construx flex items-center justify-center shadow-[0_0_16px_rgba(249,115,22,0.4)] group-hover:shadow-[0_0_24px_rgba(249,115,22,0.6)] transition-shadow" style={{ borderRadius: '3px' }}>
                <span className="font-mono font-bold text-black text-sm leading-none select-none">CX</span>
              </div>
              <div className="absolute inset-0 bg-construx opacity-0 group-hover:opacity-20 blur-lg transition-opacity" style={{ borderRadius: '3px' }} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-wider text-text-base uppercase">Construx</span>
              <span className="text-[10px] font-medium tracking-widest text-text-muted uppercase">Group</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
            {links.map(({ href, label }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-all duration-150',
                    active
                      ? 'text-construx bg-construx-dim'
                      : 'text-text-muted hover:text-text-base hover:bg-subtle'
                  )}
                  style={{ borderRadius: '3px' }}
                >
                  {label}
                  {href === '/journal' && postCount && (
                    <span
                      className="font-mono text-[9px] font-medium tabular-nums px-1 py-px leading-none"
                      style={{
                        background: active ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.06)',
                        border: active ? '1px solid rgba(249,115,22,0.3)' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '2px',
                        color: active ? '#F97316' : 'rgba(240,239,255,0.4)',
                      }}
                    >
                      {postCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop right: path + clock + status */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {/* Current path */}
            <span
              className="font-mono text-[9px] tabular-nums max-w-[160px] truncate"
              style={{ color: 'rgba(249,115,22,0.4)' }}
              title={shellPath}
            >
              {shellPath}
            </span>

            {/* Divider */}
            <span style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

            {/* Live clock */}
            {time && (
              <span
                className="font-mono text-[10px] tabular-nums"
                style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}
              >
                {time}
              </span>
            )}

            {/* Status dot */}
            <span className="flex items-center gap-1">
              <span
                className="inline-block rounded-full flex-shrink-0"
                style={{
                  width: '5px', height: '5px',
                  background: '#28C840',
                  boxShadow: '0 0 4px rgba(40,200,64,0.7)',
                  animation: 'pulse 2.5s ease-in-out infinite',
                }}
              />
            </span>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden flex items-center justify-center h-9 w-9 hover:bg-subtle transition-colors text-text-muted hover:text-text-base"
            style={{ borderRadius: '3px' }}
            onClick={() => setMenuOpen((p) => !p)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
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
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 glass border-l border-border flex flex-col pt-20 pb-8 px-6 md:hidden"
              aria-label="Mobile navigation"
            >
              <div className="flex flex-col gap-1">
                {links.map(({ href, label }, i) => {
                  const active = pathname === href || (href !== '/' && pathname.startsWith(href));
                  return (
                    <motion.div
                      key={href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 + 0.1 }}
                    >
                      <Link
                        href={href}
                        className={cn(
                          'flex items-center px-4 py-3 font-mono text-sm font-medium transition-all uppercase tracking-wider',
                          active
                            ? 'text-construx bg-construx-dim'
                            : 'text-text-muted hover:text-text-base hover:bg-subtle'
                        )}
                      >
                        {label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-auto pt-6 border-t border-border">
                {/* Path + time row */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[9px] truncate max-w-[140px]" style={{ color: 'rgba(249,115,22,0.45)' }}>
                    {shellPath}
                  </span>
                  {time && (
                    <span className="font-mono text-[9px] tabular-nums" style={{ color: 'rgba(255,255,255,0.22)' }}>
                      {time}
                    </span>
                  )}
                </div>
                <p className="font-mono text-[9px] text-text-dim tracking-[0.2em] uppercase">
                  // CONSTRUX.GROUP
                </p>
                <p className="font-mono text-[9px] text-text-dim mt-1.5 uppercase tracking-widest flex items-center gap-1.5">
                  <span
                    className="inline-block rounded-full"
                    style={{
                      width: '5px', height: '5px',
                      background: '#28C840',
                      boxShadow: '0 0 4px rgba(40,200,64,0.5)',
                    }}
                  />
                  SYS:ONLINE
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
