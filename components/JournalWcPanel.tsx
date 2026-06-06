'use client';

import { useState, useEffect, useRef } from 'react';

interface WcEntry {
  filename: string;
  lines:    number;
  words:    number;
  chars:    number;
  accent:   string;
}

const TOP_DISPATCHES: WcEntry[] = [
  { filename: 'dispatch-560.mdx', lines: 148, words: 1182, chars: 7841,  accent: '#F97316' },
  { filename: 'dispatch-554.mdx', lines: 124, words: 1048, chars: 6924,  accent: '#F97316' },
  { filename: 'dispatch-538.mdx', lines: 118, words: 1024, chars: 6812,  accent: '#67e8f9' },
  { filename: 'dispatch-549.mdx', lines: 122, words: 1012, chars: 6731,  accent: '#4ade80' },
  { filename: 'dispatch-561.mdx', lines: 130, words:  998, chars: 6548,  accent: '#a78bfa' },
  { filename: 'dispatch-552.mdx', lines: 116, words:  984, chars: 6482,  accent: '#F97316' },
  { filename: 'dispatch-539.mdx', lines: 112, words:  947, chars: 6244,  accent: '#4ade80' },
  { filename: 'dispatch-553.mdx', lines: 108, words:  912, chars: 5981,  accent: '#fbbf24' },
  { filename: 'dispatch-555.mdx', lines: 104, words:  894, chars: 5842,  accent: '#67e8f9' },
  { filename: 'dispatch-541.mdx', lines: 102, words:  881, chars: 5741,  accent: '#F97316' },
];

const TOTALS = {
  dispatches: 561,
  lines:      58240,
  words:      170831,
  chars:      1142488,
};

export default function JournalWcPanel() {
  const [revealed, setRevealed] = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

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
    if (revealed === 0 || revealed > TOP_DISPATCHES.length + 1) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 70);
    return () => clearTimeout(id);
  }, [revealed]);

  return (
    <div
      ref={ref}
      className="overflow-x-auto font-mono"
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
          construx@sys — word count analysis
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: 'rgba(240,239,255,0.2)' }}>
          {TOTALS.words.toLocaleString()} words
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          wc -lwc content/journal/*.mdx | sort -rn -k2 | head -11
        </span>
      </div>

      {/* Column headers */}
      <div
        className="px-4 py-1 flex items-center select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.025)' }}
      >
        {[
          { label: 'LINES',    width: '64px' },
          { label: 'WORDS',    width: '72px' },
          { label: 'CHARS',    width: '80px' },
          { label: 'FILE',     width: 'auto' },
        ].map((col) => (
          <span
            key={col.label}
            className="text-[8px] uppercase tracking-wider"
            style={{ color: 'rgba(255,255,255,0.2)', minWidth: col.width, flexShrink: 0 }}
          >
            {col.label}
          </span>
        ))}
      </div>

      {/* File rows */}
      <div className="px-4 py-2 space-y-1">
        {TOP_DISPATCHES.slice(0, revealed).map((entry, i) => (
          <div key={i} className="flex items-center text-[8px] tabular-nums">
            <span style={{ color: 'rgba(240,239,255,0.4)', minWidth: '64px', flexShrink: 0 }}>
              {entry.lines.toString().padStart(5)}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.55)', minWidth: '72px', flexShrink: 0 }}>
              {entry.words.toString().padStart(6)}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.35)', minWidth: '80px', flexShrink: 0 }}>
              {entry.chars.toLocaleString()}
            </span>
            <span style={{ color: entry.accent + '90' }}>
              content/journal/{entry.filename}
            </span>
          </div>
        ))}

        {/* Total line */}
        {revealed > TOP_DISPATCHES.length && (
          <div className="flex items-center text-[8px] tabular-nums mt-1 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: '#F97316', minWidth: '64px', flexShrink: 0, fontWeight: 600 }}>
              {TOTALS.lines.toString().padStart(5)}
            </span>
            <span style={{ color: '#F97316', minWidth: '72px', flexShrink: 0, fontWeight: 600 }}>
              {TOTALS.words.toString().padStart(6)}
            </span>
            <span style={{ color: '#F97316', minWidth: '80px', flexShrink: 0 }}>
              {TOTALS.chars.toLocaleString()}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.35)' }}>
              total ({TOTALS.dispatches} files)
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          {TOTALS.dispatches} dispatches · top 10 by word count shown
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          avg {Math.round(TOTALS.words / TOTALS.dispatches)} words/dispatch
        </span>
      </div>
    </div>
  );
}
