'use client';

import { useEffect, useRef, useState } from 'react';

const STORES = [
  { name: 'construx-prod', model: 'rebac', tuples: 48200, checks: 284200, latency: '0.8ms' },
  { name: 'construx-staging', model: 'rebac', tuples: 8400, checks: 28400, latency: '0.4ms' },
  { name: 'construx-test', model: 'rebac', tuples: 840, checks: 2840, latency: '0.2ms' },
];

const TUPLES = [
  { user: 'user:alice', relation: 'owner', object: 'document:annual_report', store: 'construx-prod' },
  { user: 'team:engineering#member', relation: 'viewer', object: 'document:tech_spec', store: 'construx-prod' },
  { user: 'user:bob', relation: 'editor', object: 'project:construx_v2', store: 'construx-prod' },
  { user: 'org:construx#member', relation: 'viewer', object: 'folder:public_docs', store: 'construx-prod' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function OpenFgaPanel() {
  const [visible, setVisible] = useState(false);
  const [sRows, setSRows] = useState(0);
  const [tRows, setTRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const checksPerSec = useCounter(2840, 24, 600);
  const totalTuples = useCounter(57440, 48, 1100);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setSRows((x) => Math.min(x + 1, STORES.length)), 160);
    const t = setInterval(() => setTRows((x) => Math.min(x + 1, TUPLES.length)), 140);
    return () => { clearInterval(s); clearInterval(t); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(74,222,128,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(74,222,128,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(74,222,128,0.08)', background: 'rgba(74,222,128,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(74,222,128,0.4)' }}>
          openfga -- fine-grained authorization -- rebac / stores / tuples
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {checksPerSec.toLocaleString()} checks/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>fga@authz</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>fga store list && fga tuple check --store construx-prod user:alice owner document:annual_report</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'checks/s', value: checksPerSec.toLocaleString(), color: '#4ade80' },
          { label: 'total tuples', value: (totalTuples / 1000).toFixed(1) + 'k', color: '#67e8f9' },
          { label: 'stores', value: STORES.length.toString(), color: '#a78bfa' },
          { label: 'avg latency', value: '0.8ms', color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Stores */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // stores
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {STORES.slice(0, sRows).map((s) => (
            <div key={s.name} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 48px 56px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600 }}>{s.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{s.model}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{s.tuples.toLocaleString()}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{s.checks.toLocaleString()}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{s.latency}</span>
            </div>
          ))}
        </div>

        {/* Tuples */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // relationship tuples
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TUPLES.slice(0, tRows).map((tp) => (
            <div key={tp.user + tp.object} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 1fr', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.3)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tp.user}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'center', fontWeight: 700 }}>{tp.relation}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{tp.object}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          openfga v1.5 - apache-2.0 - fine-grained authz engine
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {checksPerSec.toLocaleString()} checks/s - {(totalTuples / 1000).toFixed(1)}k tuples
        </span>
      </div>
    </div>
  );
}
