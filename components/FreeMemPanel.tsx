'use client';

import { useState, useEffect, useRef } from 'react';

interface MemRow {
  label:   string;
  total:   number;
  used:    number;
  free:    number;
  shared:  number;
  cache:   number;
  avail:   number;
  accent:  string;
}

const BASE_ROWS: MemRow[] = [
  { label: 'Mem:',  total: 64441, used: 18241, free: 4812, shared: 412,  cache: 41388, avail: 44812, accent: '#67e8f9' },
  { label: 'Swap:', total: 16384, used:  1024, free: 15360,shared: 0,    cache: 0,     avail: 15360,accent: '#a78bfa' },
];

function jitter(v: number, pct = 0.08): number {
  return Math.max(0, Math.round(v * (1 + (Math.random() - 0.5) * 2 * pct)));
}

function fmtMiB(mb: number): string {
  if (mb >= 1024) return (mb / 1024).toFixed(1) + 'G';
  return mb + 'M';
}

function usedColor(pct: number): string {
  if (pct < 50) return '#4ade80';
  if (pct < 75) return '#fbbf24';
  if (pct < 90) return '#F97316';
  return '#f87171';
}

export default function FreeMemPanel() {
  const [revealed, setRevealed] = useState(0);
  const [rows,     setRows]     = useState<MemRow[]>(BASE_ROWS);
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
    if (revealed === 0 || revealed > BASE_ROWS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 120);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => {
      setRows((prev) =>
        prev.map((r) => {
          const used  = jitter(r.used, 0.06);
          const cache = jitter(r.cache, 0.04);
          const avail = r.total - used;
          const free  = Math.max(0, r.total - used - cache);
          return { ...r, used, cache, avail, free };
        }),
      );
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const mem     = rows[0];
  const swap    = rows[1];
  const memPct  = mem  ? Math.round((mem.used  / mem.total)  * 100) : 0;
  const swapPct = swap ? Math.round((swap.used / swap.total) * 100) : 0;

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
          construx@sys — memory usage
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: 'rgba(240,239,255,0.2)' }}>
          mem {memPct}% · swap {swapPct}%
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          free -m
        </span>
      </div>

      {/* Column headers */}
      <div
        className="px-4 py-1 flex items-center select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.025)' }}
      >
        <span className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.2)', minWidth: '56px', flexShrink: 0 }} />
        {[
          { label: 'TOTAL',  width: '80px' },
          { label: 'USED',   width: '80px' },
          { label: 'FREE',   width: '80px' },
          { label: 'SHARED', width: '72px' },
          { label: 'CACHE',  width: '80px' },
          { label: 'AVAIL',  width: 'auto' },
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

      {/* Rows */}
      <div className="px-4 py-2 space-y-2">
        {rows.slice(0, revealed).map((row, i) => {
          const pct = Math.round((row.used / row.total) * 100);
          const uc  = usedColor(pct);
          return (
            <div key={i}>
              <div className="flex items-center text-[8px] tabular-nums mb-1.5">
                <span style={{ color: row.accent, minWidth: '56px', flexShrink: 0, fontWeight: 700 }}>
                  {row.label}
                </span>
                <span style={{ color: 'rgba(240,239,255,0.45)', minWidth: '80px', flexShrink: 0 }}>
                  {fmtMiB(row.total)}
                </span>
                <span style={{ color: uc, minWidth: '80px', flexShrink: 0, fontWeight: pct > 70 ? 700 : 400 }}>
                  {fmtMiB(row.used)}
                </span>
                <span style={{ color: 'rgba(240,239,255,0.35)', minWidth: '80px', flexShrink: 0 }}>
                  {fmtMiB(row.free)}
                </span>
                <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '72px', flexShrink: 0 }}>
                  {row.shared > 0 ? fmtMiB(row.shared) : '—'}
                </span>
                <span style={{ color: 'rgba(240,239,255,0.35)', minWidth: '80px', flexShrink: 0 }}>
                  {row.cache > 0 ? fmtMiB(row.cache) : '—'}
                </span>
                <span style={{ color: '#4ade80' }}>
                  {fmtMiB(row.avail)}
                </span>
              </div>
              {/* Progress bar */}
              <div className="flex items-center gap-2 pl-14">
                <div className="h-1.5 rounded-full overflow-hidden flex-1" style={{ background: 'rgba(255,255,255,0.06)', maxWidth: '280px' }}>
                  {/* used portion */}
                  <div className="h-full flex">
                    <div
                      className="h-full"
                      style={{
                        width: `${(row.used / row.total) * 100}%`,
                        background: uc,
                        opacity: 0.75,
                        transition: 'width 0.5s ease',
                        borderRadius: '9999px 0 0 9999px',
                      }}
                    />
                    {row.cache > 0 && (
                      <div
                        className="h-full"
                        style={{
                          width: `${(row.cache / row.total) * 100}%`,
                          background: 'rgba(103,232,249,0.25)',
                          transition: 'width 0.5s ease',
                        }}
                      />
                    )}
                  </div>
                </div>
                <span className="text-[8px] tabular-nums" style={{ color: uc }}>
                  {pct}%
                </span>
                <span className="text-[8px]" style={{ color: 'rgba(240,239,255,0.2)' }}>
                  {fmtMiB(row.avail)} avail
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          {fmtMiB(BASE_ROWS[0]?.total ?? 0)} ddr4 ecc · 8-channel · live 2s
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          procfs
        </span>
      </div>
    </div>
  );
}
