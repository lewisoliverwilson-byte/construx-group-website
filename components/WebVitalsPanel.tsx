'use client';

import { useState, useEffect, useRef } from 'react';

interface VitalMetric {
  name:    string;
  abbr:    string;
  value:   number;
  unit:    string;
  good:    number;
  poor:    number;
  higher:  boolean; // higher = worse (e.g. LCP, CLS, INP)
}

interface RouteVital {
  route:    string;
  lcp:      number;
  cls:      number;
  inp:      number;
  ttfb:     number;
  fcp:      number;
  sessions: number;
}

const METRICS: VitalMetric[] = [
  { name: 'Largest Contentful Paint',  abbr: 'LCP',  value: 1.24, unit: 's',  good: 2.5,  poor: 4.0,    higher: true  },
  { name: 'Cumulative Layout Shift',   abbr: 'CLS',  value: 0.03, unit: '',   good: 0.1,  poor: 0.25,   higher: true  },
  { name: 'Interaction to Next Paint', abbr: 'INP',  value: 148,  unit: 'ms', good: 200,  poor: 500,    higher: true  },
  { name: 'Time to First Byte',        abbr: 'TTFB', value: 84,   unit: 'ms', good: 800,  poor: 1800,   higher: true  },
  { name: 'First Contentful Paint',    abbr: 'FCP',  value: 0.81, unit: 's',  good: 1.8,  poor: 3.0,    higher: true  },
];

const ROUTES: RouteVital[] = [
  { route: '/',              lcp: 1.24, cls: 0.03, inp: 148, ttfb: 84,  fcp: 0.81, sessions: 2841 },
  { route: '/journal',       lcp: 1.89, cls: 0.01, inp: 112, ttfb: 91,  fcp: 1.02, sessions: 1204 },
  { route: '/journal/[slug]',lcp: 1.44, cls: 0.02, inp: 88,  ttfb: 78,  fcp: 0.94, sessions: 4820 },
  { route: '/uses',          lcp: 2.11, cls: 0.04, inp: 164, ttfb: 102, fcp: 1.18, sessions:  441 },
  { route: '/now',           lcp: 1.68, cls: 0.02, inp: 132, ttfb: 89,  fcp: 0.99, sessions:  389 },
  { route: '/manifesto',     lcp: 1.91, cls: 0.01, inp: 108, ttfb: 96,  fcp: 1.08, sessions:  318 },
  { route: '/founders',      lcp: 1.72, cls: 0.03, inp: 124, ttfb: 88,  fcp: 0.96, sessions:  284 },
];

function score(metric: VitalMetric): 'good' | 'needs-improvement' | 'poor' {
  const v = metric.value;
  if (v <= metric.good) return 'good';
  if (v <= metric.poor) return 'needs-improvement';
  return 'poor';
}

function scoreColor(s: 'good' | 'needs-improvement' | 'poor'): string {
  if (s === 'good')             return '#4ade80';
  if (s === 'needs-improvement') return '#fbbf24';
  return '#f87171';
}

function routeLcpColor(lcp: number): string {
  if (lcp <= 2.5) return '#4ade80';
  if (lcp <= 4.0) return '#fbbf24';
  return '#f87171';
}

function bar(value: number, good: number, poor: number): string {
  const pct  = Math.min(1, value / poor);
  const bars = Math.round(pct * 10);
  return '█'.repeat(bars) + '░'.repeat(10 - bars);
}

