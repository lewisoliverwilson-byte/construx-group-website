'use client';

import { useEffect, useRef, useState } from 'react';

const VIRTUAL_SERVICES = [
  { name: 'construx-api-vs', namespace: 'prod', hosts: 'api.construxgroup.io', routes: 2, retries: 3, timeout: '30s', status: 'SYNCED' },
  { name: 'construx-web-vs', namespace: 'prod', hosts: 'construxgroup.io', routes: 1, retries: 3, timeout: '15s', status: 'SYNCED' },
  { name: 'construx-worker-vs', namespace: 'prod', hosts: 'worker.svc', routes: 2, retries: 5, timeout: '60s', status: 'SYNCED' },
  { name: 'construx-grpc-vs', namespace: 'prod', hosts: 'grpc.construxgroup.io', routes: 1, retries: 2, timeout: '10s', status: 'SYNCED' },
];

const DEST_RULES = [
  { name: 'construx-api-dr', namespace: 'prod', host: 'construx-api', trafficPolicy: 'ROUND_ROBIN', subsets: 2, mtls: true, status: 'SYNCED' },
  { name: 'construx-web-dr', namespace: 'prod', host: 'construx-web', trafficPolicy: 'LEAST_CONN', subsets: 1, mtls: true, status: 'SYNCED' },
  { name: 'construx-worker-dr', namespace: 'prod', host: 'construx-worker', trafficPolicy: 'ROUND_ROBIN', subsets: 2, mtls: true, status: 'SYNCED' },
  { name: 'pg-dr', namespace: 'data', host: 'postgres.data.svc', trafficPolicy: 'PASSTHROUGH', subsets: 1, mtls: false, status: 'SYNCED' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function IstioPanel() {
  const [visible, setVisible] = useState(false);
  const [vsRows, setVsRows] = useState(0);
  const [drRows, setDrRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const reqPerSec = useCounter(28400, 480, 400);
  const tlsHandshakes = useCounter(284000, 2400, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const v = setInterval(() => setVsRows((x) => Math.min(x + 1, VIRTUAL_SERVICES.length)), 160);
    const d = setInterval(() => setDrRows((x) => Math.min(x + 1, DEST_RULES.length)), 140);
    return () => { clearInterval(v); clearInterval(d); };
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
          istio -- service mesh -- virtual services / destination rules / mtls
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {reqPerSec.toLocaleString()} req/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>istio@mesh</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>istioctl proxy-status && istioctl analyze --all-namespaces && istioctl x describe svc construx-api</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'req / sec', value: reqPerSec.toLocaleString(), color: '#67e8f9' },
          { label: 'tls handshakes', value: (tlsHandshakes / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'virtual services', value: VIRTUAL_SERVICES.length.toString(), color: '#a78bfa' },
          { label: 'dest rules', value: DEST_RULES.length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Virtual Services */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // virtual services
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {VIRTUAL_SERVICES.slice(0, vsRows).map((vs) => (
            <div key={vs.name} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 20px 20px 28px 48px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vs.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{vs.namespace}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{vs.routes}r</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{vs.retries}rt</span>
              <span style={{ color: '#fbbf24', fontSize: 7, textAlign: 'center' }}>{vs.timeout}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{vs.status}</span>
            </div>
          ))}
        </div>

        {/* Destination Rules */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // destination rules
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {DEST_RULES.slice(0, drRows).map((dr, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 72px 80px 20px 32px 48px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dr.name}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dr.trafficPolicy}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dr.host}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{dr.subsets}s</span>
              <span style={{ color: dr.mtls ? '#4ade80' : '#fbbf24', fontSize: 7, textAlign: 'center' }}>{dr.mtls ? 'mtls' : 'plain'}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{dr.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          istio v1.23 - apache-2.0 - connect, secure, control, and observe services
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {reqPerSec.toLocaleString()} req/s - {(tlsHandshakes / 1000).toFixed(0)}k tls
        </span>
      </div>
    </div>
  );
}
