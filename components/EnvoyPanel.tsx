'use client';

import { useEffect, useRef, useState } from 'react';

const CLUSTERS = [
  { name: 'construx-api-upstream', endpoints: 4, healthy: 4, cx_active: 284, rq_total: 284000, success_rate: 99.9 },
  { name: 'construx-search-upstream', endpoints: 2, healthy: 2, cx_active: 48, rq_total: 120000, success_rate: 99.7 },
  { name: 'construx-auth-upstream', endpoints: 3, healthy: 3, cx_active: 12, rq_total: 840000, success_rate: 100.0 },
  { name: 'construx-media-upstream', endpoints: 2, healthy: 1, cx_active: 4, rq_total: 48400, success_rate: 84.2 },
];

const LISTENERS = [
  { name: '0.0.0.0:8080', filter: 'http_connection_manager', routes: 8, rq_active: 284, direct_rsp: 0 },
  { name: '0.0.0.0:8443', filter: 'http_connection_manager', routes: 8, rq_active: 840, direct_rsp: 0 },
  { name: '0.0.0.0:15090', filter: 'prometheus_stats', routes: 1, rq_active: 4, direct_rsp: 284000 },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function EnvoyPanel() {
  const [visible, setVisible] = useState(false);
  const [clRows, setClRows] = useState(0);
  const [liRows, setLiRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const rqPerSec = useCounter(28400, 240, 400);
  const totalRq = useCounter(1292400, 2400, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const c = setInterval(() => setClRows((x) => Math.min(x + 1, CLUSTERS.length)), 160);
    const l = setInterval(() => setLiRows((x) => Math.min(x + 1, LISTENERS.length)), 140);
    return () => { clearInterval(c); clearInterval(l); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(103,232,249,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(103,232,249,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(103,232,249,0.08)', background: 'rgba(103,232,249,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(103,232,249,0.4)' }}>
          envoy -- service proxy -- clusters / listeners / admin api
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {rqPerSec.toLocaleString()} rq/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>envoy@sidecar</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>curl -s localhost:9901/clusters | grep -E "cx_active|rq_total|health_flags" | head -40</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'rq/s', value: rqPerSec.toLocaleString(), color: '#67e8f9' },
          { label: 'total rq', value: (totalRq / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'clusters', value: CLUSTERS.length.toString(), color: '#a78bfa' },
          { label: 'degraded', value: CLUSTERS.filter(c => c.healthy < c.endpoints).length.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Clusters */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // upstream clusters
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {CLUSTERS.slice(0, clRows).map((cl) => (
            <div key={cl.name} style={{ display: 'grid', gridTemplateColumns: '1fr 32px 28px 52px 40px', alignItems: 'center', gap: 8, padding: '5px 8px', background: cl.healthy < cl.endpoints ? 'rgba(248,113,113,0.04)' : 'rgba(103,232,249,0.04)', border: `1px solid ${cl.healthy < cl.endpoints ? 'rgba(248,113,113,0.1)' : 'rgba(103,232,249,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cl.name}</span>
              <span className="tabular-nums" style={{ color: cl.healthy < cl.endpoints ? '#f87171' : '#4ade80', fontSize: 7, textAlign: 'center' }}>{cl.healthy}/{cl.endpoints}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{cl.cx_active}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{(cl.rq_total / 1000).toFixed(0)}k</span>
              <span className="tabular-nums" style={{ color: cl.success_rate < 95 ? '#f87171' : cl.success_rate < 99 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{cl.success_rate}%</span>
            </div>
          ))}
        </div>

        {/* Listeners */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // listeners
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {LISTENERS.slice(0, liRows).map((li) => (
            <div key={li.name} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 24px 36px 52px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{li.name}</span>
              <span style={{ color: 'rgba(240,239,255,0.3)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{li.filter}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{li.routes}r</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{li.rq_active}</span>
              <span className="tabular-nums" style={{ color: li.direct_rsp > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'right' }}>{(li.direct_rsp / 1000).toFixed(0)}k</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          envoy v1.30 - apache-2.0 - cncf service proxy
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {rqPerSec.toLocaleString()} rq/s - {(totalRq / 1000).toFixed(0)}k total
        </span>
      </div>
    </div>
  );
}
