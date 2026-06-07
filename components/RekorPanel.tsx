'use client';

import { useEffect, useRef, useState } from 'react';

const ENTRIES = [
  { logIndex: 142840, kind: 'hashedrekord', subject: 'api-gateway:sha256:4a8f...', signer: 'lewis@construxgroup.io', ts: '2m ago' },
  { logIndex: 142839, kind: 'intoto', subject: 'construx-web:sbom.spdx', signer: 'ci-bot@github.com', ts: '4m ago' },
  { logIndex: 142838, kind: 'hashedrekord', subject: 'ml-service:sha256:9c3d...', signer: 'lewis@construxgroup.io', ts: '12m ago' },
  { logIndex: 142837, kind: 'cosign', subject: 'docker.io/construx/api@sha256', signer: 'keyless/OIDC', ts: '18m ago' },
];

const POLICIES = [
  { name: 'require-signed-images', status: 'ENFORCED', pass: 142, fail: 0 },
  { name: 'require-sbom-attestation', status: 'ENFORCED', pass: 98, fail: 2 },
  { name: 'require-vuln-scan', status: 'AUDIT', pass: 76, fail: 8 },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta)), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function RekorPanel() {
  const [visible, setVisible] = useState(false);
  const [entRows, setEntRows] = useState(0);
  const [polRows, setPolRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const treeSize = useCounter(142840, 1, 3000);
  const verified = useCounter(48200, 8, 800);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const e = setInterval(() => setEntRows((x) => Math.min(x + 1, ENTRIES.length)), 160);
    const p = setInterval(() => setPolRows((x) => Math.min(x + 1, POLICIES.length)), 170);
    return () => { clearInterval(e); clearInterval(p); };
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
          rekor -- sigstore transparency log -- supply chain
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {treeSize.toLocaleString()} entries
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>rekor@sigstore</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>rekor-cli verify --artifact api-gateway.tar.gz --signature api-gateway.sig</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'tree size', value: treeSize.toLocaleString(), color: '#4ade80' },
          { label: 'verified/hr', value: verified.toLocaleString(), color: '#67e8f9' },
          { label: 'policies', value: POLICIES.length.toString(), color: '#a78bfa' },
          { label: 'tree hash', value: 'sha256', color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Transparency log entries */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent log entries
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {ENTRIES.slice(0, entRows).map((ent) => (
            <div key={ent.logIndex} style={{ display: 'grid', gridTemplateColumns: '52px 72px 1fr 104px 32px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 8 }}>#{ent.logIndex}</span>
              <span style={{ color: '#67e8f9', fontSize: 8 }}>{ent.kind}</span>
              <span style={{ color: 'rgba(240,239,255,0.4)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ent.subject}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ent.signer}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{ent.ts}</span>
            </div>
          ))}
        </div>

        {/* Policies */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // policy enforcement
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {POLICIES.slice(0, polRows).map((pol) => (
            <div key={pol.name} style={{ padding: '5px 8px', background: 'rgba(74,222,128,0.03)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600 }}>{pol.name}</span>
                <span style={{ color: pol.status === 'ENFORCED' ? '#4ade80' : '#fbbf24', fontSize: 7, padding: '1px 5px', background: pol.status === 'ENFORCED' ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)', border: `1px solid ${pol.status === 'ENFORCED' ? 'rgba(74,222,128,0.25)' : 'rgba(251,191,36,0.25)'}`, borderRadius: 2 }}>{pol.status}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(pol.pass / (pol.pass + pol.fail)) * 100}%`, background: pol.fail > 0 ? '#fbbf24' : '#4ade80', transition: 'width 0.8s ease' }} />
                </div>
                <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7 }}>{pol.pass} pass</span>
                {pol.fail > 0 && <span className="tabular-nums" style={{ color: '#f87171', fontSize: 7 }}>{pol.fail} fail</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          rekor v1.3 - sigstore - merkle tree / trillian
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {treeSize.toLocaleString()} entries - {verified.toLocaleString()} verified
        </span>
      </div>
    </div>
  );
}
