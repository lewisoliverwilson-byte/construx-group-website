'use client';

import { useState, useEffect, useRef } from 'react';

interface Metric {
  name:  string;
  value: string;
  unit:  string;
  trend: 'good' | 'warn' | 'bad' | 'neutral';
  bar?:  number; // 0–100
}

interface ScenarioRow {
  time:   string;
  vus:    number;
  iters:  number;
  passes: number;
  fails:  number;
  rps:    number;
  p95:    string;
}

const SCENARIOS: ScenarioRow[] = [
  { time: '0s',  vus:  10, iters:   42, passes:  42, fails: 0, rps:  42.0, p95: '182ms' },
  { time: '10s', vus:  25, iters:  210, passes: 210, fails: 0, rps:  78.3, p95: '241ms' },
  { time: '20s', vus:  50, iters:  530, passes: 528, fails: 2, rps: 103.1, p95: '318ms' },
  { time: '30s', vus: 100, iters:  980, passes: 971, fails: 9, rps: 148.7, p95: '472ms' },
  { time: '40s', vus: 200, iters: 1640, passes:1621, fails:19, rps: 196.2, p95: '644ms' },
  { time: '50s', vus: 200, iters: 2300, passes:2277, fails:23, rps: 197.8, p95: '631ms' },
  { time: '60s', vus: 100, iters: 2740, passes:2720, fails:20, rps: 149.3, p95: '401ms' },
];

const METRICS: Metric[] = [
  { name: 'http_reqs',           value: '14 821',   unit: '',    trend: 'neutral', bar: 100 },
  { name: 'http_req_duration',   value: '412',      unit: 'ms',  trend: 'good',    bar: 41 },
  { name: 'http_req_duration p90',value: '588',     unit: 'ms',  trend: 'good',    bar: 59 },
  { name: 'http_req_duration p95',value: '644',     unit: 'ms',  trend: 'warn',    bar: 64 },
  { name: 'http_req_duration p99',value: '1 124',   unit: 'ms',  trend: 'bad',     bar: 82 },
  { name: 'http_req_failed',     value: '0.49',     unit: '%',   trend: 'good',    bar: 5 },
  { name: 'http_req_blocked',    value: '1.2',      unit: 'ms',  trend: 'neutral', bar: 12 },
  { name: 'http_req_connecting', value: '0.4',      unit: 'ms',  trend: 'good',    bar: 4 },
  { name: 'http_req_tls_handshaking', value: '18.7',unit: 'ms',  trend: 'neutral', bar: 19 },
  { name: 'http_req_sending',    value: '0.06',     unit: 'ms',  trend: 'good',    bar: 1 },
  { name: 'http_req_waiting',    value: '393',      unit: 'ms',  trend: 'good',    bar: 39 },
  { name: 'http_req_receiving',  value: '18.3',     unit: 'ms',  trend: 'good',    bar: 18 },
  { name: 'iterations',          value: '14 821',   unit: '',    trend: 'neutral', bar: 100 },
  { name: 'vus_max',             value: '200',      unit: 'VUs', trend: 'neutral', bar: 100 },
  { name: 'data_received',       value: '48.2',     unit: 'MB',  trend: 'neutral', bar: 48 },
  { name: 'data_sent',           value: '6.1',      unit: 'MB',  trend: 'neutral', bar: 6 },
];

const CHECKS = [
  { name: 'status is 200',           passes: 14749, fails: 72,  pct: 99.51 },
  { name: 'response time < 1000ms',  passes: 14693, fails: 128, pct: 99.14 },
  { name: 'body has data field',      passes: 14749, fails: 72,  pct: 99.51 },
];

function trendColor(t: Metric['trend']): string {
  if (t === 'good')    return '#4ade80';
  if (t === 'warn')    return '#fbbf24';
  if (t === 'bad')     return '#f87171';
  return 'rgba(240,239,255,0.4)';
}

function failColor(fails: number): string {
  if (fails === 0) return 'rgba(74,222,128,0.5)';
  if (fails < 10)  return '#fbbf24';
  return '#f87171';
}

function bar(pct: number, color: string): string {
  const filled = Math.round(pct / 10);
  return `<span style="color:${color}">${'█'.repeat(filled)}</span><span style="color:rgba(255,255,255,0.08)">${'░'.repeat(10 - filled)}</span>`;
}

function Bar({ pct, color }: { pct: number; color: string }) {
  const filled = Math.round(pct / 10);
  return (
    <span className="tabular-nums">
      <span style={{ color }}>{'█'.repeat(filled)}</span>
      <span style={{ color: 'rgba(255,255,255,0.08)' }}>{'░'.repeat(10 - filled)}</span>
    </span>
  );
}

void bar;

const TOTAL = SCENARIOS.length + METRICS.length + CHECKS.length;

