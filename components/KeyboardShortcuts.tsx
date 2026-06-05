'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

const ROUTES: Record<string, string> = {
  j: '/journal',
  v: '/ventures',
  m: '/manifesto',
  w: '/work-with-us',
  f: '/founders',
  h: '/',
};

export default function KeyboardShortcuts() {
  const router = useRouter();
  const [gPressed, setGPressed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      // Ignore when typing in inputs
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
        // Reset g-mode after 1.5s if no second key
        setTimeout(() => setGPressed(false), 1500);
      }
    },
    [gPressed, router]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  if (!showHelp) return null;

  return (
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
                {path === '/' ? 'home' : path.replace('/', '').replace(/-/g, ' ')}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-text-dim">?</kbd>
            </div>
            <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider">toggle this</span>
          </div>
        </div>
      </div>
    </div>
  );
}
