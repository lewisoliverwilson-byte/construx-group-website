'use client';

import { useState, useEffect, useRef } from 'react';

interface Term {
  name:    string;
  count:   number;
  files:   number;
  accent:  string;
}

const BASE_TERMS: Term[] = [
  { name: 'React',           count:  52, files: 38, accent: '#67e8f9' },
  { name: 'TypeScript',      count:  47, files: 42, accent: '#F97316' },
  { name: 'Next.js',         count:  42, files: 35, accent: '#a78bfa' },
  { name: 'PostgreSQL',      count:  38, files: 29, accent: '#4ade80' },
  { name: 'Docker',          count:  31, files: 24, accent: '#67e8f9' },
  { name: 'Redis',           count:  29, files: 22, accent: '#f87171' },
  { name: 'Node.js',         count:  26, files: 21, accent: '#4ade80' },
  { name: 'Prisma',          count:  22, files: 18, accent: '#fbbf24' },
  { name: 'Cloudflare',      count:  18, files: 14, accent: '#F97316' },
  { name: 'Tailwind',        count:  15, files: 13, accent: '#67e8f9' },
  { name: 'Playwright',      count:   8, files:  7, accent: '#a78bfa' },
  { name: 'OpenTelemetry',   count:   6, files:  5, accent: '#4ade80' },
];

const MAX_COUNT = Math.max(...BASE_TERMS.map((t) => t.count));
const BAR_WIDTH = 80;

function fmtBar(count: number, accent: string) {
  const w = Math.round((count / MAX_COUNT) * BAR_WIDTH);
  return (
    <span
      style={{
        display:         'inline-block',
        width:           `${w}px`,
        height:          '5px',
        background:      accent,
        opacity:         0.55,
        borderRadius:    '1px',
        verticalAlign:   'middle',
      }}
    />
  );
}

export default function TechFreqPanel() {
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
    if (revealed === 0 || revealed > BASE_TERMS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 80);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone     = revealed > BASE_TERMS.length;
  const totalMentions = BASE_TERMS.reduce((s, t) => s + t.count, 0);

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
          construx@sys — tech frequency
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(249,115,22,0.6)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${totalMentions} mentions` : 'scanning…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          rg -ic --stats &apos;react|typescript|next\.js|postgres|docker|redis&apos; content/journal/
        </span>
      </div>

      {/* Column headers */}
      <div
        className="flex items-center gap-3 px-4 py-1 text-[7px] uppercase tracking-widest select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
      >
        <span style={{ minWidth: '110px', flexShrink: 0 }}>TERM</span>
        <span style={{ minWidth: '36px', flexShrink: 0, textAlign: 'right' }}>HITS</span>
        <span style={{ minWidth: '40px', flexShrink: 0, textAlign: 'right' }}>FILES</span>
        <span style={{ minWidth: `${BAR_WIDTH + 8}px`, flexShrink: 0, paddingLeft: '8px' }}>FREQUENCY</span>
      </div>

      {/* Term rows */}
      <div className="px-4 py-2 space-y-1.5">
        {BASE_TERMS.slice(0, revealed).map((t, i) => (
          <div key={i} className="flex items-center gap-3 text-[8px] tabular-nums">
            <span style={{ color: t.accent, minWidth: '110px', flexShrink: 0, fontWeight: 600 }}>
              {t.name}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.55)', minWidth: '36px', flexShrink: 0, textAlign: 'right' }}>
              {t.count}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '40px', flexShrink: 0, textAlign: 'right' }}>
              {t.files}
            </span>
            <span style={{ paddingLeft: '8px', flexShrink: 0 }}>
              {fmtBar(t.count, t.accent)}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          {BASE_TERMS.length} terms · {totalMentions} mentions · rg 14.1
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          content/journal/**/*.mdx
        </span>
      </div>
    </div>
  );
}
