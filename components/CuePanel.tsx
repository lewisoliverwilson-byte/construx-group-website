'use client';

import { useEffect, useRef, useState } from 'react';

const SCHEMAS = [
  { name: 'construx.api.v1', kind: 'schema', constraints: 28, exports: 12, imports: 4, validated: true, status: 'ok' },
  { name: 'construx.config', kind: 'schema', constraints: 16, exports: 8, imports: 2, validated: true, status: 'ok' },
  { name: 'construx.pipeline', kind: 'definition', constraints: 12, exports: 6, imports: 3, validated: true, status: 'ok' },
  { name: 'construx.infra.k8s', kind: 'schema', constraints: 48, exports: 24, imports: 8, validated: true, status: 'ok' },
];

const VALIDATIONS = [
  { target: 'deploy/construx-api.yaml', schema: 'construx.api.v1', errors: 0, warnings: 0, fields: 48, status: 'valid' },
  { target: 'config/prod.yaml', schema: 'construx.config', errors: 0, warnings: 1, fields: 28, status: 'warning' },
  { target: 'pipelines/enrich.yaml', schema: 'construx.pipeline', errors: 0, warnings: 0, fields: 24, status: 'valid' },
  { target: 'infra/cluster.cue', schema: 'construx.infra.k8s', errors: 0, warnings: 0, fields: 84, status: 'valid' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function CuePanel() {
  const [visible, setVisible] = useState(false);
  const [schemaRows, setSchemaRows] = useState(0);
  const [validRows, setValidRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const validationsTotal = useCounter(2840, 4, 800);
  const constraintsChecked = useCounter(28400, 48, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setSchemaRows((x) => Math.min(x + 1, SCHEMAS.length)), 160);
    const v = setInterval(() => setValidRows((x) => Math.min(x + 1, VALIDATIONS.length)), 140);
    return () => { clearInterval(s); clearInterval(v); };
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
          cue -- data validation -- schemas / constraints / code gen
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {validationsTotal.toLocaleString()} validations
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>cue@schema</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>cue vet ./... && cue export ./config/ --out json | cue import - && cue cmd gen</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'validations', value: validationsTotal.toLocaleString(), color: '#4ade80' },
          { label: 'constraints', value: constraintsChecked.toLocaleString(), color: '#67e8f9' },
          { label: 'schemas', value: SCHEMAS.length.toString(), color: '#a78bfa' },
          { label: 'valid', value: VALIDATIONS.filter(v => v.status === 'valid').length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Schemas */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // schemas
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {SCHEMAS.slice(0, schemaRows).map((s) => (
            <div key={s.name} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 24px 24px 20px 32px 28px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{s.kind}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{s.constraints}c</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'center' }}>{s.exports}e</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{s.imports}i</span>
              <span style={{ color: s.validated ? '#4ade80' : '#f87171', fontSize: 7, textAlign: 'center' }}>{s.validated ? 'ok' : 'err'}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{s.status}</span>
            </div>
          ))}
        </div>

        {/* Validations */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // validations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {VALIDATIONS.slice(0, validRows).map((v, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 20px 20px 24px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.target}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.schema}</span>
              <span className="tabular-nums" style={{ color: v.errors > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{v.errors}e</span>
              <span className="tabular-nums" style={{ color: v.warnings > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{v.warnings}w</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{v.fields}f</span>
              <span style={{ color: v.status === 'valid' ? '#4ade80' : v.status === 'warning' ? '#fbbf24' : '#f87171', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{v.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          cue v0.10 - apache-2.0 - validate, define, generate and tag data
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {validationsTotal.toLocaleString()} validations - {constraintsChecked.toLocaleString()} constraints
        </span>
      </div>
    </div>
  );
}
