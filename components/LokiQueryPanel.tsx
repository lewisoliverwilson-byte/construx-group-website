'use client';

import { useState, useEffect, useRef } from 'react';

interface LogLine {
  ts:        string;
  level:     'error' | 'warn' | 'info' | 'debug';
  stream:    string;
  msg:       string;
  isLive?:   boolean;
}

const LOGS: LogLine[] = [
  { ts: '09:14:01.002', level: 'info',  stream: 'construx-api',  msg: 'POST /api/v1/workspace/create 201 204ms userId=usr_9f2a3b' },
  { ts: '09:14:01.441', level: 'info',  stream: 'auth-service',  msg: 'JWT verified sub=usr_9f2a3b iss=construxgroup.io exp=+3600s' },
  { ts: '09:14:02.008', level: 'info',  stream: 'construx-api',  msg: 'GET /api/v1/workspaces 200 18ms count=7 userId=usr_1c4e5f' },
  { ts: '09:14:02.190', level: 'warn',  stream: 'construx-api',  msg: 'rate limit threshold reached ip=203.0.113.44 limit=100 window=60s' },
  { ts: '09:14:02.881', level: 'error', stream: 'stripe-worker', msg: 'charge failed stripe_error=card_declined customerId=cus_Nx82Pk amount=4900' },
  { ts: '09:14:03.112', level: 'info',  stream: 'construx-api',  msg: 'DELETE /api/v1/session 204 3ms userId=usr_4a7d9c' },
  { ts: '09:14:03.554', level: 'info',  stream: 'resend-worker', msg: 'email sent to=lewis@example.com msgId=re_92ka8bz3 latency=182ms' },
  { ts: '09:14:04.002', level: 'error', stream: 'construx-api',  msg: 'unhandled exception in POST /api/v1/export stack=TypeError: Cannot read properties of null' },
  { ts: '09:14:04.441', level: 'warn',  stream: 'postgres',      msg: 'slow query detected duration=1240ms table=workspaces rows=74910 — add index' },
  { ts: '09:14:04.880', level: 'info',  stream: 'construx-api',  msg: 'GET /api/v1/stats 200 44ms userId=usr_9f2a3b', isLive: true },
  { ts: '09:14:05.221', level: 'info',  stream: 'redis',         msg: 'keyspace hit ratio=0.94 evicted=0 connected_clients=12', isLive: true },
  { ts: '09:14:05.640', level: 'warn',  stream: 'auth-service',  msg: 'failed login attempt ip=198.51.100.7 attempts=5 user=admin@example.com' },
];

const STREAMS = [
  { name: 'construx-api',  count: 4, errors: 1 },
  { name: 'auth-service',  count: 2, errors: 0 },
  { name: 'stripe-worker', count: 1, errors: 1 },
  { name: 'resend-worker', count: 1, errors: 0 },
  { name: 'postgres',      count: 1, errors: 0 },
  { name: 'redis',         count: 1, errors: 0 },
];

const TOTAL = LOGS.length + STREAMS.length;

function levelColor(l: LogLine['level']): string {
  if (l === 'error') return '#f87171';
  if (l === 'warn')  return '#fbbf24';
  if (l === 'debug') return 'rgba(240,239,255,0.2)';
  return '#4ade80';
}

function levelBg(l: LogLine['level']): string {
  if (l === 'error') return 'rgba(248,113,113,0.08)';
  if (l === 'warn')  return 'rgba(251,191,36,0.06)';
  return 'transparent';
}

function streamColor(s: string): string {
  if (s === 'construx-api')  return 'rgba(249,115,22,0.65)';
  if (s === 'auth-service')  return '#a78bfa';
  if (s === 'stripe-worker') return '#fbbf24';
  if (s === 'resend-worker') return '#67e8f9';
  if (s === 'postgres')      return '#60a5fa';
  if (s === 'redis')         return '#f87171';
  return 'rgba(240,239,255,0.4)';
}

export default function LokiQueryPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [liveCount, setLiveCount] = useState(12);
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
    const id = setTimeout(() => setRevealed((r) => r + 1), 79);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => setLiveCount((c) => c + Math.floor(Math.random() * 4) + 1), 2400);
    return () => clearInterval(id);
  }, []);

  const allDone      = revealed > TOTAL;
  const shownLogs    = LOGS.slice(0, Math.max(0, Math.min(LOGS.length, revealed)));
  const shownStreams = STREAMS.slice(0, Math.max(0, Math.min(STREAMS.length, revealed - LOGS.length)));

  const errors = LOGS.filter((l) => l.level === 'error').length;
  const warns  = LOGS.filter((l) => l.level === 'warn').length;

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
          construx@sys — logcli query grafana loki
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveCount} lines` : 'querying…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          logcli query &#39;&#123;env=&quot;prod&quot;&#125; |= &quot;construx&quot;&#39; --since=5m --limit=200 --addr=https://loki.construxgroup.io
        </span>
      </div>

      {/* Column headers */}
      {shownLogs.length > 0 && (
        <div
          className="flex items-center px-4 py-0.5 text-[6.5px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ minWidth: '74px', flexShrink: 0 }}>Timestamp</span>
          <span style={{ minWidth: '42px', flexShrink: 0 }}>Level</span>
          <span style={{ minWidth: '84px', flexShrink: 0 }}>Stream</span>
          <span>Message</span>
        </div>
      )}

      {/* Log lines */}
      <div className="px-4 py-1.5 space-y-px">
        {shownLogs.map((l, i) => (
          <div
            key={i}
            className="flex items-start text-[7.5px] leading-[1.7] px-0.5"
            style={{
              background:  levelBg(l.level),
              borderLeft:  l.isLive ? '2px solid rgba(74,222,128,0.5)' : '2px solid transparent',
              paddingLeft: '4px',
            }}
          >
            <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '74px', flexShrink: 0 }}>{l.ts}</span>
            <span style={{ color: levelColor(l.level), minWidth: '42px', flexShrink: 0, fontWeight: 700, fontSize: '6.5px' }}>
              {l.level.toUpperCase()}
            </span>
            <span style={{ color: streamColor(l.stream), minWidth: '84px', flexShrink: 0 }}>{l.stream}</span>
            <span style={{ color: l.level === 'error' ? 'rgba(248,113,113,0.7)' : l.level === 'warn' ? 'rgba(251,191,36,0.65)' : 'rgba(240,239,255,0.3)' }}>
              {l.msg}
            </span>
          </div>
        ))}
      </div>

      {/* Stream summary */}
      {shownStreams.length > 0 && (
        <div className="px-4 py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — streams
          </div>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-0.5">
            {shownStreams.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[7.5px]">
                <span style={{ color: streamColor(s.name) }}>{s.name}</span>
                <span style={{ color: 'rgba(240,239,255,0.2)' }}>{s.count} lines</span>
                {s.errors > 0 && <span style={{ color: '#f87171' }}>{s.errors} err</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          {errors > 0 && <span style={{ color: '#f87171' }}>{errors} errors</span>}
          {warns  > 0 && <span style={{ color: '#fbbf24' }}>{warns} warnings</span>}
          <span>6 streams</span>
          <span className="ml-auto">query time: 28ms · bytes scanned: 4.2 MB</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          grafana loki 3.1.0 · env=prod · last 5m
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? (errors > 0 ? '#f87171' : '#4ade80') : 'rgba(240,239,255,0.15)' }}>
          {allDone ? (errors > 0 ? `● ${errors} errors` : '● clean') : 'loading'}
        </span>
      </div>
    </div>
  );
}
