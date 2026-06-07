'use client';

import { useEffect, useRef, useState } from 'react';

const ARTIFACTS = [
  { name: 'construx-web:v2.4.1', type: 'container', keyless: true, rekor: 'a9f2b8c1', transparency: true, verified: true },
  { name: 'construx-api:v1.8.0', type: 'container', keyless: true, rekor: 'd3e7a4f6', transparency: true, verified: true },
  { name: 'construx-worker:v0.9.2', type: 'container', keyless: true, rekor: 'b1c5d2e8', transparency: true, verified: true },
  { name: 'construx-cli-v1.2.0.tar.gz', type: 'binary', keyless: false, rekor: 'f4a0b7c3', transparency: true, verified: true },
];

const VERIFICATIONS = [
  { artifact: 'construx-web:v2.4.1', issuer: 'https://token.actions.githubusercontent.com', workflow: 'release.yml', result: 'OK', time: '2m ago' },
  { artifact: 'construx-api:v1.8.0', issuer: 'https://token.actions.githubusercontent.com', workflow: 'release.yml', result: 'OK', time: '1h ago' },
  { artifact: 'construx-worker:v0.9.2', issuer: 'https://token.actions.githubusercontent.com', workflow: 'deploy.yml', result: 'OK', time: '2h ago' },
  { artifact: 'construx-cli-v1.2.0.tar.gz', issuer: 'https://accounts.google.com', workflow: '—', result: 'OK', time: '1d ago' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function SigstorePanel() {
  const [visible, setVisible] = useState(false);
  const [aRows, setARows] = useState(0);
  const [vRows, setVRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const signaturesLogged = useCounter(2840, 8, 1100);
  const verifications = useCounter(840, 4, 900);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const a = setInterval(() => setARows((x) => Math.min(x + 1, ARTIFACTS.length)), 160);
    const v = setInterval(() => setVRows((x) => Math.min(x + 1, VERIFICATIONS.length)), 140);
    return () => { clearInterval(a); clearInterval(v); };
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
          sigstore -- keyless signing -- cosign / rekor / transparency log
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {signaturesLogged.toLocaleString()} sigs
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>cosign@signing</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>cosign sign --yes ghcr.io/construxgroup/construx-web:v2.4.1 && cosign verify --certificate-identity-regexp ".*" --certificate-oidc-issuer https://token.actions.githubusercontent.com</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'signatures', value: signaturesLogged.toLocaleString(), color: '#4ade80' },
          { label: 'verifications', value: verifications.toLocaleString(), color: '#67e8f9' },
          { label: 'artifacts', value: ARTIFACTS.length.toString(), color: '#a78bfa' },
          { label: 'keyless', value: ARTIFACTS.filter(a => a.keyless).length.toString(), color: '#fbbf24' },
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
          {ARTIFACTS.slice(0, aRows).map((art) => (
            <div key={art.name} style={{ display: 'grid', gridTemplateColumns: '1fr 48px 48px 52px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{art.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{art.type}</span>
              <span style={{ color: art.keyless ? '#67e8f9' : '#fbbf24', fontSize: 7 }}>{art.keyless ? 'keyless' : 'keyed'}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{art.rekor}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>verified</span>
            </div>
          ))}
        </div>

        {/* Verifications */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent verifications
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {VERIFICATIONS.slice(0, vRows).map((ver) => (
            <div key={ver.artifact} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 40px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ver.artifact}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ver.workflow}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{ver.result}</span>
              <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'right' }}>{ver.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          sigstore v1.8 - apache-2.0 - keyless artifact signing
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {signaturesLogged.toLocaleString()} sigs - {verifications.toLocaleString()} verif
        </span>
      </div>
    </div>
  );
}
