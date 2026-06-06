'use client';

import { useState, useEffect, useRef } from 'react';

interface AccessRow {
  ts:      string;
  method:  string;
  path:    string;
  status:  number;
  ms:      number;
  bytes:   string;
  host:    string;
  isLive?: boolean;
}

const ROWS: AccessRow[] = [
  { ts: '09:14:00.112', method: 'GET',  path: '/',                              status: 200, ms:  48, bytes: '14.2kB', host: 'construxgroup.io' },
  { ts: '09:14:00.841', method: 'GET',  path: '/journal',                       status: 200, ms:  92, bytes: '22.8kB', host: 'construxgroup.io' },
  { ts: '09:14:01.204', method: 'POST', path: '/api/v1/contact',                status: 201, ms: 138, bytes: '0.3kB',  host: 'construxgroup.io' },
  { ts: '09:14:01.552', method: 'GET',  path: '/_next/static/chunks/app.js',   status: 200, ms:   3, bytes: '182kB',  host: 'construxgroup.io' },
  { ts: '09:14:01.903', method: 'GET',  path: '/api/v1/stats',                  status: 200, ms:  44, bytes: '1.8kB',  host: 'construxgroup.io' },
  { ts: '09:14:02.221', method: 'GET',  path: '/favicon.ico',                   status: 200, ms:   1, bytes: '4.3kB',  host: 'construxgroup.io' },
  { ts: '09:14:02.604', method: 'GET',  path: '/sitemap.xml',                   status: 200, ms:  18, bytes: '8.1kB',  host: 'construxgroup.io' },
  { ts: '09:14:02.991', method: 'POST', path: '/api/webhooks/stripe',           status: 200, ms:  62, bytes: '0.1kB',  host: 'construxgroup.io' },
  { ts: '09:14:03.340', method: 'GET',  path: '/uses',                          status: 200, ms:  74, bytes: '18.4kB', host: 'construxgroup.io' },
  { ts: '09:14:03.711', method: 'GET',  path: '/admin',                         status: 404, ms:   4, bytes: '0.8kB',  host: 'construxgroup.io' },
  { ts: '09:14:04.082', method: 'GET',  path: '/api/v1/workspaces',             status: 401, ms:   6, bytes: '0.1kB',  host: 'construxgroup.io' },
  { ts: '09:14:04.441', method: 'GET',  path: '/.env',                          status: 404, ms:   1, bytes: '0.0kB',  host: 'construxgroup.io' },
  { ts: '09:14:04.881', method: 'GET',  path: '/now',                           status: 200, ms:  88, bytes: '19.1kB', host: 'construxgroup.io', isLive: true },
  { ts: '09:14:05.223', method: 'GET',  path: '/journal/dispatch-748',          status: 200, ms: 112, bytes: '11.6kB', host: 'construxgroup.io', isLive: true },
];

const SUMMARY = [
  { label: '2xx',    count: 10, color: '#4ade80' },
  { label: '4xx',    count:  4, color: '#f87171' },
  { label: 'p50',    count: 46, color: '#60a5fa',  unit: 'ms' },
  { label: 'p99',    count: 138, color: '#fbbf24', unit: 'ms' },
];

const TOTAL = ROWS.length + SUMMARY.length;

function statusColor(s: number): string {
  if (s >= 500) return '#f87171';
  if (s >= 400) return '#fbbf24';
  if (s >= 300) return '#60a5fa';
  return '#4ade80';
}

function methodColor(m: string): string {
  if (m === 'POST')   return '#a78bfa';
  if (m === 'PUT')    return '#fbbf24';
  if (m === 'DELETE') return '#f87171';
  if (m === 'PATCH')  return '#fb923c';
  return 'rgba(240,239,255,0.45)';
}

function msColor(ms: number): string {
  if (ms >= 200) return '#f87171';
  if (ms >= 100) return '#fbbf24';
  if (ms >= 50)  return '#fb923c';
  return '#4ade80';
}

