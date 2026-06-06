'use client';

interface Bar {
  label: string;
  count: number;
  pct: number;
}

export default function ActivityHistogram({ bars, total }: { bars: Bar[]; total: number }) {
  return (
    <div className="mt-8 animate-fade-up" style={{ animationDelay: '520ms', animationFillMode: 'both' }}>
      <div className="flex items-center gap-4 mb-3">
        <p className="font-mono text-[9px] text-text-dim uppercase tracking-[0.2em]">
          // DISPATCH FREQUENCY
        </p>
        <span className="font-mono text-[9px] tabular-nums" style={{ color: 'rgba(249,115,22,0.4)' }}>
          {total} TOTAL
        </span>
      </div>
      <div className="flex items-end" style={{ gap: '3px' }}>
        {bars.map(({ label, count, pct }, i) => (
          <div key={label} className="flex flex-col items-center" style={{ gap: '3px' }}>
            <span
              className="font-mono tabular-nums"
              style={{ fontSize: '7px', color: 'rgba(249,115,22,0.55)', lineHeight: 1 }}
            >
              {count}
            </span>
            <div
              className="histogram-bar"
              style={{
                height: `${Math.max(3, Math.round(pct * 52))}px`,
                width: '18px',
                '--bar-height': `${Math.max(3, Math.round(pct * 52))}px`,
                background: `linear-gradient(to top, rgba(249,115,22,0.65), rgba(249,115,22,0.2))`,
                borderRadius: '2px 2px 0 0',
                animationDelay: `${i * 70}ms`,
              } as React.CSSProperties}
            />
            <span
              className="font-mono uppercase"
              style={{ fontSize: '7px', color: 'rgba(240,239,255,0.25)', lineHeight: 1 }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
