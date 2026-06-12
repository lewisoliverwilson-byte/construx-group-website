'use client';

import { useEffect, useRef, useState } from 'react';

const DEFINITIONS = [
  { name: 'user', relations: 4, permissions: 0, caveat: false, usedBy: 8, status: 'active' },
  { name: 'listing', relations: 3, permissions: 6, caveat: true, usedBy: 12, status: 'active' },
  { name: 'organisation', relations: 5, permissions: 8, caveat: false, usedBy: 6, status: 'active' },
  { name: 'workspace', relations: 4, permissions: 7, caveat: true, usedBy: 4, status: 'active' },
];

const CHECKS = [
  { subject: 'user:lewis', permission: 'view', resource: 'listing:48291', latency: 3, allowed: true, status: 'ok' },
  { subject: 'user:lewis', permission: 'edit', resource: 'listing:48291', latency: 4, allowed: true, status: 'ok' },
  { subject: 'user:guest-284', permission: 'edit', resource: 'listing:48291', latency: 2, allowed: false, status: 'ok' },
  { subject: 'user:lewis', permission: 'admin', resource: 'organisation:construx', latency: 5, allowed: true, status: 'ok' },
];

const CHECK_COLOR: Record<string, string> = {
  true: '#4ade80',
  false: '#f87171',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function SpiceDBPanel() {
  const [visible, setVisible] = useState(false);
  const [defRows, setDefRows] = useState(0);
  const [checkRows, setCheckRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const checksPerSec = useCounter(28400, 480, 400);
  const relationshipsTotal = useCounter(284000, 2400, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const d = setInterval(() => setDefRows((x) => Math.min(x + 1, DEFINITIONS.length)), 160);
    const c = setInterval(() => setCheckRows((x) => Math.min(x + 1, CHECKS.length)), 140);
    return () => { clearInterval(d); clearInterval(c); };
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
          spicedb -- zanzibar authorization -- schema / relationships / checks
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {checksPerSec.toLocaleString()} checks/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>zed@spicedb</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>zed schema read && zed permission check user:lewis view listing:48291 && zed relationship read listing:48291</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'checks / sec', value: checksPerSec.toLocaleString(), color: '#a78bfa' },
          { label: 'relationships', value: (relationshipsTotal / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'definitions', value: DEFINITIONS.length.toString(), color: '#67e8f9' },
          { label: 'permissions', value: DEFINITIONS.reduce((a, d) => a + d.permissions, 0).toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Definitions */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // schema definitions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {DEFINITIONS.slice(0, defRows).map((d) => (
            <div key={d.name} style={{ display: 'grid', gridTemplateColumns: '80px 20px 20px 44px 24px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600 }}>{d.name}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{d.relations}r</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'center' }}>{d.permissions}p</span>
              <span style={{ color: d.caveat ? '#4ade80' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{d.caveat ? 'caveat' : 'plain'}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{d.usedBy}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{d.status}</span>
            </div>
          ))}
        </div>

        {/* Checks */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // permission checks
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {CHECKS.slice(0, checkRows).map((c, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 44px 1fr 28px 44px 24px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{c.subject}</span>
              <span style={{ color: '#fbbf24', fontSize: 7 }}>{c.permission}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.resource}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{c.latency}ms</span>
              <span style={{ color: CHECK_COLOR[c.allowed.toString()], fontSize: 7, fontWeight: 700 }}>{c.allowed ? 'allowed' : 'denied'}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          spicedb v1.35 - apache-2.0 - inspired by google zanzibar
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {checksPerSec.toLocaleString()} checks/s - {(relationshipsTotal / 1000).toFixed(0)}k rels
        </span>
      </div>
    </div>
  );
}
