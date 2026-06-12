'use client';

import type { CSSProperties } from 'react';

interface Bar {
  label: string;
  count: number;
  pct: number;
}

export default function ActivityHistogram({ bars, total }: { bars: Bar[]; total: number }) {
  if (bars.length === 0) return null;

  const avg = total / bars.length;
  const maxCount = Math.max(...bars.map((b) => b.count), 1);
  const avgPct = avg / maxCount;
  const peakBar = bars.reduce((a, b) => (b.count > a.count ? b : a), bars[0]);

  return (
    <div
      className="mt-8 overflow-hidden animate-fade-up"
      style={{
        animationDelay: '520ms',
        animationFillMode: 'both',
        background: 'rgba(0,0,6,0.65)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '3px',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2.5 px-3 py-2 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ background: '#FF5F57' }} />
          <span className="w-2 h-2 rounded-full" style={{ background: '#FFBD2E' }} />
          <span className="w-2 h-2 rounded-full" style={{ background: '#28C840' }} />
        </div>
        <span className="font-mono text-[8px] uppercase tracking-[0.18em] flex-1 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
          dispatch.frequency
        </span>
        <span className="font-mono text-[8px] tabular-nums" style={{ color: 'rgba(249,115,22,0.4)' }}>
          {String(total).padStart(3, '0')}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-3 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="font-mono text-[9px]" style={{ color: 'rgba(74,222,128,0.4)' }}>
          construx@sys:~$
        </span>
        <span className="font-mono text-[9px]" style={{ color: 'rgba(240,239,255,0.22)' }}>
          {' '}dispatch --hist --group=month
        </span>
      </div>

      <div className="px-4 pt-4 pb-3">
      {/* Peak label */}
      <div className="flex items-center justify-end mb-2">
        <span className="font-mono text-[8px] tabular-nums" style={{ color: 'rgba(255,255,255,0.15)' }}>
          PEAK {peakBar.label.toUpperCase()}: {peakBar.count}
        </span>
      </div>

      {/* Chart area */}
      <div className="relative">
        {/* Average line */}
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            bottom: `${Math.round(avgPct * 52) + 12}px`,
            borderTop: '1px dashed rgba(249,115,22,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: '7px',
              color: 'rgba(249,115,22,0.35)',
              background: 'rgba(0,0,6,0.9)',
              padding: '0 3px',
              lineHeight: 1.4,
              letterSpacing: '0.08em',
            }}
          >
            AVG {avg.toFixed(1)}
          </span>
        </div>

        {/* Bars */}
        <div className="flex items-end" style={{ gap: '3px' }}>
          {bars.map(({ label, count, pct }, i) => {
            const isPeak = label === peakBar.label && count === peakBar.count;
            const heightPx = Math.max(3, Math.round(pct * 52));
            return (
              <div key={label} className="flex flex-col items-center" style={{ gap: '3px' }}>
                <span
                  className="font-mono tabular-nums"
                  style={{
                    fontSize: '7px',
                    color: isPeak ? 'rgba(249,115,22,0.9)' : 'rgba(249,115,22,0.45)',
                    lineHeight: 1,
                    fontWeight: isPeak ? 700 : 400,
                  }}
                >
                  {count}
                </span>
                <div
                  className="histogram-bar"
                  style={{
                    height: `${heightPx}px`,
                    width: '18px',
                    '--bar-height': `${heightPx}px`,
                    background: isPeak
                      ? `linear-gradient(to top, rgba(249,115,22,0.9), rgba(253,186,116,0.4))`
                      : `linear-gradient(to top, rgba(249,115,22,${0.3 + pct * 0.35}), rgba(249,115,22,0.1))`,
                    borderRadius: '2px 2px 0 0',
                    animationDelay: `${i * 70}ms`,
                    boxShadow: isPeak ? '0 0 6px rgba(249,115,22,0.3)' : 'none',
                  } as CSSProperties}
                />
                <span
                  className="font-mono uppercase"
                  style={{
                    fontSize: '7px',
                    color: isPeak ? 'rgba(249,115,22,0.6)' : 'rgba(240,239,255,0.22)',
                    lineHeight: 1,
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}
