'use client';

import { useEffect, useRef, useState } from 'react';

const SERVICES = [
  { name: 'construx-api', instances: 4, passing: 4, warnings: 0, failing: 0, datacenter: 'dc1' },
  { name: 'construx-db', instances: 2, passing: 2, warnings: 0, failing: 0, datacenter: 'dc1' },
  { name: 'construx-worker', instances: 8, passing: 7, warnings: 1, failing: 0, datacenter: 'dc1' },
  { name: 'construx-cache', instances: 3, passing: 3, warnings: 0, failing: 0, datacenter: 'dc2' },
];

const INTENTIONS = [
  { source: 'construx-api', destination: 'construx-db', action: 'allow', precedence: 9, created: '2d ago' },
  { source: 'construx-worker', destination: 'construx-cache', action: 'allow', precedence: 9, created: '2d ago' },
  { source: 'construx-api', destination: 'construx-cache', action: 'allow', precedence: 9, created: '5d ago' },
  { source: '*', destination: 'construx-db', action: 'deny', precedence: 8, created: '7d ago' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function ConsulPanel() {
  const [visible, setVisible] = useState(false);
  const [svcRows, setSvcRows] = useState(0);
  const [intRows, setIntRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const healthChecks = useCounter(28400, 48, 600);
  const kvOps = useCounter(48400, 120, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setSvcRows((x) => Math.min(x + 1, SERVICES.length)), 160);
    const i = setInterval(() => setIntRows((x) => Math.min(x + 1, INTENTIONS.length)), 140);
    return () => { clearInterval(s); clearInterval(i); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(249,115,22,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(249,115,22,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(249,115,22,0.08)', background: 'rgba(249,115,22,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(249,115,22,0.4)' }}>
          consul -- service mesh -- discovery / intentions / health
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {healthChecks.toLocaleString()} checks
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>consul@agent</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>consul catalog services -datacenter dc1 && consul intention list --all-namespaces</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'health checks', value: healthChecks.toLocaleString(), color: '#f97316' },
          { label: 'kv ops', value: (kvOps / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'services', value: SERVICES.length.toString(), color: '#a78bfa' },
          { label: 'passing', value: SERVICES.reduce((a, s) => a + s.passing, 0).toString(), color: '#67e8f9' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Services */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // registered services
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {SERVICES.slice(0, svcRows).map((svc) => (
            <div key={svc.name} style={{ display: 'grid', gridTemplateColumns: '1fr 28px 28px 28px 28px 36px', alignItems: 'center', gap: 8, padding: '5px 8px', background: svc.failing > 0 ? 'rgba(248,113,113,0.04)' : svc.warnings > 0 ? 'rgba(251,191,36,0.04)' : 'rgba(249,115,22,0.04)', border: `1px solid ${svc.failing > 0 ? 'rgba(248,113,113,0.1)' : svc.warnings > 0 ? 'rgba(251,191,36,0.1)' : 'rgba(249,115,22,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{svc.name}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{svc.instances}i</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{svc.passing}p</span>
              <span className="tabular-nums" style={{ color: svc.warnings > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{svc.warnings}w</span>
              <span className="tabular-nums" style={{ color: svc.failing > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{svc.failing}f</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{svc.datacenter}</span>
            </div>
          ))}
        </div>

        {/* Intentions */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // service intentions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {INTENTIONS.slice(0, intRows).map((int, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 32px 1fr 28px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: int.action === 'deny' ? 'rgba(248,113,113,0.04)' : 'rgba(249,115,22,0.04)', border: `1px solid ${int.action === 'deny' ? 'rgba(248,113,113,0.1)' : 'rgba(249,115,22,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{int.source}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>→</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{int.destination}</span>
              <span style={{ color: int.action === 'allow' ? '#4ade80' : '#f87171', fontSize: 7, fontWeight: 700 }}>{int.action}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{int.created}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          consul v1.19 - bsl-1.1 - service discovery and mesh
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {healthChecks.toLocaleString()} checks - {(kvOps / 1000).toFixed(0)}k kv ops
        </span>
      </div>
    </div>
  );
}
