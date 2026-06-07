'use client';

import { useEffect, useRef, useState } from 'react';

const ARTIFACTS = [
  { ref: 'construxgroup/api:2.4.1', digest: 'sha256:a1b2c3d4', type: 'container', signer: 'deploy@construxgroup.io', signedAt: '4m ago', status: 'verified' },
  { ref: 'construxgroup/worker:1.8.0', digest: 'sha256:e5f6a7b8', type: 'container', signer: 'deploy@construxgroup.io', signedAt: '12m ago', status: 'verified' },
  { ref: 'construxgroup/api-sbom.cdx.json', digest: 'sha256:c9d0e1f2', type: 'sbom', signer: 'ci-bot@construxgroup.io', signedAt: '14m ago', status: 'verified' },
  { ref: 'construxgroup/api:2.4.0', digest: 'sha256:8f4b2a1e', type: 'container', signer: 'deploy@construxgroup.io', signedAt: '2h ago', status: 'verified' },
];

const VERIFICATIONS = [
  { ref: 'construxgroup/api:2.4.1', policy: 'keyless', issuer: 'sigstore.dev', subject: 'deploy@construxgroup.io', tlog: 28400284, status: 'ok' },
  { ref: 'construxgroup/worker:1.8.0', policy: 'keyless', issuer: 'sigstore.dev', subject: 'deploy@construxgroup.io', tlog: 28400280, status: 'ok' },
  { ref: 'construxgroup/api-sbom.cdx.json', policy: 'keyless', issuer: 'sigstore.dev', subject: 'ci-bot@construxgroup.io', tlog: 28400275, status: 'ok' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function CosignPanel() {
  const [visible, setVisible] = useState(false);
  const [artRows, setArtRows] = useState(0);
  const [verRows, setVerRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const signaturesTotal = useCounter(2840, 4, 700);
  const verificationsTotal = useCounter(28400, 48, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const a = setInterval(() => setArtRows((x) => Math.min(x + 1, ARTIFACTS.length)), 160);
    const v = setInterval(() => setVerRows((x) => Math.min(x + 1, VERIFICATIONS.length)), 140);
    return () => { clearInterval(a); clearInterval(v); };
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
          cosign -- artifact signing -- signatures / keyless / tlog
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {signaturesTotal.toLocaleString()} signed
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>cosign@ci</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>cosign sign --yes construxgroup/api:2.4.1 && cosign verify --certificate-identity deploy@construxgroup.io construxgroup/api:2.4.1</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'signatures', value: signaturesTotal.toLocaleString(), color: '#67e8f9' },
          { label: 'verifications', value: (verificationsTotal / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'artifacts', value: ARTIFACTS.length.toString(), color: '#a78bfa' },
          { label: 'tlog entry', value: (28400284 / 1000000).toFixed(1) + 'M', color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Artifacts */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // signed artifacts
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {ARTIFACTS.slice(0, artRows).map((art) => (
            <div key={art.ref} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 44px 1fr 44px 48px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 7, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{art.ref}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{art.digest.slice(0, 14)}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{art.type}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{art.signer}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{art.signedAt}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{art.status}</span>
            </div>
          ))}
        </div>

        {/* Verifications */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // signature verifications
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {VERIFICATIONS.slice(0, verRows).map((ver, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 48px 72px 1fr 24px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ver.ref}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{ver.policy}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ver.issuer}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ver.subject}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{ver.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          cosign v2.4 - apache-2.0 - sigstore artifact signing
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {signaturesTotal.toLocaleString()} signed - {(verificationsTotal / 1000).toFixed(0)}k verified
        </span>
      </div>
    </div>
  );
}
