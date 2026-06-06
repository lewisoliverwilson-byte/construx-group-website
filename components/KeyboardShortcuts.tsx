'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

const ROUTES: Record<string, string> = {
  j: '/journal',
  v: '/ventures',
  m: '/manifesto',
  w: '/work-with-us',
  f: '/founders',
  u: '/uses',
  n: '/now',
  s: '/stats',
  h: '/',
};

const LABELS: Record<string, string> = {
  j: 'Journal',
  v: 'Ventures',
  m: 'Manifesto',
  w: 'Work with us',
  f: 'Founders',
  u: 'Uses',
  n: 'Now',
  s: 'Stats',
  h: 'Home',
};

export default function KeyboardShortcuts() {
  const router = useRouter();
  const [gPressed, setGPressed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.target as HTMLElement).isContentEditable) return;

      if (e.key === '?') {
        setShowHelp((v) => !v);
        return;
      }
      if (e.key === 'Escape') {
        setShowHelp(false);
        setGPressed(false);
        return;
      }

      if (gPressed) {
        setGPressed(false);
        const route = ROUTES[e.key.toLowerCase()];
        if (route) router.push(route);
        return;
      }

      if (e.key === 'g' && !e.metaKey && !e.ctrlKey) {
        setGPressed(true);
        setTimeout(() => setGPressed(false), 1500);
      }
    },
    [gPressed, router]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <>
      {/* g-mode indicator */}
      {gPressed && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9995] flex items-center gap-3 px-4 py-2 pointer-events-none"
          style={{
            background: 'rgba(5,5,18,0.95)',
            border: '1px solid rgba(249,115,22,0.4)',
            borderRadius: '3px',
            boxShadow: '0 0 24px rgba(249,115,22,0.15)',
          }}
        >
          <kbd className="font-mono text-[11px] font-bold text-construx">G</kbd>
          <span className="font-mono text-[9px] text-text-dim uppercase tracking-widest">→</span>
          <div className="flex items-center gap-2">
            {Object.entries(LABELS).map(([key, label]) => (
              <span key={key} className="font-mono text-[9px] text-text-dim uppercase tracking-widest">
                <span className="text-construx/70">{key}</span>
                <span className="opacity-40">:{label.split(' ')[0].toLowerCase()}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* shortcut overlay */}
      {showHelp && (
        <div
          className="fixed inset-0 z-[9990] flex items-center justify-center p-5"
          style={{ background: 'rgba(0,0,8,0.85)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowHelp(false)}
        >
          <div
            className="w-full max-w-sm p-6"
            style={{ background: 'rgba(5,5,18,0.98)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: '3px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <p className="font-mono text-[9px] font-medium uppercase tracking-[0.25em] text-construx">
                // KEYBOARD SHORTCUTS
              </p>
              <button
                onClick={() => setShowHelp(false)}
                className="font-mono text-[9px] text-text-dim hover:text-text-muted transition-colors uppercase tracking-widest"
              >
                ESC
              </button>
            </div>

            <div className="space-y-2">
              {Object.entries(ROUTES).map(([key, path]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-text-dim">g</kbd>
                    <span className="text-text-dim text-[10px]">then</span>
                    <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-text-dim">{key}</kbd>
                  </div>
                  <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider">
                    {LABELS[key]}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-border">
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-text-dim">⌘K</kbd>
                <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider">search</span>
              </div>
              <div className="flex items-center justify-between">
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-text-dim">?</kbd>
                <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider">toggle this</span>
              </div>
            </div>

            <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest mt-5 opacity-50">
              Click anywhere or press ESC to close
            </p>
          </div>
        </div>
      )}
    </>
  );
}
