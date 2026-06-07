'use client';

import { useEffect, useRef, useState } from 'react';

const MEMBERS = [
  { name: 'etcd-0', endpoint: 'https://etcd-0:2380', id: 'a1b2c3d4', health: true, leader: true, dbSize: '48MB' },
  { name: 'etcd-1', endpoint: 'https://etcd-1:2380', id: 'e5f6a7b8', health: true, leader: false, dbSize: '48MB' },
  { name: 'etcd-2', endpoint: 'https://etcd-2:2380', id: 'c9d0e1f2', health: true, leader: false, dbSize: '48MB' },
];

const OPERATIONS = [
  { key: '/registry/pods/prod/construx-api-7d8f9', op: 'put', revision: 284001, lease: '0', latency: 2 },
  { key: '/registry/services/prod/construx-api', op: 'get', revision: 284000, lease: '0', latency: 1 },
  { key: '/registry/leases/kube-system/kube-scheduler', op: 'put', revision: 283999, lease: 'abc123', latency: 2 },
  { key: '/registry/configmaps/prod/construx-config', op: 'get', revision: 283998, lease: '0', latency: 1 },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function EtcdPanel() {
  const [visible, setVisible] = useState(false);
  const [memberRows, setMemberRows] = useState(0);
  const [opRows, setOpRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const opsPerSec = useCounter(2840, 24, 500);
  const revisionTotal = useCounter(284000, 48, 400);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const m = setInterval(() => setMemberRows((x) => Math.min(x + 1, MEMBERS.length)), 160);
    const o = setInterval(() => setOpRows((x) => Math.min(x + 1, OPERATIONS.length)), 140);
    return () => { clearInterval(m); clearInterval(o); };
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
          etcd -- distributed kv -- members / raft / operations
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {opsPerSec.toLocaleString()} ops/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#3b82f6', fontWeight: 600 }}>etcdctl@cluster</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>etcdctl --endpoints=https://etcd-0:2379 endpoint health && etcdctl member list --write-out=table</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'ops/s', value: opsPerSec.toLocaleString(), color: '#3b82f6' },
          { label: 'revision', value: revisionTotal.toLocaleString(), color: '#67e8f9' },
          { label: 'members', value: MEMBERS.length.toString(), color: '#a78bfa' },
          { label: 'db size', value: '48MB', color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Members */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // cluster members
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {MEMBERS.slice(0, memberRows).map((m) => (
            <div key={m.name} style={{ display: 'grid', gridTemplateColumns: '48px 1fr 60px 24px 36px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: m.leader ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)', border: `1px solid ${m.leader ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#3b82f6', fontSize: 8, fontWeight: 600 }}>{m.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.endpoint}</span>
              <span style={{ color: '#a78bfa', fontSize: 7 }}>{m.id}</span>
              <span style={{ color: m.health ? '#4ade80' : '#f87171', fontSize: 7, textAlign: 'center' }}>{m.health ? 'ok' : 'err'}</span>
              <span style={{ color: m.leader ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{m.leader ? 'ldr' : '-'}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{m.dbSize}</span>
            </div>
          ))}
        </div>

        {/* Operations */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent operations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {OPERATIONS.slice(0, opRows).map((op, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 24px 56px 52px 24px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{op.key}</span>
              <span style={{ color: op.op === 'put' ? '#fbbf24' : '#67e8f9', fontSize: 7, textAlign: 'center' }}>{op.op}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>r{op.revision}</span>
              <span style={{ color: op.lease !== '0' ? '#4ade80' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{op.lease !== '0' ? op.lease : 'no-lease'}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{op.latency}ms</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(59,130,246,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          etcd v3.5 - apache-2.0 - distributed reliable key-value store
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {opsPerSec.toLocaleString()} ops/s - r{revisionTotal.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
