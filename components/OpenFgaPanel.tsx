'use client';

import { useEffect, useRef, useState } from 'react';

const STORES = [
  { name: 'construx-prod', tuples: 28400, models: 3, checks: 2840000, latency: 2, status: 'active' },
  { name: 'construx-staging', tuples: 8400, models: 2, checks: 284000, latency: 3, status: 'active' },
  { name: 'construx-dev', tuples: 2840, models: 1, checks: 28400, latency: 4, status: 'active' },
];

const CHECKS = [
  { user: 'user:lewis', relation: 'editor', object: 'document:api-spec', store: 'construx-prod', latency: '1ms', result: 'allowed' },
  { user: 'user:ci-bot', relation: 'viewer', object: 'document:infra-design', store: 'construx-prod', latency: '2ms', result: 'allowed' },
  { user: 'serviceaccount:worker', relation: 'writer', object: 'bucket:construx-builds', store: 'construx-prod', latency: '1ms', result: 'allowed' },
  { user: 'user:guest', relation: 'admin', object: 'organization:construxgroup', store: 'construx-prod', latency: '2ms', result: 'denied' },
];

const CHECK_COLOR: Record<string, string> = {
  allowed: '#4ade80',
  denied: '#f87171',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function OpenFGAPanel() {
  const [visible, setVisible] = useState(false);
  const [storeRows, setStoreRows] = useState(0);
  const [checkRows, setCheckRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const checksPerSec = useCounter(28400, 480, 400);
  const tuplesTotal = useCounter(39640, 48, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setStoreRows((x) => Math.min(x + 1, STORES.length)), 160);
    const c = setInterval(() => setCheckRows((x) => Math.min(x + 1, CHECKS.length)), 140);
    return () => { clearInterval(s); clearInterval(c); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(59,130,246,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(59,130,246,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(59,130,246,0.08)', background: 'rgba(59,130,246,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(59,130,246,0.4)' }}>
          openfga -- fine-grained authorization -- stores / tuples / checks
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {checksPerSec.toLocaleString()} checks/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#3b82f6', fontWeight: 600 }}>fga@server</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>fga store list && fga query check --store-id construx-prod user:lewis editor document:api-spec</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'checks / sec', value: checksPerSec.toLocaleString(), color: '#3b82f6' },
          { label: 'tuples', value: tuplesTotal.toLocaleString(), color: '#4ade80' },
          { label: 'stores', value: STORES.length.toString(), color: '#a78bfa' },
          { label: 'avg latency', value: '2ms', color: '#67e8f9' },
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
          // authorization stores
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {STORES.slice(0, storeRows).map((store) => (
            <div key={store.name} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 20px 1fr 28px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#3b82f6', fontSize: 8, fontWeight: 600 }}>{store.name}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{store.tuples.toLocaleString()}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{store.models}m</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7 }}>{(store.checks / 1000).toFixed(0)}k checks</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{store.latency}ms</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{store.status}</span>
            </div>
          ))}
        </div>

        {/* Recent Checks */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent authorization checks
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {CHECKS.slice(0, checkRows).map((chk, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 48px 1fr 28px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: chk.result === 'allowed' ? 'rgba(74,222,128,0.03)' : 'rgba(248,113,113,0.04)', border: `1px solid ${chk.result === 'allowed' ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chk.user}</span>
              <span style={{ color: '#3b82f6', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chk.relation}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chk.object}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{chk.latency}</span>
              <span style={{ color: CHECK_COLOR[chk.result] ?? 'rgba(255,255,255,0.3)', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{chk.result}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(59,130,246,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          openfga v1.5 - apache-2.0 - fine-grained authorization
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {checksPerSec.toLocaleString()} checks/s - {tuplesTotal.toLocaleString()} tuples
        </span>
      </div>
    </div>
  );
}
