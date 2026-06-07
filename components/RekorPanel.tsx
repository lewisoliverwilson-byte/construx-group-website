'use client';

import { useEffect, useRef, useState } from 'react';

const ENTRIES = [
  { logIndex: 28400284, type: 'hashedrekord', subject: 'construxgroup/api:2.4.1', issuer: 'sigstore.dev', treeSize: 284000284, status: 'verified' },
  { logIndex: 28400283, type: 'dsse', subject: 'construx-ui@v3.1.0.sbom', issuer: 'sigstore.dev', treeSize: 284000283, status: 'verified' },
  { logIndex: 28400282, type: 'hashedrekord', subject: 'construx-worker:1.2.0', issuer: 'sigstore.dev', treeSize: 284000282, status: 'verified' },
  { logIndex: 28400281, type: 'intoto', subject: 'construx-infra@v2.0.0', issuer: 'sigstore.dev', treeSize: 284000281, status: 'verified' },
];

const MONITORS = [
  { name: 'construx-identity-monitor', pattern: '.*@construxgroup.io', matched: 284, alerts: 0, lastRun: '5m' },
  { name: 'construx-artifact-monitor', pattern: 'construxgroup/.*', matched: 1240, alerts: 0, lastRun: '5m' },
  { name: 'construx-anomaly-monitor', pattern: '.*construx.*', matched: 48, alerts: 1, lastRun: '1h' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function RekorPanel() {
  const [visible, setVisible] = useState(false);
  const [entRows, setEntRows] = useState(0);
  const [monRows, setMonRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const treeSize = useCounter(284000284, 48, 500);
  const verificationsPerSec = useCounter(2840, 24, 400);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const e = setInterval(() => setEntRows((x) => Math.min(x + 1, ENTRIES.length)), 160);
    const m = setInterval(() => setMonRows((x) => Math.min(x + 1, MONITORS.length)), 140);
    return () => { clearInterval(e); clearInterval(m); };
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
          rekor -- transparency log -- signed artifacts / monitors / tree
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {treeSize.toLocaleString()} entries
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>rekor@sigstore</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>rekor-cli search --email deploy@construxgroup.io && rekor-cli get --log-index 28400284 --format json</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'tree size', value: (treeSize / 1000000).toFixed(1) + 'M', color: '#67e8f9' },
          { label: 'verif/s', value: verificationsPerSec.toLocaleString(), color: '#4ade80' },
          { label: 'entries', value: ENTRIES.length.toString(), color: '#a78bfa' },
          { label: 'alerts', value: MONITORS.reduce((a, m) => a + m.alerts, 0).toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Entries */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent log entries
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {ENTRIES.slice(0, entRows).map((entry) => (
            <div key={entry.logIndex} style={{ display: 'grid', gridTemplateColumns: '56px 44px 1fr 40px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7 }}>{entry.logIndex}</span>
              <span style={{ color: '#a78bfa', fontSize: 7 }}>{entry.type}</span>
              <span style={{ color: 'rgba(240,239,255,0.3)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.subject}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{entry.status}</span>
            </div>
          ))}
        </div>

        {/* Monitors */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // artifact monitors
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {MONITORS.slice(0, monRows).map((mon) => (
            <div key={mon.name} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 36px 28px 32px', alignItems: 'center', gap: 8, padding: '4px 8px', background: mon.alerts > 0 ? 'rgba(251,191,36,0.04)' : 'rgba(103,232,249,0.04)', border: `1px solid ${mon.alerts > 0 ? 'rgba(251,191,36,0.1)' : 'rgba(103,232,249,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mon.name}</span>
              <span style={{ color: 'rgba(240,239,255,0.25)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mon.pattern}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{mon.matched}</span>
              <span className="tabular-nums" style={{ color: mon.alerts > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{mon.alerts}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{mon.lastRun}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          rekor v1.3 - apache-2.0 - sigstore transparency log
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {(treeSize / 1000000).toFixed(1)}M entries - {verificationsPerSec.toLocaleString()} verif/s
        </span>
      </div>
    </div>
  );
}
