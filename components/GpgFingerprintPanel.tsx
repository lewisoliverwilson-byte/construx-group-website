'use client';

import { useState, useEffect, useRef } from 'react';

interface GpgKey {
  type:        string;
  algorithm:   string;
  date:        string;
  usage:       string;
  fingerprint: string;
  uid:         string;
  email:       string;
  sub?:        { algorithm: string; date: string; usage: string };
  accent:      string;
}

const KEYS: GpgKey[] = [
  {
    type:        'pub',
    algorithm:   'ed25519/0xA4F2C9B1E83D7F05',
    date:        '2028-01-15',
    usage:       '[SC]',
    fingerprint: 'A4F2 C9B1 E83D 7F05 2C18  9A3E 5F71 D420 8B6C E94A',
    uid:         'Lewis Wilson',
    email:       'lewis@construxgroup.io',
    sub:         { algorithm: 'cv25519/0x8B6CE94A2F71D420', date: '2028-01-15', usage: '[E]' },
    accent:      '#F97316',
  },
  {
    type:        'pub',
    algorithm:   'ed25519/0xD7B3E9F04A21C865',
    date:        '2028-01-15',
    usage:       '[SC]',
    fingerprint: 'D7B3 E9F0 4A21 C865 1F94  7B2D 3E82 A049 C71F 5B3A',
    uid:         'Dan',
    email:       'dan@construxgroup.io',
    sub:         { algorithm: 'cv25519/0xC71F5B3A3E82A049', date: '2028-01-15', usage: '[E]' },
    accent:      '#a78bfa',
  },
];

interface Line {
  label:   string;
  value:   string;
  accent?: string;
  indent?: number;
  divider?: boolean;
}

function buildLines(key: GpgKey): Line[] {
  const lines: Line[] = [
    { label: key.type,    value: `${key.algorithm}   ${key.date}   ${key.usage}`, accent: key.accent },
    { label: '',          value: key.fingerprint, indent: 1 },
    { label: 'uid',       value: `[ultimate] ${key.uid} <${key.email}>`, indent: 0 },
    ...(key.sub ? [{ label: 'sub', value: `${key.sub.algorithm}   ${key.sub.date}   ${key.sub.usage}`, indent: 0 }] : []),
  ];
  return lines;
}

export default function GpgFingerprintPanel() {
  const [revealed, setRevealed] = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const ALL_LINES: (Line & { keyAccent: string })[] = [
    ...buildLines(KEYS[0]).map((l) => ({ ...l, keyAccent: KEYS[0].accent })),
    { label: '', value: '', keyAccent: KEYS[0].accent, divider: true },
    ...buildLines(KEYS[1]).map((l) => ({ ...l, keyAccent: KEYS[1].accent })),
  ];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > ALL_LINES.length) return;
    const line  = ALL_LINES[revealed - 1];
    const delay = line.divider ? 30 : 75;
    const id = setTimeout(() => setRevealed((r) => r + 1), delay);
    return () => clearTimeout(id);
  }, [revealed, ALL_LINES.length]);

  const visibleLines = ALL_LINES.slice(0, revealed);
  const done = revealed > ALL_LINES.length;

  return (
    <div
      ref={ref}
      className="overflow-hidden font-mono"
      style={{
        background:   'rgba(1,1,10,0.97)',
        border:       '1px solid rgba(255,255,255,0.07)',
        borderRadius: '3px',
        boxShadow:    '0 0 0 1px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.6)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57', boxShadow: '0 0 4px rgba(255,95,87,0.4)' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E', boxShadow: '0 0 4px rgba(255,189,46,0.3)' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840', boxShadow: '0 0 4px rgba(40,200,64,0.3)' }} />
        </div>
        <span
          className="flex-1 text-center text-[9px] uppercase tracking-[0.2em]"
          style={{ color: 'rgba(255,255,255,0.22)' }}
        >
          construx@sys — gpg keys
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.2)' }}>
          ed25519
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          gpg --list-keys --fingerprint --with-colons construxgroup.io
        </span>
      </div>

      {/* Key lines */}
      <div className="px-4 py-3 space-y-0.5">
        {visibleLines.map((line, i) => {
          if (line.divider) {
            return <div key={i} className="h-3" />;
          }

          if (!line.label && !line.value) {
            return <div key={i} className="h-1" />;
          }

          const indent = line.indent ? 24 : 0;

          return (
            <div key={i} className="flex items-center gap-3 text-[8px]" style={{ paddingLeft: indent }}>
              {line.label ? (
                <span className="flex-shrink-0 text-[8px] font-semibold" style={{ color: line.accent ?? line.keyAccent, minWidth: '24px' }}>
                  {line.label}
                </span>
              ) : (
                <span className="flex-shrink-0" style={{ minWidth: '24px' }} />
              )}
              <span
                className="text-[8px] tabular-nums font-mono"
                style={{
                  color:      line.label === 'pub'
                    ? line.accent ?? 'rgba(240,239,255,0.6)'
                    : line.label === ''
                      ? 'rgba(240,239,255,0.35)'
                      : 'rgba(240,239,255,0.5)',
                  letterSpacing: line.label === '' ? '0.05em' : undefined,
                }}
              >
                {line.value}
              </span>
            </div>
          );
        })}

        {!done && revealed > 0 && (
          <div className="text-[8px] animate-pulse" style={{ color: 'rgba(74,222,128,0.5)' }}>▋</div>
        )}
      </div>

      {/* Verification footer */}
      {done && (
        <div
          className="px-4 py-1.5 flex items-center gap-3 select-none"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
        >
          <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
            gpg 2.4.4 · gnupg · ed25519 / cv25519 · all commits signed
          </span>
          <span className="ml-auto text-[8px] flex items-center gap-1.5" style={{ color: 'rgba(74,222,128,0.55)' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#4ade80' }} />
            trusted
          </span>
        </div>
      )}
    </div>
  );
}
