'use client';

import { useState, useEffect, useRef } from 'react';

interface LogLine {
  ts:      string;
  level:   'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  svc:     string;
  msg:     string;
  meta?:   string;
}

const BASE: LogLine[] = [
  { ts: '2030-06-21T08:14:02.441Z', level: 'INFO',  svc: 'server',      msg: 'Listening on :3000', meta: 'pid=14832' },
  { ts: '2030-06-21T08:14:02.619Z', level: 'INFO',  svc: 'db',          msg: 'Connected to Postgres', meta: 'pool=10 lag=2ms' },
  { ts: '2030-06-21T08:14:02.741Z', level: 'INFO',  svc: 'cache',       msg: 'Redis connected', meta: 'host=redis.construx.svc:6379' },
  { ts: '2030-06-21T08:14:03.082Z', level: 'INFO',  svc: 'auth',        msg: 'Session middleware ready', meta: 'ttl=7d' },
  { ts: '2030-06-21T08:14:03.991Z', level: 'INFO',  svc: 'router',      msg: 'GET /api/health 200', meta: 'dur=2ms ua=kube-probe' },
  { ts: '2030-06-21T08:14:04.114Z', level: 'DEBUG', svc: 'metrics',     msg: 'Scrape completed', meta: 'series=842' },
  { ts: '2030-06-21T08:14:07.221Z', level: 'INFO',  svc: 'router',      msg: 'POST /api/auth/session 200', meta: 'dur=14ms ip=10.0.1.42' },
  { ts: '2030-06-21T08:14:07.444Z', level: 'INFO',  svc: 'auth',        msg: 'Session created', meta: 'userId=u_01J9KM uid=sess_abc123' },
  { ts: '2030-06-21T08:14:08.831Z', level: 'INFO',  svc: 'router',      msg: 'GET /api/users/me 200', meta: 'dur=8ms' },
  { ts: '2030-06-21T08:14:09.012Z', level: 'WARN',  svc: 'ratelimit',   msg: 'Approaching limit', meta: 'key=ip:82.44.12.91 remaining=2' },
  { ts: '2030-06-21T08:14:09.314Z', level: 'INFO',  svc: 'queue',       msg: 'Job dequeued', meta: 'job=send-welcome-email id=job_0xA3F' },
  { ts: '2030-06-21T08:14:09.881Z', level: 'INFO',  svc: 'email',       msg: 'Email delivered', meta: 'to=*** provider=resend latency=440ms' },
  { ts: '2030-06-21T08:14:12.001Z', level: 'ERROR', svc: 'webhook',     msg: 'Stripe signature verification failed', meta: 'status=400' },
  { ts: '2030-06-21T08:14:12.003Z', level: 'INFO',  svc: 'webhook',     msg: 'Returned 400 to caller' },
  { ts: '2030-06-21T08:14:14.772Z', level: 'INFO',  svc: 'router',      msg: 'GET /api/health 200', meta: 'dur=1ms ua=kube-probe' },
  { ts: '2030-06-21T08:14:15.441Z', level: 'INFO',  svc: 'db',          msg: 'Slow query detected', meta: 'dur=210ms table=documents' },
  { ts: '2030-06-21T08:14:18.009Z', level: 'INFO',  svc: 'router',      msg: 'GET /api/posts 200', meta: 'dur=18ms count=20' },
  { ts: '2030-06-21T08:14:22.114Z', level: 'DEBUG', svc: 'gc',          msg: 'GC pause', meta: 'dur=8ms type=minor' },
];

const LIVE: LogLine[] = [
  { ts: '',  level: 'INFO',  svc: 'router',  msg: 'POST /api/checkout 200', meta: 'dur=220ms' },
  { ts: '',  level: 'INFO',  svc: 'stripe',  msg: 'Payment intent created', meta: 'amount=4900 currency=gbp' },
  { ts: '',  level: 'INFO',  svc: 'router',  msg: 'GET /api/health 200', meta: 'dur=1ms ua=kube-probe' },
  { ts: '',  level: 'WARN',  svc: 'cache',   msg: 'Cache miss', meta: 'key=user:u_01J9KM:profile' },
  { ts: '',  level: 'INFO',  svc: 'db',      msg: 'Query OK', meta: 'dur=4ms rows=1' },
];

function levelColor(level: LogLine['level']): string {
  if (level === 'ERROR') return '#f87171';
  if (level === 'WARN')  return '#fbbf24';
  if (level === 'DEBUG') return 'rgba(240,239,255,0.2)';
  return '#4ade80';
}

function svcColor(svc: string): string {
  if (svc === 'router')   return '#60a5fa';
  if (svc === 'db')       return '#a78bfa';
  if (svc === 'auth')     return '#67e8f9';
  if (svc === 'error')    return '#f87171';
  if (svc === 'stripe')   return '#fbbf24';
  return 'rgba(240,239,255,0.35)';
}

function fmtTs(iso: string): string {
  if (!iso) return new Date().toISOString().slice(11, 23);
  return iso.slice(11, 23);
}

export default function KubectlLogsPanel() {
  const [revealed, setRevealed]   = useState(0);
  const [live, setLive]           = useState<LogLine[]>([]);
  const [liveIdx, setLiveIdx]     = useState(0);
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
    if (revealed === 0 || revealed > BASE.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 75);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= BASE.length) return;
    const id = setInterval(() => {
      const entry = { ...LIVE[liveIdx % LIVE.length], ts: new Date().toISOString() };
      setLive((prev) => [...prev.slice(-5), entry]);
      setLiveIdx((i) => i + 1);
    }, 2800);
    return () => clearInterval(id);
  }, [revealed, liveIdx]);

  const allDone  = revealed > BASE.length;
  const displayed = BASE.slice(0, allDone ? BASE.length : revealed);
  const rows      = [...displayed, ...live];
  const errCount  = rows.filter((r) => r.level === 'ERROR').length;
  const warnCount = rows.filter((r) => r.level === 'WARN').length;

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
          construx@sys — kubectl logs -f deploy/construx-api
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{
          color: errCount > 0 ? '#f87171' : allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)',
        }}>
          {allDone ? (errCount > 0 ? `${errCount} err` : `${warnCount} warn`) : 'streaming…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          kubectl logs -f deploy/construx-api -n prod --tail=20 --timestamps
        </span>
      </div>

      {/* Log lines */}
      <div className="px-4 py-2 space-y-0.5">
        {rows.map((line, i) => (
          <div key={i} className="flex items-start text-[8px] leading-[1.6]">
            <span style={{ color: 'rgba(240,239,255,0.18)', minWidth: '88px', flexShrink: 0 }}>
              {fmtTs(line.ts)}
            </span>
            <span style={{ color: levelColor(line.level), minWidth: '44px', flexShrink: 0, fontWeight: 700 }}>
              {line.level}
            </span>
            <span style={{ color: svcColor(line.svc), minWidth: '64px', flexShrink: 0 }}>
              [{line.svc}]
            </span>
            <span style={{ color: line.level === 'ERROR' ? '#fca5a5' : 'rgba(240,239,255,0.6)', flexShrink: 0 }}>
              {line.msg}
            </span>
            {line.meta && (
              <span style={{ color: 'rgba(240,239,255,0.18)', marginLeft: '8px', flexShrink: 0 }}>
                {line.meta}
              </span>
            )}
          </div>
        ))}
        {allDone && (
          <div className="text-[8px] mt-0.5" style={{ color: 'rgba(74,222,128,0.3)' }}>
            ▌
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          namespace: prod · deployment: construx-api · replicas: 3
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● streaming' : 'loading'}
        </span>
      </div>
    </div>
  );
}
