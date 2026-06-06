'use client';

import { useState, useEffect, useRef } from 'react';

interface ResultRow {
  period:    string;
  requests:  string;
  p50_ms:    string;
  p99_ms:    string;
  errors:    string;
  bytes_gb:  string;
}

const RESULT_ROWS: ResultRow[] = [
  { period: '2031-03-15', requests: '2,841,920', p50_ms: '42',  p99_ms: '188', errors: '0.02%', bytes_gb: '184.2' },
  { period: '2031-03-14', requests: '2,924,441', p50_ms: '39',  p99_ms: '194', errors: '0.01%', bytes_gb: '189.7' },
  { period: '2031-03-13', requests: '2,788,003', p50_ms: '44',  p99_ms: '201', errors: '0.03%', bytes_gb: '181.0' },
  { period: '2031-03-12', requests: '3,102,884', p50_ms: '38',  p99_ms: '179', errors: '0.01%', bytes_gb: '201.4' },
  { period: '2031-03-11', requests: '2,990,557', p50_ms: '41',  p99_ms: '192', errors: '0.02%', bytes_gb: '193.8' },
  { period: '2031-03-10', requests: '2,644,221', p50_ms: '47',  p99_ms: '215', errors: '0.04%', bytes_gb: '171.6' },
  { period: '2031-03-09', requests: '2,501,988', p50_ms: '49',  p99_ms: '221', errors: '0.02%', bytes_gb: '162.3' },
];

const META = [
  { label: 'Rows read',    value: '4,194,304,000', color: '#60a5fa' },
  { label: 'Bytes read',   value: '82.4 GB',        color: '#a78bfa' },
  { label: 'Elapsed',      value: '0.384s',          color: '#4ade80' },
  { label: 'Memory',       value: '128 MB',          color: '#fbbf24' },
];

const TOTAL = RESULT_ROWS.length + META.length;

function errorColor(e: string): string {
  const n = parseFloat(e);
  if (n >= 0.04) return '#f87171';
  if (n >= 0.02) return '#fbbf24';
  return '#4ade80';
}

function p99Color(p: string): string {
  const n = parseInt(p);
  if (n >= 200) return '#f87171';
  if (n >= 180) return '#fbbf24';
  return '#4ade80';
}

export default function ClickhouseQueryPanel() {
  const [revealed, setRevealed] = useState(0);
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
    const id = setTimeout(() => setRevealed((r) => r + 1), 81);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone    = revealed > TOTAL;
  const shownRows  = RESULT_ROWS.slice(0, Math.max(0, Math.min(RESULT_ROWS.length, revealed)));
  const shownMeta  = META.slice(0, Math.max(0, Math.min(META.length, revealed - RESULT_ROWS.length)));

  const totalReqs  = RESULT_ROWS.reduce((s, r) => s + parseInt(r.requests.replace(/,/g, '')), 0);

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
          construx@sys — clickhouse-client construx_analytics
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#60a5fa' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? '0.384s' : 'querying…'}
        </span>
      </div>

      {/* Shell prompt + query */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          clickhouse-client --query &quot;SELECT toDate(timestamp) AS period, count() AS requests, quantile(0.5)(duration_ms) AS p50_ms ...&quot;
        </span>
      </div>

      {/* Column headers */}
      {shownRows.length > 0 && (
        <div
          className="flex items-center px-4 py-0.5 text-[6.5px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ minWidth: '78px',  flexShrink: 0 }}>Period</span>
          <span style={{ minWidth: '88px',  flexShrink: 0, textAlign: 'right' }}>Requests</span>
          <span style={{ minWidth: '56px',  flexShrink: 0, textAlign: 'right' }}>p50 ms</span>
          <span style={{ minWidth: '56px',  flexShrink: 0, textAlign: 'right' }}>p99 ms</span>
          <span style={{ minWidth: '56px',  flexShrink: 0, textAlign: 'right' }}>Error %</span>
          <span style={{ minWidth: '64px',  flexShrink: 0, textAlign: 'right' }}>Data GB</span>
        </div>
      )}

      {/* Result rows */}
      <div className="px-4 py-1.5 space-y-0.5">
        {shownRows.map((r, i) => (
          <div key={i} className="flex items-center text-[7.5px] leading-[1.7]">
            <span style={{ color: 'rgba(240,239,255,0.35)', minWidth: '78px', flexShrink: 0 }}>{r.period}</span>
            <span style={{ color: 'rgba(240,239,255,0.55)', minWidth: '88px', flexShrink: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.requests}</span>
            <span style={{ color: '#4ade80', minWidth: '56px', flexShrink: 0, textAlign: 'right' }}>{r.p50_ms}</span>
            <span style={{ color: p99Color(r.p99_ms), minWidth: '56px', flexShrink: 0, textAlign: 'right', fontWeight: 700 }}>{r.p99_ms}</span>
            <span style={{ color: errorColor(r.errors), minWidth: '56px', flexShrink: 0, textAlign: 'right' }}>{r.errors}</span>
            <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '64px', flexShrink: 0, textAlign: 'right' }}>{r.bytes_gb}</span>
          </div>
        ))}
      </div>

      {/* Query meta */}
      {shownMeta.length > 0 && (
        <div
          className="flex items-center gap-5 flex-wrap px-4 py-1.5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          {shownMeta.map((m, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[7.5px]">
              <span style={{ color: 'rgba(240,239,255,0.22)' }}>{m.label}:</span>
              <span style={{ color: m.color, fontWeight: 700 }}>{m.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span>{RESULT_ROWS.length} rows</span>
          <span style={{ color: '#60a5fa' }}>~{(totalReqs / 1_000_000).toFixed(1)}M total requests</span>
          <span className="ml-auto">4.2B rows scanned in 0.384s</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          clickhouse 24.6.3 · construx_analytics · requests_v2
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#60a5fa' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? `● 7 rows` : 'loading'}
        </span>
      </div>
    </div>
  );
}
