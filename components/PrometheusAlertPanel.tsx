'use client';

import { useState, useEffect, useRef } from 'react';

interface FiringAlert {
  name:       string;
  severity:   'critical' | 'warning' | 'info';
  service:    string;
  value:      string;
  duration:   string;
  labels:     Record<string, string>;
}

interface RouteRule {
  match:    string;
  receiver: string;
  repeat:   string;
}

const ALERTS: FiringAlert[] = [
  {
    name:     'HighErrorRate',
    severity: 'critical',
    service:  'construx-api',
    value:    '6.8%',
    duration: '4m12s',
    labels:   { env: 'production', job: 'construx-api', dc: 'lon-01' },
  },
  {
    name:     'PostgresConnectionsHigh',
    severity: 'warning',
    service:  'postgresql',
    value:    '87/100',
    duration: '11m44s',
    labels:   { env: 'production', job: 'postgres-exporter', instance: 'db-01:9187' },
  },
  {
    name:     'DiskSpaceLow',
    severity: 'warning',
    service:  'node',
    value:    '12.4% free',
    duration: '2h18m',
    labels:   { env: 'production', device: '/dev/sda1', mountpoint: '/' },
  },
  {
    name:     'RedisMemoryHigh',
    severity: 'info',
    service:  'redis',
    value:    '78% of maxmemory',
    duration: '6m05s',
    labels:   { env: 'production', job: 'redis-exporter', instance: 'cache-01:9121' },
  },
];

const ROUTES: RouteRule[] = [
  { match: 'severity=critical',  receiver: 'pagerduty-on-call', repeat: '5m'  },
  { match: 'severity=warning',   receiver: 'slack-#alerts',     repeat: '1h'  },
  { match: 'severity=info',      receiver: 'slack-#monitoring',  repeat: '4h'  },
];

const TOTAL = 2 + ALERTS.length + 2 + ROUTES.length + 3;

function sevColor(s: FiringAlert['severity']): string {
  if (s === 'critical') return '#f87171';
  if (s === 'warning')  return '#fbbf24';
  return '#67e8f9';
}

function sevBg(s: FiringAlert['severity']): string {
  if (s === 'critical') return 'rgba(248,113,113,0.1)';
  if (s === 'warning')  return 'rgba(251,191,36,0.08)';
  return 'rgba(103,232,249,0.07)';
}

export default function PrometheusAlertPanel() {
  const [revealed,     setRevealed]     = useState(0);
  const [liveErrRate,  setLiveErrRate]  = useState(6.8);
  const [liveConns,    setLiveConns]    = useState(87);
  const ref      = useRef<HTMLDivElement>(null);
  const started  = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
          timerRef.current = setInterval(() => {
            setLiveErrRate(Math.round((5.5 + Math.random() * 3) * 10) / 10);
            setLiveConns(Math.round(80 + Math.random() * 15));
          }, 2000);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 83);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const allDone    = revealed > TOTAL;
  const alertStart = 2;
  const routeStart = alertStart + ALERTS.length + 2;

  const shownAlerts = ALERTS.slice(0, Math.max(0, revealed - alertStart));
  const shownRoutes = ROUTES.slice(0, Math.max(0, revealed - routeStart));

  const critCount = ALERTS.filter((a) => a.severity === 'critical').length;
  const warnCount = ALERTS.filter((a) => a.severity === 'warning').length;

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
          construx@prod-01 — alertmanager · firing alerts
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? (critCount > 0 ? '#f87171' : '#fbbf24') : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${critCount} critical · ${warnCount} warning` : 'querying…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>root@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          amtool alert query --alertmanager.url http://localhost:9093
        </span>
      </div>

      {/* Firing alerts */}
      {shownAlerts.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1.5" style={{ color: 'rgba(240,239,255,0.18)' }}>
            Firing alerts — {ALERTS.length} active
          </div>
          {shownAlerts.map((a) => {
            const liveVal = a.name === 'HighErrorRate'
              ? `${liveErrRate}%`
              : a.name === 'PostgresConnectionsHigh'
                ? `${liveConns}/100`
                : a.value;
            return (
              <div
                key={a.name}
                className="mb-1.5 px-2 py-1"
                style={{ background: sevBg(a.severity), borderLeft: `2px solid ${sevColor(a.severity)}40`, borderRadius: '2px' }}
              >
                <div className="flex items-center gap-2 text-[7.5px]">
                  <span style={{ color: sevColor(a.severity), fontWeight: 700, minWidth: '52px', flexShrink: 0 }}>
                    [{a.severity.toUpperCase()}]
                  </span>
                  <span style={{ color: 'rgba(240,239,255,0.75)', fontWeight: 600, minWidth: '200px', flexShrink: 0 }}>{a.name}</span>
                  <span style={{ color: sevColor(a.severity), minWidth: '80px', flexShrink: 0 }}>{liveVal}</span>
                  <span style={{ color: 'rgba(240,239,255,0.25)' }}>for {a.duration}</span>
                </div>
                <div className="text-[7px] mt-0.5 pl-0" style={{ color: 'rgba(240,239,255,0.25)' }}>
                  {Object.entries(a.labels).map(([k, v]) => `${k}="${v}"`).join(' · ')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Routing rules */}
      {shownRoutes.length > 0 && (
        <div className="px-4 pt-2 pb-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.18)' }}>
            AlertManager routing — alertmanager.yaml
          </div>
          <div
            className="flex items-center text-[6.5px] uppercase tracking-widest mb-0.5"
            style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '2px' }}
          >
            <span style={{ minWidth: '180px', flexShrink: 0 }}>Match</span>
            <span style={{ minWidth: '160px', flexShrink: 0 }}>Receiver</span>
            <span>Repeat</span>
          </div>
          {shownRoutes.map((r) => (
            <div key={r.match} className="flex items-center text-[7.5px] leading-[1.85]">
              <span style={{ color: 'rgba(240,239,255,0.4)', minWidth: '180px', flexShrink: 0 }}>{r.match}</span>
              <span style={{ color: '#a78bfa', minWidth: '160px', flexShrink: 0 }}>{r.receiver}</span>
              <span style={{ color: 'rgba(240,239,255,0.25)' }}>{r.repeat}</span>
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
          <span style={{ color: '#f87171' }}>{critCount} critical</span>
          <span style={{ color: '#fbbf24' }}>{warnCount} warning</span>
          <span style={{ color: '#67e8f9' }}>1 info</span>
          <span style={{ color: '#4ade80' }}>3 routes configured</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          prometheus 2.55.0 · alertmanager 0.27.0 · amtool
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#f87171' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● 4 firing' : 'loading'}
        </span>
      </div>
    </div>
  );
}
