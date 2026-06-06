'use client';

import { useState, useEffect, useRef } from 'react';

interface BenchTarget {
  url:      string;
  rps:      number;
  latMean:  number;
  lat50:    number;
  lat95:    number;
  lat99:    number;
  latMax:   number;
  failed:   number;
  total:    number;
  accent:   string;
}

const BASE_TARGETS: BenchTarget[] = [
  {
    url:      'https://construxgroup.io/',
    rps:      1482.4,
    latMean:  6.74,
    lat50:    5.81,
    lat95:    14.24,
    lat99:    22.48,
    latMax:   48.11,
    failed:   0,
    total:    10000,
    accent:   '#F97316',
  },
  {
    url:      'https://construxgroup.io/api/health',
    rps:      3241.8,
    latMean:  3.08,
    lat50:    2.84,
    lat95:    6.12,
    lat99:    9.44,
    latMax:   21.22,
    failed:   0,
    total:    10000,
    accent:   '#4ade80',
  },
  {
    url:      'https://construxgroup.io/journal',
    rps:      824.1,
    latMean:  12.13,
    lat50:    10.92,
    lat95:    24.81,
    lat99:    38.44,
    latMax:   92.14,
    failed:   0,
    total:    10000,
    accent:   '#67e8f9',
  },
];

function jitter(v: number, pct = 0.08): number {
  return Math.max(0, v * (1 + (Math.random() - 0.5) * 2 * pct));
}

function rpsColor(rps: number): string {
  if (rps >= 2000) return '#4ade80';
  if (rps >= 1000) return '#F97316';
  if (rps >= 500)  return '#fbbf24';
  return '#f87171';
}

function latColor(ms: number): string {
  if (ms < 5)   return '#4ade80';
  if (ms < 15)  return '#fbbf24';
  if (ms < 50)  return '#F97316';
  return '#f87171';
}

export default function HttpBenchPanel() {
  const [revealed, setRevealed] = useState(0);
  const [targets,  setTargets]  = useState<BenchTarget[]>(BASE_TARGETS);
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
    if (revealed === 0 || revealed > BASE_TARGETS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 900);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => {
      setTargets((prev) =>
        prev.map((t) => ({
          ...t,
          rps:     jitter(t.rps, 0.06),
          latMean: jitter(t.latMean, 0.08),
          lat50:   jitter(t.lat50,   0.06),
          lat95:   jitter(t.lat95,   0.1),
          lat99:   jitter(t.lat99,   0.12),
          latMax:  jitter(t.latMax,  0.15),
        })),
      );
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const totalRps = targets.reduce((s, t) => s + t.rps, 0);

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
          construx@sys — http benchmark
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: 'rgba(240,239,255,0.2)' }}>
          {totalRps.toFixed(0)} rps total
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          ab -n 10000 -c 50 -k [targets]
        </span>
      </div>

      {/* Target blocks */}
      <div className="px-4 py-3 space-y-4">
        {targets.slice(0, revealed).map((t, i) => {
          const rc = rpsColor(t.rps);
          return (
            <div key={i}>
              {/* URL header */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[9px] font-bold" style={{ color: t.accent }}>
                  {t.url}
                </span>
                <span className="text-[8px]" style={{ color: 'rgba(240,239,255,0.2)', marginLeft: 'auto' }}>
                  n={t.total.toLocaleString()} c=50 keep-alive
                </span>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-x-5 gap-y-1 pl-2 text-[8px] tabular-nums mb-2">
                <div>
                  <span style={{ color: 'rgba(240,239,255,0.3)' }}>req/s </span>
                  <span style={{ color: rc, fontWeight: 700 }}>{t.rps.toFixed(1)}</span>
                </div>
                <div>
                  <span style={{ color: 'rgba(240,239,255,0.3)' }}>mean </span>
                  <span style={{ color: latColor(t.latMean) }}>{t.latMean.toFixed(2)}ms</span>
                </div>
                <div>
                  <span style={{ color: 'rgba(240,239,255,0.3)' }}>p50 </span>
                  <span style={{ color: latColor(t.lat50) }}>{t.lat50.toFixed(2)}ms</span>
                </div>
                <div>
                  <span style={{ color: 'rgba(240,239,255,0.3)' }}>p95 </span>
                  <span style={{ color: latColor(t.lat95) }}>{t.lat95.toFixed(2)}ms</span>
                </div>
                <div>
                  <span style={{ color: 'rgba(240,239,255,0.3)' }}>p99 </span>
                  <span style={{ color: latColor(t.lat99) }}>{t.lat99.toFixed(2)}ms</span>
                </div>
                <div>
                  <span style={{ color: 'rgba(240,239,255,0.3)' }}>max </span>
                  <span style={{ color: latColor(t.latMax) }}>{t.latMax.toFixed(2)}ms</span>
                </div>
                <div>
                  <span style={{ color: 'rgba(240,239,255,0.3)' }}>err </span>
                  <span style={{ color: t.failed > 0 ? '#f87171' : 'rgba(240,239,255,0.2)' }}>
                    {t.failed}
                  </span>
                </div>
              </div>

              {/* RPS bar */}
              <div className="flex items-center gap-2 pl-2">
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', width: '180px' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (t.rps / 4000) * 100)}%`,
                      background: rc,
                      opacity: 0.75,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
                <span className="text-[8px]" style={{ color: 'rgba(240,239,255,0.2)' }}>
                  {((t.rps / 4000) * 100).toFixed(0)}% capacity
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
          {BASE_TARGETS.length} targets · 10k req each · live 3s
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          apachebench 2.3 · https
        </span>
      </div>
    </div>
  );
}
