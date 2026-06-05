'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, X, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import { ventures } from '@/lib/ventures';

export default function ListViewToggle() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="fixed bottom-8 right-8 z-20 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium text-text-muted hover:text-text-base transition-all hover:border-border-bright"
        style={{
          background: 'rgba(5,5,18,0.82)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}
        aria-label={open ? 'Close venture list' : 'Open venture list'}
        aria-expanded={open}
      >
        {open ? <X size={13} /> : <List size={13} />}
        {open ? 'Close' : 'List view'}
      </button>

      {/* List panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
            className="fixed bottom-20 right-8 z-20 w-72 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(5,5,18,0.94)',
              backdropFilter: 'blur(28px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}
            role="navigation"
            aria-label="Venture list"
          >
            <div className="px-5 py-4 border-b border-border">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-dim">
                All Ventures
              </p>
            </div>
            <ul className="p-3 flex flex-col gap-1">
              {ventures.map((v, i) => (
                <motion.li
                  key={v.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-subtle transition-colors group">
                    <div
                      className="h-7 w-7 rounded-full flex-shrink-0"
                      style={{
                        background: `radial-gradient(circle at 35% 35%, ${v.accent}cc, ${v.accent}44)`,
                        boxShadow: `0 0 10px ${v.accent}44`,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-base leading-tight truncate">{v.name}</p>
                      <p className="text-xs text-text-dim truncate">{v.tagline}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <StatusBadge status={v.status} />
                      {v.url ? (
                        <a
                          href={v.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-border-bright transition-colors"
                          aria-label={`Visit ${v.name}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ArrowUpRight size={12} className="text-text-muted" />
                        </a>
                      ) : (
                        <Link
                          href={`/ventures/${v.slug}`}
                          className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-border-bright transition-colors"
                          aria-label={`Learn more about ${v.name}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ArrowUpRight size={12} className="text-text-muted" />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
            <div className="px-5 py-3 border-t border-border">
              <Link
                href="/ventures"
                className="text-xs text-text-dim hover:text-construx transition-colors"
              >
                View all ventures →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