export default function K6LoadTestPanel() {
  const [revealed, setRevealed] = useState(0);
  const [liveVus, setLiveVus]   = useState(200);
  const [liveRps, setLiveRps]   = useState(197.8);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

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
    const id = setTimeout(() => setRevealed((r) => r + 1), 72);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= TOTAL) return;
    const id = setInterval(() => {
      setLiveVus(Math.floor(185 + Math.random() * 30));
      setLiveRps(+(190 + Math.random() * 15).toFixed(1));
    }, 2100);
    return () => clearInterval(id);
  }, [revealed]);

  const allDone = revealed > TOTAL;

  const shownScenarios = SCENARIOS.slice(0, Math.max(0, Math.min(SCENARIOS.length, revealed)));
  const shownMetrics   = METRICS.slice(0, Math.max(0, Math.min(METRICS.length, revealed - SCENARIOS.length)));
  const shownChecks    = CHECKS.slice(0, Math.max(0, Math.min(CHECKS.length, revealed - SCENARIOS.length - METRICS.length)));

  const totalFails = CHECKS.reduce((s, c) => s + c.fails, 0);

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
          construx@sys — k6 run load-test.js
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveVus} VUs · ${liveRps} rps` : 'running…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>k6 run --vus 200 --duration 60s load-test.js</span>
      </div>

      {/* Progress banner */}
      {revealed > 0 && (
        <div
          className="px-4 py-1 text-[8px] select-none"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.25)' }}
        >
          <span style={{ color: 'rgba(96,165,250,0.7)' }}>scenarios:</span>
          {' '}(100.00%) 1 scenario, 200 max VUs, 1m30s max duration ·
          {' '}<span style={{ color: 'rgba(249,115,22,0.7)' }}>default:</span>
          {' '}200 looping VUs for 1m0s (gracefulStop: 30s)
        </div>
      )}

      {/* Scenario timeline */}
      {shownScenarios.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — timeline · vus / iterations / rps / p95
          </div>
          <div className="space-y-0.5">
            {shownScenarios.map((s, i) => (
              <div key={i} className="flex items-center text-[8px] leading-[1.6] gap-2">
                <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '28px', flexShrink: 0 }}>{s.time}</span>
                <span style={{ color: '#60a5fa', minWidth: '56px', flexShrink: 0 }}>{s.vus} VUs</span>
                <span style={{ color: 'rgba(240,239,255,0.35)', minWidth: '68px', flexShrink: 0 }}>{s.iters} iters</span>
                <span style={{ color: '#4ade80', minWidth: '56px', flexShrink: 0 }}>{s.rps} rps</span>
                <span style={{ color: s.fails === 0 ? 'rgba(74,222,128,0.4)' : '#fbbf24', minWidth: '52px', flexShrink: 0 }}>
                  {s.fails === 0 ? '✓ 0 fail' : `✗ ${s.fails} fail`}
                </span>
                <span style={{ color: 'rgba(240,239,255,0.2)' }}>p95 {s.p95}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics */}
      {shownMetrics.length > 0 && (
        <div className="px-4 pt-2 pb-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — http metrics
          </div>
          <div className="space-y-0.5">
            {shownMetrics.map((m, i) => (
              <div key={i} className="flex items-center text-[8px] leading-[1.6] gap-2">
                <span style={{ color: 'rgba(240,239,255,0.35)', minWidth: '220px', flexShrink: 0 }}>{m.name}</span>
                <span style={{ color: trendColor(m.trend), minWidth: '64px', flexShrink: 0, fontWeight: 600 }}>
                  {m.value}{m.unit ? ` ${m.unit}` : ''}
                </span>
                {m.bar !== undefined && (
                  <Bar pct={m.bar} color={trendColor(m.trend)} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checks */}
      {shownChecks.length > 0 && (
        <div className="px-4 pt-2 pb-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — checks
          </div>
          <div className="space-y-0.5">
            {shownChecks.map((c, i) => (
              <div key={i} className="flex items-center text-[8px] leading-[1.6] gap-2">
                <span style={{ color: c.fails === 0 ? '#4ade80' : '#fbbf24' }}>
                  {c.fails === 0 ? '✓' : '✗'}
                </span>
                <span style={{ color: 'rgba(240,239,255,0.45)', minWidth: '200px', flexShrink: 0 }}>{c.name}</span>
                <span style={{ color: failColor(c.fails), minWidth: '52px', flexShrink: 0 }}>
                  {c.pct.toFixed(2)}%
                </span>
                <span style={{ color: 'rgba(240,239,255,0.2)' }}>
                  {c.passes.toLocaleString()} pass · {c.fails} fail
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cursor */}
      {allDone && (
        <div className="px-4 text-[8px]" style={{ color: 'rgba(74,222,128,0.3)' }}>▌</div>
      )}

      {/* Summary */}
      {allDone && (
        <div
          className="px-4 py-1 text-[8px] flex items-center gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>DONE</span>
          <span>14 821 iterations</span>
          <span style={{ color: totalFails > 0 ? '#fbbf24' : 'rgba(74,222,128,0.5)' }}>
            {totalFails} check failures
          </span>
          <span className="ml-auto">60s · max 200 VUs</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          k6 v0.53.0 · construxgroup.io · http/2
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● completed' : 'loading'}
        </span>
      </div>
    </div>
  );
}
