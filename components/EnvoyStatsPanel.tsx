'use client';

import { useState, useEffect, useRef } from 'react';

interface ClusterStat {
  name:         string;
  totalRq:      number;
  rq2xx:        number;
  rq5xx:        number;
  pending:      number;
  ejected:      number;
  circuitOpen:  boolean;
  p50Ms:        number;
  p99Ms:        number;
}

interface EnvoyLine {
  label: string;
  value: string;
  color?: string;
}

const CLUSTERS: ClusterStat[] = [
  { name: 'orders_service',  totalRq: 18241, rq2xx: 18103, rq5xx: 138, pending: 0, ejected: 0, circuitOpen: false, p50Ms: 42,  p99Ms: 180 },
  { name: 'payments_service',totalRq: 4401,  rq2xx: 4389,  rq5xx: 12,  pending: 0, ejected: 0, circuitOpen: false, p50Ms: 88,  p99Ms: 340 },
  { name: 'inventory_svc',   totalRq: 14203, rq2xx: 14196, rq5xx: 7,   pending: 0, ejected: 0, circuitOpen: false, p50Ms: 19,  p99Ms: 72  },
  { name: 'email_service',   totalRq: 441,   rq2xx: 439,   rq5xx: 2,   pending: 0, ejected: 1, circuitOpen: false, p50Ms: 220, p99Ms: 880 },
];

const LISTENER_LINES: EnvoyLine[] = [
  { label: 'listener.downstream_cx_total',    value: '42,891',  color: 'rgba(240,239,255,0.5)' },
  { label: 'listener.downstream_cx_active',   value: '341',     color: '#4ade80' },
  { label: 'http.ingress.downstream_rq_2xx',  value: '37,132',  color: '#4ade80' },
  { label: 'http.ingress.downstream_rq_5xx',  value: '159',     color: '#f87171' },
  { label: 'http.ingress.downstream_rq_total', value: '37,291', color: 'rgba(240,239,255,0.4)' },
  { label: 'runtime.load_success',             value: 'true',   color: '#4ade80' },
];

const TOTAL = CLUSTERS.length + LISTENER_LINES.length + 5;

function successPct(c: ClusterStat): number {
  if (c.totalRq === 0) return 100;
  return Math.round((c.rq2xx / c.totalRq) * 1000) / 10;
}

function pctColor(pct: number): string {
  if (pct >= 99.5) return '#4ade80';
  if (pct >= 98)   return '#fbbf24';
  return '#f87171';
}

function p99Color(ms: number): string {
  if (ms < 200) return '#4ade80';
  if (ms < 500) return '#fbbf24';
  return '#f87171';
}

export default function EnvoyStatsPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [totalRq,   setTotalRq]   = useState(18241);
  const [activeConn, setActiveConn] = useState(341);
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
            setTotalRq((t) => t + Math.floor(20 + Math.random() * 30));
            setActiveConn(Math.floor(300 + Math.random() * 80));
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

  const allDone        = revealed > TOTAL;
  const clusterStart   = 2;
  const listenerStart  = CLUSTERS.length + 3;
  const shownClusters  = CLUSTERS.slice(0, Math.max(0, revealed - clusterStart));
  const shownListeners = LISTENER_LINES.slice(0, Math.max(0, revealed - listenerStart));

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
          construx@edge-proxy — envoy admin stats
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: '#4ade80' }}>
          {allDone ? `LIVE ${totalRq.toLocaleString()} rq · ${activeConn} cx` : 'sampling…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@proxy$ </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          curl -s http://localhost:9901/stats | grep cluster
        </span>
      </div>

      {/* Cluster stats */}
      {shownClusters.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.18)' }}>
            Upstream clusters — circuit breakers · outlier detection
          </div>
          <div
            className="flex items-center text-[6.5px] uppercase tracking-widest mb-0.5"
            style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '2px' }}
          >
            <span style={{ minWidth: '156px', flexShrink: 0 }}>Cluster</span>
            <span style={{ minWidth: '72px',  flexShrink: 0 }}>Total rq</span>
            <span style={{ minWidth: '56px',  flexShrink: 0 }}>5xx</span>
            <span style={{ minWidth: '64px',  flexShrink: 0 }}>Success%</span>
            <span style={{ minWidth: '52px',  flexShrink: 0 }}>p50</span>
            <span style={{ minWidth: '52px',  flexShrink: 0 }}>p99</span>
            <span>Ejected</span>
          </div>
          {shownClusters.map((c) => {
            const pct = successPct(c);
            return (
              <div key={c.name} className="flex items-center text-[7.5px] leading-[1.9]">
                <span style={{ color: 'rgba(240,239,255,0.5)', minWidth: '156px', flexShrink: 0 }}>{c.name}</span>
                <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '72px', flexShrink: 0 }}>{c.totalRq.toLocaleString()}</span>
                <span style={{ color: c.rq5xx > 0 ? '#f87171' : 'rgba(240,239,255,0.2)', minWidth: '56px', flexShrink: 0 }}>{c.rq5xx}</span>
                <span style={{ color: pctColor(pct), minWidth: '64px', flexShrink: 0 }}>{pct}%</span>
                <span style={{ color: '#4ade80', minWidth: '52px', flexShrink: 0 }}>{c.p50Ms}ms</span>
                <span style={{ color: p99Color(c.p99Ms), minWidth: '52px', flexShrink: 0 }}>{c.p99Ms}ms</span>
                <span style={{ color: c.ejected > 0 ? '#fbbf24' : 'rgba(240,239,255,0.2)' }}>{c.ejected}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Listener stats */}
      {shownListeners.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.18)' }}>
            Listener stats — port 10000
          </div>
          {shownListeners.map((l, i) => (
            <div key={i} className="flex items-center text-[7.5px] leading-[1.85] gap-4">
              <span style={{ color: 'rgba(240,239,255,0.28)', minWidth: '260px', flexShrink: 0 }}>{l.label}</span>
              <span style={{ color: l.color ?? 'rgba(240,239,255,0.45)' }}>{l.value}</span>
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
          <span style={{ color: '#4ade80' }}>4 clusters healthy</span>
          <span style={{ color: '#fbbf24' }}>email_service: 1 endpoint ejected</span>
          <span style={{ color: '#4ade80' }}>0 circuits open</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          envoy 1.32.2 · xds v3 · outlier detection enabled
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● proxy healthy' : 'loading'}
        </span>
      </div>
    </div>
  );
}
