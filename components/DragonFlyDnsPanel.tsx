'use client';

import { useEffect, useRef, useState } from 'react';

const ZONES = [
  { zone: 'construxgroup.io', records: 28, serial: 2026060701, type: 'primary', queries: 48200 },
  { zone: 'api.construxgroup.io', records: 8, serial: 2026060702, type: 'primary', queries: 12400 },
  { zone: 'internal.construx', records: 42, serial: 2026060501, type: 'primary', queries: 84000 },
];

const RECORDS = [
  { name: 'api.construxgroup.io', type: 'A', ttl: 300, value: '104.21.x.x', status: 'active' },
  { name: 'app.construxgroup.io', type: 'CNAME', ttl: 300, value: 'construx.pages.dev', status: 'active' },
  { name: 'construxgroup.io', type: 'MX', ttl: 3600, value: 'mail.construxgroup.io', status: 'active' },
  { name: 'construxgroup.io', type: 'TXT', ttl: 300, value: 'v=spf1 include:sendgrid...', status: 'active' },
  { name: '_dmarc.construxgroup.io', type: 'TXT', ttl: 300, value: 'v=DMARC1; p=quarantine', status: 'active' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function DragonFlyDnsPanel() {
  const [visible, setVisible] = useState(false);
  const [zRows, setZRows] = useState(0);
  const [rRows, setRRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const qps = useCounter(1480, 16, 600);
  const cacheHit = useCounter(94, 0, 60000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const z = setInterval(() => setZRows((x) => Math.min(x + 1, ZONES.length)), 160);
    const r = setInterval(() => setRRows((x) => Math.min(x + 1, RECORDS.length)), 140);
    return () => { clearInterval(z); clearInterval(r); };
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
          dns -- zones / records -- dnssec / spf / dmarc
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {qps.toLocaleString()} qps
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>dns@resolver</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>dig +dnssec construxgroup.io ANY && dig _dmarc.construxgroup.io TXT</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'queries/s', value: qps.toLocaleString(), color: '#67e8f9' },
          { label: 'cache hit %', value: `${cacheHit}%`, color: '#4ade80' },
          { label: 'zones', value: ZONES.length.toString(), color: '#a78bfa' },
          { label: 'records', value: RECORDS.length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Zones */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // dns zones
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {ZONES.slice(0, zRows).map((z) => (
            <div key={z.zone} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 36px 48px 52px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 9, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{z.zone}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 8 }}>{z.serial}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 8, textAlign: 'right' }}>{z.records}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{z.type}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{z.queries.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Records */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // dns records
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {RECORDS.slice(0, rRows).map((rec) => (
            <div key={rec.name + rec.type} style={{ display: 'grid', gridTemplateColumns: '1fr 32px 32px 1fr', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.03)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rec.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 700 }}>{rec.type}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{rec.ttl}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rec.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          dns -- dnssec + dmarc + spf + dkim
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {qps.toLocaleString()} qps - {cacheHit}% cache hit
        </span>
      </div>
    </div>
  );
}
