'use client';

import { useEffect, useRef, useState } from 'react';

const DEVICES = [
  { name: 'construx-prod-api', os: 'linux', ip: '100.64.0.1', tags: 'tag:prod', lastSeen: '2s', status: 'online' },
  { name: 'construx-staging', os: 'linux', ip: '100.64.0.2', tags: 'tag:staging', lastSeen: '8s', status: 'online' },
  { name: 'lewis-mbp', os: 'macos', ip: '100.64.0.10', tags: 'tag:dev', lastSeen: '1s', status: 'online' },
  { name: 'construx-ci-runner', os: 'linux', ip: '100.64.0.4', tags: 'tag:ci', lastSeen: '3m', status: 'idle' },
];

const ACL_RULES = [
  { action: 'accept', src: 'tag:dev', dst: 'tag:staging', ports: '443,22', status: 'active' },
  { action: 'accept', src: 'tag:prod', dst: 'tag:prod', ports: '*', status: 'active' },
  { action: 'accept', src: 'tag:ci', dst: 'tag:staging', ports: '443', status: 'active' },
  { action: 'deny', src: '*', dst: 'tag:prod', ports: '22', status: 'active' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function TailscalePanel() {
  const [visible, setVisible] = useState(false);
  const [devRows, setDevRows] = useState(0);
  const [aclRows, setAclRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const bytesRx = useCounter(2840000, 4800, 500);
  const bytesTx = useCounter(840000, 1200, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const d = setInterval(() => setDevRows((x) => Math.min(x + 1, DEVICES.length)), 160);
    const a = setInterval(() => setAclRows((x) => Math.min(x + 1, ACL_RULES.length)), 140);
    return () => { clearInterval(d); clearInterval(a); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(167,139,250,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(167,139,250,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(167,139,250,0.08)', background: 'rgba(167,139,250,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(167,139,250,0.4)' }}>
          tailscale -- zero-config vpn -- devices / acl / wireguard mesh
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {DEVICES.filter(d => d.status === 'online').length}/{DEVICES.length} online
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>tailscale@mesh</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>tailscale status --json && tailscale ping construx-prod-api --until-direct</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'rx bytes', value: (bytesRx / 1000000).toFixed(1) + 'MB', color: '#a78bfa' },
          { label: 'tx bytes', value: (bytesTx / 1000000).toFixed(1) + 'MB', color: '#67e8f9' },
          { label: 'devices', value: DEVICES.length.toString(), color: '#4ade80' },
          { label: 'acl rules', value: ACL_RULES.length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Devices */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // devices
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {DEVICES.slice(0, devRows).map((dev) => (
            <div key={dev.name} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 64px 56px 28px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: dev.status === 'idle' ? 'rgba(251,191,36,0.04)' : 'rgba(167,139,250,0.04)', border: `1px solid ${dev.status === 'idle' ? 'rgba(251,191,36,0.1)' : 'rgba(167,139,250,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dev.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{dev.os}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{dev.ip}</span>
              <span style={{ color: '#fbbf24', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dev.tags}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{dev.lastSeen}</span>
              <span style={{ color: dev.status === 'online' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{dev.status}</span>
            </div>
          ))}
        </div>

        {/* ACL Rules */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // acl policy
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ACL_RULES.slice(0, aclRows).map((rule, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '44px 64px 64px 48px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: rule.action === 'deny' ? 'rgba(248,113,113,0.04)' : 'rgba(167,139,250,0.04)', border: `1px solid ${rule.action === 'deny' ? 'rgba(248,113,113,0.1)' : 'rgba(167,139,250,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: rule.action === 'accept' ? '#4ade80' : '#f87171', fontSize: 7, fontWeight: 700 }}>{rule.action}</span>
              <span style={{ color: '#fbbf24', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rule.src}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rule.dst}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{rule.ports}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{rule.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          tailscale v1.68 - bsl-1.1 - wireguard mesh vpn
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {(bytesRx / 1000000).toFixed(1)}MB rx - {(bytesTx / 1000000).toFixed(1)}MB tx
        </span>
      </div>
    </div>
  );
}
