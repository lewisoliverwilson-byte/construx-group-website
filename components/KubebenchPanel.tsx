'use client';

import { useEffect, useRef, useState } from 'react';

const CHECKS = [
  { id: '1.1.1', section: 'Control Plane', desc: 'API server config file permissions', status: 'PASS', severity: 'warn' },
  { id: '1.1.12', section: 'Control Plane', desc: 'etcd data directory ownership', status: 'PASS', severity: 'warn' },
  { id: '1.2.6', section: 'Control Plane', desc: 'NodeRestriction admission plugin', status: 'PASS', severity: 'warn' },
  { id: '2.1', section: 'etcd', desc: 'TLS encryption for etcd peer comms', status: 'PASS', severity: 'warn' },
  { id: '3.2.1', section: 'Control Plane Config', desc: 'Audit log enabled', status: 'WARN', severity: 'warn' },
  { id: '4.1.1', section: 'Worker Nodes', desc: 'kubelet.conf file permissions', status: 'PASS', severity: 'warn' },
  { id: '4.2.2', section: 'Worker Nodes', desc: 'Anonymous auth disabled', status: 'PASS', severity: 'warn' },
  { id: '5.1.1', section: 'Policies', desc: 'RBAC default service account', status: 'FAIL', severity: 'info' },
];

const SUMMARY = [
  { label: 'pass', count: 6, color: '#4ade80' },
  { label: 'warn', count: 1, color: '#fbbf24' },
  { label: 'fail', count: 1, color: '#f87171' },
  { label: 'info', count: 0, color: '#67e8f9' },
];

const STATUS_COLOR: Record<string, string> = { PASS: '#4ade80', WARN: '#fbbf24', FAIL: '#f87171', INFO: '#67e8f9' };

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta)), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function KubebenchPanel() {
  const [visible, setVisible] = useState(false);
  const [chkRows, setChkRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const score = useCounter(87, 0, 60000);
  const totalChecks = useCounter(CHECKS.length, 0, 60000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const c = setInterval(() => setChkRows((x) => Math.min(x + 1, CHECKS.length)), 140);
    return () => clearInterval(c);
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
          kube-bench -- cis benchmark -- k8s security audit
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          score {score}/100
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>bench@cluster</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>kube-bench run --targets master,node,etcd,policies --json | jq .Controls</span>
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {SUMMARY.map((s) => (
          <div key={s.label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color: s.color, marginBottom: 2 }}>{s.count}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Score bar */}
      <div style={{ padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,4,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>CIS Kubernetes Benchmark v1.9</span>
          <span className="tabular-nums" style={{ fontSize: 9, color: '#4ade80', fontWeight: 700 }}>{score}/100</span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${score}%`, background: score > 90 ? '#4ade80' : score > 75 ? '#fbbf24' : '#f87171', transition: 'width 1s ease' }} />
        </div>
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Checks */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // benchmark checks
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {CHECKS.slice(0, chkRows).map((chk) => (
            <div key={chk.id} style={{ display: 'grid', gridTemplateColumns: '36px 80px 1fr 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: `${STATUS_COLOR[chk.status]}06`, border: `1px solid ${STATUS_COLOR[chk.status]}14`, borderRadius: 2 }}>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 8 }}>{chk.id}</span>
              <span style={{ color: '#67e8f9', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chk.section}</span>
              <span style={{ color: 'rgba(240,239,255,0.4)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chk.desc}</span>
              <span style={{ color: STATUS_COLOR[chk.status], fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{chk.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          kube-bench v0.8 - aqua security - cis k8s 1.9
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalChecks} checks - {score}/100
        </span>
      </div>
    </div>
  );
}
