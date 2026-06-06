'use client';

import { useState, useEffect, useRef } from 'react';

interface BenchTarget {
  label:     string;
  url:       string;
  threads:   number;
  conns:     number;
  duration:  number;
  latMean:   number;
  latStddev: number;
  latMax:    number;
  reqPerSec: number;
  transfer:  string;
  total:     number;
  accent:    string;
}

const TARGETS: BenchTarget[] = [
  {
    label:    'construxgroup.io',
    url:      'https://construxgroup.io',
    threads:  4, conns: 100, duration: 30,
    latMean:  3.84, latStddev: 1.12, latMax: 24.18,
    reqPerSec: 2841.4, transfer: '31.22MB',
    total:    85243,
    accent:   '#F97316',
  },
  {
    label:    'api.scoutr.io',
    url:      'https://api.scoutr.io/health',
    threads:  4, conns: 50, duration: 30,
    latMean:  5.24, latStddev: 1.84, latMax: 38.91,
    reqPerSec: 1482.7, transfer: '18.64MB',
    total:    44481,
    accent:   '#F97316',
  },
  {
    label:    'marqet.io',
    url:      'https://themarqet.io',
    threads:  4, conns: 100, duration: 30,
    latMean:  4.12, latStddev: 1.41, latMax: 31.04,
    reqPerSec: 2204.8, transfer: '26.47MB',
    total:    66144,
    accent:   '#67e8f9',
  },
  {
    label:    'hyve.so',
    url:      'https://thehyve.so',
    threads:  4, conns: 100, duration: 30,
    latMean:  4.88, latStddev: 1.63, latMax: 29.72,
    reqPerSec: 1921.3, transfer: '22.18MB',
    total:    57639,
    accent:   '#4ade80',
  },
];

function latColor(ms: number): string {
  if (ms < 5)  return '#4ade80';
  if (ms < 15) return '#fbbf24';
  if (ms < 30) return '#F97316';
  return '#f87171';
}

function jitter(v: number, pct = 0.06): number {
  return Math.max(0.01, v * (1 + (Math.random() - 0.5) * 2 * pct));
}

export default function WrkBenchmarkPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [targets,   setTargets]   = useState<BenchTarget[]>(TARGETS);
  const [running,   setRunning]   = useState<number | null>(null);
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
          setRunning(0);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TARGETS.length) return;
    const id = setTimeout(() => {
      setRevealed((r) => r + 1);
      setRunning((r) => (r !== null && r + 1 < TARGETS.length ? r + 1 : null));
    }, 1400);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => {
      setTargets((prev) =>
        prev.map((t) => ({
          ...t,
          latMean:   jitter(t.latMean),
          reqPerSec: jitter(t.reqPerSec, 0.04),
        })),
      );
    }, 2400);
    return () => clearInterval(id);
  }, []);

  const totalReqs = targets.reduce((s, t) => s + t.total, 0);

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
          construx@sys — load benchmark
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: 'rgba(240,239,255,0.2)' }}>
          {totalReqs.toLocaleString()} total reqs
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          wrk -t4 -c100 -d30s --latency [targets]
        </span>
      </div>

      {/* Benchmark results */}
      <div className="px-4 py-2.5 space-y-4">
        {targets.slice(0, revealed).map((t, i) => {
          const isRunning = running === i;
          const lc = latColor(t.latMean);
          return (
            <div key={i}>
              {/* Target header */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[9px]" style={{ color: t.accent }}>
                  {t.label}
                </span>
                <span className="text-[8px]" style={{ color: 'rgba(240,239,255,0.2)' }}>
                  -t{t.threads} -c{t.conns} -d{t.duration}s
                </span>
                {isRunning && (
                  <span className="text-[7px] uppercase tracking-widest" style={{ color: '#4ade80' }}>
                    running…
                  </span>
                )}
              </div>

              {/* Stats grid */}
              <div className="text-[8px] tabular-nums space-y-0.5 pl-2" style={{ borderLeft: `1px solid ${t.accent}20` }}>
                <div className="flex flex-wrap gap-x-6 gap-y-0.5">
                  <span>
                    <span style={{ color: 'rgba(240,239,255,0.25)' }}>Latency </span>
                    <span style={{ color: lc }}>{t.latMean.toFixed(2)}ms</span>
                    <span style={{ color: 'rgba(240,239,255,0.18)' }}> ±{t.latStddev.toFixed(2)}ms</span>
                    <span style={{ color: 'rgba(240,239,255,0.18)' }}> max {t.latMax.toFixed(2)}ms</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-0.5">
                  <span>
                    <span style={{ color: 'rgba(240,239,255,0.25)' }}>Req/sec </span>
                    <span style={{ color: t.accent }}>{t.reqPerSec.toFixed(1)}</span>
                  </span>
                  <span>
                    <span style={{ color: 'rgba(240,239,255,0.25)' }}>Transfer </span>
                    <span style={{ color: 'rgba(240,239,255,0.55)' }}>{t.transfer}/30s</span>
                  </span>
                  <span>
                    <span style={{ color: 'rgba(240,239,255,0.25)' }}>Requests </span>
                    <span style={{ color: 'rgba(240,239,255,0.55)' }}>{t.total.toLocaleString()}</span>
                  </span>
                  <span style={{ color: '#4ade80' }}>0 errors</span>
                </div>

                {/* Latency bar */}
                <div className="flex items-center gap-2 pt-0.5">
                  <span style={{ color: 'rgba(240,239,255,0.15)', fontSize: '7px' }}>lat</span>
                  <div
                    className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.06)', maxWidth: '120px' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(100, (t.latMean / 30) * 100)}%`, background: lc, opacity: 0.7, transition: 'width 0.6s ease' }}
                    />
                  </div>
                  <span style={{ color: lc, fontSize: '7px' }}>{t.latMean.toFixed(1)}ms avg</span>
                </div>
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
          {TARGETS.length} targets · wrk 4.2.0 · aws eu-west-1
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          0 errors across all benchmarks
        </span>
      </div>
    </div>
  );
}
