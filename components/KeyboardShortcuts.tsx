'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

const ROUTES: Record<string, string> = {
  b: '/blog',
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
  b: 'Blog',
  v: 'Ventures',
  m: 'Manifesto',
  w: 'Work With Us',
  f: 'Founders',
  u: 'Uses',
  n: 'Now',
  s: 'Stats',
  h: 'Home',
};

const SECTIONS = [
  { heading: 'Navigate', keys: ['j', 'v', 'm', 'f'] as const },
  { heading: 'Pages', keys: ['h', 'n', 'u', 's', 'w'] as const },
];

export default function KeyboardShortcuts() {
  const router = useRouter();
  const [gPressed, setGPressed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

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
        setPending(null);
        return;
      }

      if (gPressed) {
        setGPressed(false);
        const route = ROUTES[e.key.toLowerCase()];
        if (route) {
          setPending(e.key.toLowerCase());
          setTimeout(() => setPending(null), 600);
          router.push(route);
        }
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
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9995] pointer-events-none overflow-hidden"
          style={{
            background: 'rgba(3,3,16,0.98)',
            border: '1px solid rgba(249,115,22,0.35)',
            borderRadius: '4px',
            boxShadow: '0 0 0 1px rgba(249,115,22,0.08), 0 8px 32px rgba(0,0,0,0.7), 0 0 40px rgba(249,115,22,0.08)',
          }}
        >
          {/* title bar */}
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: 'rgba(249,115,22,0.5)' }}>
              g:mode — awaiting key
            </span>
            <span
              className="w-1.5 h-1.5 rounded-full ml-auto status-blink"
              style={{ background: 'rgba(249,115,22,0.8)', boxShadow: '0 0 4px rgba(249,115,22,0.6)' }}
            />
          </div>

          {/* Shell prompt */}
          <div className="px-3 py-1 select-none" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
            <span className="font-mono text-[8px]" style={{ color: 'rgba(74,222,128,0.4)' }}>construx@sys:~$</span>
            <span className="font-mono text-[8px] ml-1" style={{ color: 'rgba(240,239,255,0.2)' }}>keymap --g-mode --listen</span>
          </div>
          {/* key grid */}
          <div className="flex items-center gap-1 px-3 py-2.5 flex-wrap max-w-xs">
            {Object.entries(LABELS).map(([key, label]) => {
              const isActive = pending === key;
              return (
                <span key={key} className="flex items-center gap-0.5">
                  <kbd
                    className="font-mono text-[10px] px-1.5 py-0.5 transition-all"
                    style={{
                      background: isActive ? 'rgba(249,115,22,0.25)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isActive ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '2px',
                      color: isActive ? '#F97316' : 'rgba(249,115,22,0.6)',
                    }}
                  >
                    {key}
                  </kbd>
                  <span
                    className="font-mono text-[8px] uppercase tracking-widest pr-2"
                    style={{ color: isActive ? 'rgba(240,239,255,0.6)' : 'rgba(255,255,255,0.2)' }}
                  >
                    {label.split(' ')[0].toLowerCase()}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* shortcut overlay */}
      {showHelp && (
        <div
          className="fixed inset-0 z-[9990] flex items-center justify-center p-5"
          style={{ background: 'rgba(0,0,8,0.85)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowHelp(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden"
            style={{
              background: 'rgba(3,3,16,0.99)',
              border: '1px solid rgba(249,115,22,0.2)',
              borderRadius: '4px',
              boxShadow: '0 0 0 1px rgba(249,115,22,0.05), 0 32px 64px rgba(0,0,0,0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* macOS title bar */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full cursor-pointer"
                  style={{ background: '#FF5F57' }}
                  onClick={() => setShowHelp(false)}
                />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] flex-1 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
                keyboard.shortcuts — construx/sys
              </span>
              <button
                onClick={() => setShowHelp(false)}
                className="font-mono text-[9px] uppercase tracking-widest transition-colors"
                style={{ color: 'rgba(255,255,255,0.2)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.2)'; }}
              >
                ESC
              </button>
            </div>

            {/* Shell prompt */}
            <div
              className="px-4 py-1.5 select-none"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
            >
              <span className="font-mono text-[9px]" style={{ color: 'rgba(74,222,128,0.4)' }}>
                construx@sys:~$
              </span>
              <span className="font-mono text-[9px]" style={{ color: 'rgba(240,239,255,0.22)' }}>
                {' '}keymap --show --bindings
              </span>
            </div>

            <div className="px-5 py-4">
              {/* g+key navigation */}
              {SECTIONS.map(({ heading, keys }) => (
                <div key={heading} className="mb-4">
                  <p className="font-mono text-[8px] uppercase tracking-[0.2em] mb-2.5" style={{ color: 'rgba(249,115,22,0.4)' }}>
                    // {heading.toUpperCase()}
                  </p>
                  <div className="flex flex-col gap-1">
                    {keys.map((key) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <kbd
                            className="font-mono text-[9px] px-1.5 py-0.5"
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.09)',
                              borderRadius: '2px',
                              color: 'rgba(249,115,22,0.6)',
                            }}
                          >
                            g
                          </kbd>
                          <span className="font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>then</span>
                          <kbd
                            className="font-mono text-[9px] px-1.5 py-0.5"
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.09)',
                              borderRadius: '2px',
                              color: 'rgba(249,115,22,0.6)',
                            }}
                          >
                            {key}
                          </kbd>
                        </div>
                        <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'rgba(240,239,255,0.35)' }}>
                          {LABELS[key]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* system shortcuts */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                <p className="font-mono text-[8px] uppercase tracking-[0.2em] mb-2.5" style={{ color: 'rgba(249,115,22,0.4)' }}>
                  // SYSTEM
                </p>
                {[
                  { keys: ['⌘', 'K'], label: 'Command palette' },
                  { keys: ['?'], label: 'Toggle shortcuts' },
                  { keys: ['ESC'], label: 'Dismiss / close' },
                ].map(({ keys, label }) => (
                  <div key={label} className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      {keys.map((k) => (
                        <kbd
                          key={k}
                          className="font-mono text-[9px] px-1.5 py-0.5"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.09)',
                            borderRadius: '2px',
                            color: 'rgba(249,115,22,0.6)',
                          }}
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'rgba(240,239,255,0.35)' }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* footer */}
            <div
              className="px-5 py-2.5 flex items-center justify-between"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
            >
              <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
                construx/sys · keyboard.map
              </span>
              <span className="font-mono text-[8px]" style={{ color: 'rgba(255,255,255,0.12)' }}>
                click outside to dismiss
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