export default function WebVitalsPanel() {
  const [revealed, setRevealed] = useState(0);
  const [jitter, setJitter]     = useState<number[]>(METRICS.map((m) => m.value));
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const TOTAL = METRICS.length + ROUTES.length;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 85);
    return () => clearTimeout(id);
  }, [revealed, TOTAL]);

  useEffect(() => {
    if (revealed <= TOTAL) return;
    const id = setInterval(() => {
      setJitter(METRICS.map((m) =>
        parseFloat((m.value * (0.95 + Math.random() * 0.10)).toFixed(m.unit === '' ? 3 : m.unit === 's' ? 2 : 0)),
      ));
    }, 2600);
    return () => clearInterval(id);
  }, [revealed, TOTAL]);

  const allDone = revealed > TOTAL;
  const metricPhase = Math.min(revealed, METRICS.length);
  const routePhase  = Math.max(0, Math.min(revealed - METRICS.length, ROUTES.length));

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
          construx@sys — crux-cli report construxgroup.io --field
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? 'p75 · 28d' : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>web-vitals --origin construxgroup.io --percentile=75 --period=28d</span>
      </div>

      <div className="px-4 py-2.5 space-y-4">
        {/* Core metrics */}
        {metricPhase > 0 && (
          <div>
            <div className="text-[7px] uppercase tracking-widest mb-2" style={{ color: 'rgba(240,239,255,0.2)' }}>Core Web Vitals (field data · p75)</div>
            <div className="space-y-1.5">
              {METRICS.slice(0, metricPhase).map((m, i) => {
                const live   = { ...m, value: jitter[i] };
                const s      = score(live);
                const col    = scoreColor(s);
                return (
                  <div key={m.abbr} className="flex items-center gap-3 text-[8px]">
                    <span style={{ color: col, fontWeight: 700, minWidth: '36px' }}>{m.abbr}</span>
                    <span className="tabular-nums" style={{ color: col, fontWeight: 700, minWidth: '56px' }}>
                      {m.unit === 's' ? `${live.value}s` : m.unit === 'ms' ? `${live.value}ms` : live.value}
                    </span>
                    <span className="tracking-widest text-[7px]" style={{ color: col }}>
                      {bar(live.value, m.good, m.poor)}
                    </span>
                    <span style={{ color: col, minWidth: '72px', fontWeight: 700 }}>{s.replace('-', ' ')}</span>
                    <span style={{ color: 'rgba(240,239,255,0.2)' }}>{m.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Per-route breakdown */}
        {routePhase > 0 && (
          <div>
            <div className="text-[7px] uppercase tracking-widest mb-1.5" style={{ color: 'rgba(240,239,255,0.2)' }}>Per-route LCP · sessions (28d)</div>
            <div
              className="flex items-center gap-3 px-0 py-0.5 text-[7px] uppercase tracking-widest mb-1"
              style={{ color: 'rgba(240,239,255,0.14)' }}
            >
              <span style={{ minWidth: '168px' }}>Route</span>
              <span style={{ minWidth: '52px' }}>LCP</span>
              <span style={{ minWidth: '44px' }}>CLS</span>
              <span style={{ minWidth: '48px' }}>INP</span>
              <span>Sessions</span>
            </div>
            <div className="space-y-0.5">
              {ROUTES.slice(0, routePhase).map((r) => (
                <div key={r.route} className="flex items-center gap-3 text-[8px]">
                  <span style={{ color: 'rgba(240,239,255,0.5)', minWidth: '168px' }}>{r.route}</span>
                  <span style={{ color: routeLcpColor(r.lcp), minWidth: '52px', fontWeight: 600 }}>{r.lcp}s</span>
                  <span style={{ color: r.cls <= 0.1 ? '#4ade80' : '#fbbf24', minWidth: '44px' }}>{r.cls}</span>
                  <span style={{ color: r.inp <= 200 ? '#4ade80' : '#fbbf24', minWidth: '48px' }}>{r.inp}ms</span>
                  <span style={{ color: 'rgba(240,239,255,0.3)' }}>{r.sessions.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {allDone && (
          <div className="text-[8px]" style={{ color: 'rgba(74,222,128,0.3)' }}>▌</div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          CrUX field data · Chrome UX Report · 28-day window
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● good' : 'loading'}
        </span>
      </div>
    </div>
  );
}
