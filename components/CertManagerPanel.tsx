'use client';

import { useEffect, useRef, useState } from 'react';

const CERTIFICATES = [
  { name: 'construxgroup-io-tls', namespace: 'prod', issuer: 'letsencrypt-prod', notAfter: '84d', renewsIn: '54d', status: 'ready' },
  { name: 'api-construxgroup-io-tls', namespace: 'prod', issuer: 'letsencrypt-prod', notAfter: '71d', renewsIn: '41d', status: 'ready' },
  { name: 'staging-tls', namespace: 'staging', issuer: 'letsencrypt-staging', notAfter: '12d', renewsIn: '-18d', status: 'renewing' },
  { name: 'internal-mtls', namespace: 'prod', issuer: 'vault-issuer', notAfter: '365d', renewsIn: '335d', status: 'ready' },
];

const ISSUERS = [
  { name: 'letsencrypt-prod', namespace: 'cert-manager', type: 'acme', ready: true, status: 'ready' },
  { name: 'letsencrypt-staging', namespace: 'cert-manager', type: 'acme', ready: true, status: 'ready' },
  { name: 'vault-issuer', namespace: 'cert-manager', type: 'vault', ready: true, status: 'ready' },
  { name: 'selfsigned', namespace: 'cert-manager', type: 'selfSigned', ready: true, status: 'ready' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function CertManagerPanel() {
  const [visible, setVisible] = useState(false);
  const [certRows, setCertRows] = useState(0);
  const [issuerRows, setIssuerRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const certsIssued = useCounter(284, 1, 1200);
  const renewalsTotal = useCounter(2840, 4, 800);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const c = setInterval(() => setCertRows((x) => Math.min(x + 1, CERTIFICATES.length)), 160);
    const i = setInterval(() => setIssuerRows((x) => Math.min(x + 1, ISSUERS.length)), 140);
    return () => { clearInterval(c); clearInterval(i); };
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
          cert-manager -- tls automation -- certificates / issuers / acme
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {certsIssued.toLocaleString()} certs
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>cmctl@cluster</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>cmctl status certificate construxgroup-io-tls -n prod && cmctl check api --wait=2m</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'certs issued', value: certsIssued.toLocaleString(), color: '#4ade80' },
          { label: 'renewals', value: renewalsTotal.toLocaleString(), color: '#67e8f9' },
          { label: 'issuers', value: ISSUERS.length.toString(), color: '#a78bfa' },
          { label: 'renewing', value: CERTIFICATES.filter(c => c.status === 'renewing').length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Certificates */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // certificates
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {CERTIFICATES.slice(0, certRows).map((cert) => (
            <div key={cert.name} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 80px 36px 36px 52px', alignItems: 'center', gap: 8, padding: '5px 8px', background: cert.status === 'renewing' ? 'rgba(251,191,36,0.06)' : 'rgba(74,222,128,0.04)', border: `1px solid ${cert.status === 'renewing' ? 'rgba(251,191,36,0.2)' : 'rgba(74,222,128,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{cert.namespace}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.issuer}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{cert.notAfter}</span>
              <span className="tabular-nums" style={{ color: cert.status === 'renewing' ? '#fbbf24' : 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{cert.renewsIn}</span>
              <span style={{ color: cert.status === 'ready' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{cert.status}</span>
            </div>
          ))}
        </div>

        {/* Issuers */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // certificate issuers
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ISSUERS.slice(0, issuerRows).map((issuer) => (
            <div key={issuer.name} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 56px 36px 48px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issuer.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{issuer.namespace}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{issuer.type}</span>
              <span style={{ color: issuer.ready ? '#4ade80' : '#f87171', fontSize: 7, textAlign: 'center' }}>{issuer.ready ? 'rdy' : 'not'}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{issuer.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          cert-manager v1.15 - apache-2.0 - x.509 certificate automation
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {certsIssued.toLocaleString()} issued - {renewalsTotal.toLocaleString()} renewed
        </span>
      </div>
    </div>
  );
}
