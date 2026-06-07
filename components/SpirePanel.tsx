'use client';

import { useEffect, useRef, useState } from 'react';

const ENTRIES = [
  { spiffeId: 'spiffe://construxgroup.io/prod/api', selector: 'k8s:ns:prod', ttl: '1h', admin: false, downstream: true, status: 'active' },
  { spiffeId: 'spiffe://construxgroup.io/prod/db', selector: 'k8s:ns:prod', ttl: '1h', admin: false, downstream: false, status: 'active' },
  { spiffeId: 'spiffe://construxgroup.io/ci/deploy', selector: 'k8s:ns:ci', ttl: '30m', admin: false, downstream: true, status: 'active' },
  { spiffeId: 'spiffe://construxgroup.io/admin/vault', selector: 'unix:user:vault', ttl: '4h', admin: true, downstream: false, status: 'active' },
];

const SVIDS = [
  { spiffeId: 'spiffe://construxgroup.io/prod/api', type: 'x509', serial: 'a1b2c3d4', expires: '58m', renewsIn: '28m', status: 'valid' },
  { spiffeId: 'spiffe://construxgroup.io/prod/db', type: 'x509', serial: 'e5f6a7b8', expires: '52m', renewsIn: '22m', status: 'valid' },
  { spiffeId: 'spiffe://construxgroup.io/ci/deploy', type: 'jwt', serial: 'c9d0e1f2', expires: '18m', renewsIn: '8m', status: 'renewing' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function SpirePanel() {
  const [visible, setVisible] = useState(false);
  const [entRows, setEntRows] = useState(0);
  const [svidRows, setSvidRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const svidIssuances = useCounter(2840, 4, 700);
  const rotations = useCounter(284, 1, 1400);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const e = setInterval(() => setEntRows((x) => Math.min(x + 1, ENTRIES.length)), 160);
    const s = setInterval(() => setSvidRows((x) => Math.min(x + 1, SVIDS.length)), 140);
    return () => { clearInterval(e); clearInterval(s); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(251,191,36,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(251,191,36,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(251,191,36,0.08)', background: 'rgba(251,191,36,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(251,191,36,0.4)' }}>
          spire -- workload identity -- svids / bundles / agents
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {svidIssuances.toLocaleString()} svids
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#fbbf24', fontWeight: 600 }}>spire@server</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>spire-server entry show -spiffeID spiffe://construxgroup.io/prod && spire-agent healthcheck</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'svid issuances', value: svidIssuances.toLocaleString(), color: '#fbbf24' },
          { label: 'rotations', value: rotations.toLocaleString(), color: '#4ade80' },
          { label: 'entries', value: ENTRIES.length.toString(), color: '#a78bfa' },
          { label: 'active svids', value: SVIDS.length.toString(), color: '#67e8f9' },
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
          // workload registration entries
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {ENTRIES.slice(0, entRows).map((ent) => (
            <div key={ent.spiffeId} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 28px 24px 24px 40px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#fbbf24', fontSize: 7, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ent.spiffeId}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ent.selector}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{ent.ttl}</span>
              <span style={{ color: ent.admin ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{ent.admin ? 'adm' : '-'}</span>
              <span style={{ color: ent.downstream ? '#a78bfa' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{ent.downstream ? 'ds' : '-'}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{ent.status}</span>
            </div>
          ))}
        </div>

        {/* SVIDs */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // active svids
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SVIDS.slice(0, svidRows).map((svid) => (
            <div key={svid.spiffeId} style={{ display: 'grid', gridTemplateColumns: '1fr 28px 60px 28px 36px 52px', alignItems: 'center', gap: 8, padding: '4px 8px', background: svid.status === 'renewing' ? 'rgba(251,191,36,0.06)' : 'rgba(251,191,36,0.04)', border: `1px solid ${svid.status === 'renewing' ? 'rgba(251,191,36,0.2)' : 'rgba(251,191,36,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{svid.spiffeId}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{svid.type}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{svid.serial}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{svid.expires}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{svid.renewsIn}</span>
              <span style={{ color: svid.status === 'valid' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{svid.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(251,191,36,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          spire v1.9 - apache-2.0 - spiffe runtime environment
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {svidIssuances.toLocaleString()} issuances - {rotations.toLocaleString()} rotations
        </span>
      </div>
    </div>
  );
}