export default function CaddyAccessPanel() {
  const [revealed,   setRevealed]   = useState(0);
  const [liveReqs,   setLiveReqs]   = useState(14);
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
    const id = setTimeout(() => setRevealed((r) => r + 1), 75);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => setLiveReqs((c) => c + Math.floor(Math.random() * 3) + 1), 1950);
    return () => clearInterval(id);
  }, []);

  const allDone     = revealed > TOTAL;
  const shownRows   = ROWS.slice(0, Math.max(0, Math.min(ROWS.length, revealed)));
  const shownSumm   = SUMMARY.slice(0, Math.max(0, Math.min(SUMMARY.length, revealed - ROWS.length)));

  const errors = ROWS.filter((r) => r.status >= 400).length;

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
          construx@sys — caddy access log tail
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveReqs} req/5m` : 'tailing…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          tail -f /var/log/caddy/access.log | jq -r &apos;[.ts,.request.method,.request.uri,.status,.duration] | @tsv&apos;
        </span>
      </div>

      {/* Column headers */}
      {shownRows.length > 0 && (
        <div
          className="flex items-center px-4 py-0.5 text-[6.5px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ minWidth: '78px', flexShrink: 0 }}>Time</span>
          <span style={{ minWidth: '40px', flexShrink: 0 }}>Method</span>
          <span style={{ minWidth: '38px', flexShrink: 0 }}>Status</span>
          <span style={{ minWidth: '44px', flexShrink: 0 }}>Latency</span>
          <span style={{ minWidth: '44px', flexShrink: 0 }}>Size</span>
          <span>Path</span>
        </div>
      )}

      {/* Access rows */}
      <div className="px-4 py-1.5 space-y-px">
        {shownRows.map((r, i) => (
          <div
            key={i}
            className="flex items-start text-[7.5px] leading-[1.7]"
            style={{
              borderLeft: r.isLive ? '2px solid rgba(74,222,128,0.5)' : '2px solid transparent',
              paddingLeft: '4px',
            }}
          >
            <span style={{ color: 'rgba(240,239,255,0.18)', minWidth: '78px', flexShrink: 0 }}>{r.ts}</span>
            <span style={{ color: methodColor(r.method), minWidth: '40px', flexShrink: 0, fontWeight: 700 }}>{r.method}</span>
            <span style={{ color: statusColor(r.status), minWidth: '38px', flexShrink: 0, fontWeight: 700 }}>{r.status}</span>
            <span style={{ color: msColor(r.ms), minWidth: '44px', flexShrink: 0 }}>{r.ms}ms</span>
            <span style={{ color: 'rgba(240,239,255,0.22)', minWidth: '44px', flexShrink: 0 }}>{r.bytes}</span>
            <span style={{ color: r.status >= 400 ? 'rgba(251,191,36,0.5)' : 'rgba(240,239,255,0.3)' }}>{r.path}</span>
          </div>
        ))}
      </div>

      {/* Summary chips */}
      {shownSumm.length > 0 && (
        <div
          className="flex items-center gap-4 flex-wrap px-4 py-1.5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          {shownSumm.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[7.5px]">
              <span style={{ color: 'rgba(240,239,255,0.25)' }}>{s.label}:</span>
              <span style={{ color: s.color, fontWeight: 700 }}>{s.count}{s.unit ?? ''}</span>
            </div>
          ))}
          {allDone && (
            <span className="ml-auto text-[7px]" style={{ color: 'rgba(240,239,255,0.18)' }}>
              construxgroup.io · caddy 2.8.4
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          caddy 2.8.4 · https · acme tls · linux/amd64
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? (errors > 2 ? '#fbbf24' : '#4ade80') : 'rgba(240,239,255,0.15)' }}>
          {allDone ? `● ${ROWS.length} requests` : 'loading'}
        </span>
      </div>
    </div>
  );
}
