'use client';

import { useEffect, useRef, useState } from 'react';

const CLAIMS = [
  { name: 'construx-prod-cluster', kind: 'EKSCluster', provider: 'aws', ready: true, synced: true, age: '42d' },
  { name: 'construx-rds-prod', kind: 'RDSInstance', provider: 'aws', ready: true, synced: true, age: '42d' },
  { name: 'construx-redis-prod', kind: 'ElastiCacheCluster', provider: 'aws', ready: true, synced: true, age: '42d' },
  { name: 'construx-s3-assets', kind: 'S3Bucket', provider: 'aws', ready: true, synced: false, age: '2m' },
];

const COMPOSITIONS = [
  { name: 'xeks.construxgroup.io', resources: 8, ready: 3, notReady: 0, claims: 1, revision: 'v4' },
  { name: 'xrds.construxgroup.io', resources: 4, ready: 4, notReady: 0, claims: 1, revision: 'v2' },
  { name: 'xredis.construxgroup.io', resources: 3, ready: 3, notReady: 0, claims: 1, revision: 'v1' },
  { name: 'xs3.construxgroup.io', resources: 2, ready: 1, notReady: 1, claims: 1, revision: 'v3' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function CrossplanePanel() {
  const [visible, setVisible] = useState(false);
  const [clRows, setClRows] = useState(0);
  const [compRows, setCompRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const reconciledTotal = useCounter(284000, 480, 600);
  const managedResources = useCounter(17, 1, 14400);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const c = setInterval(() => setClRows((x) => Math.min(x + 1, CLAIMS.length)), 160);
    const co = setInterval(() => setCompRows((x) => Math.min(x + 1, COMPOSITIONS.length)), 140);
    return () => { clearInterval(c); clearInterval(co); };
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
          crossplane -- infrastructure -- claims / compositions / providers
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {managedResources.toLocaleString()} resources
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>kubectl@crossplane</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>kubectl get managed --all-namespaces && crossplane beta trace eksclusters.construxgroup.io/construx-prod-cluster</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'managed', value: managedResources.toLocaleString(), color: '#f97316' },
          { label: 'reconciled', value: (reconciledTotal / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'claims', value: CLAIMS.length.toString(), color: '#a78bfa' },
          { label: 'not synced', value: CLAIMS.filter(c => !c.synced).length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Claims */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // composite resource claims
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {CLAIMS.slice(0, clRows).map((claim) => (
            <div key={claim.name} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 40px 40px 40px 32px', alignItems: 'center', gap: 8, padding: '5px 8px', background: !claim.synced ? 'rgba(251,191,36,0.04)' : 'rgba(249,115,22,0.04)', border: `1px solid ${!claim.synced ? 'rgba(251,191,36,0.1)' : 'rgba(249,115,22,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{claim.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{claim.kind}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{claim.provider}</span>
              <span style={{ color: claim.ready ? '#4ade80' : '#f87171', fontSize: 7, textAlign: 'center' }}>{claim.ready ? 'ready' : 'wait'}</span>
              <span style={{ color: claim.synced ? '#4ade80' : '#fbbf24', fontSize: 7, textAlign: 'center' }}>{claim.synced ? 'sync' : 'sync!'}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{claim.age}</span>
            </div>
          ))}
        </div>

        {/* Compositions */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // compositions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {COMPOSITIONS.slice(0, compRows).map((comp) => (
            <div key={comp.name} style={{ display: 'grid', gridTemplateColumns: '1fr 24px 24px 24px 24px 32px', alignItems: 'center', gap: 8, padding: '4px 8px', background: comp.notReady > 0 ? 'rgba(251,191,36,0.04)' : 'rgba(249,115,22,0.04)', border: `1px solid ${comp.notReady > 0 ? 'rgba(251,191,36,0.1)' : 'rgba(249,115,22,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comp.name}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{comp.resources}r</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{comp.ready}</span>
              <span className="tabular-nums" style={{ color: comp.notReady > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{comp.notReady}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{comp.claims}c</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 7, textAlign: 'right' }}>{comp.revision}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          crossplane v1.16 - apache-2.0 - cncf infrastructure-as-code
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {managedResources.toLocaleString()} managed - {(reconciledTotal / 1000).toFixed(0)}k reconciled
        </span>
      </div>
    </div>
  );
}
