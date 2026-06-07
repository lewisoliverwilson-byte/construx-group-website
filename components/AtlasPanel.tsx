'use client';

import { useEffect, useRef, useState } from 'react';

const MIGRATIONS = [
  { version: '20260607001', name: 'add_vector_index_to_embeddings', status: 'applied', dur: '1.2s', stmts: 3 },
  { version: '20260605002', name: 'create_audit_log_table', status: 'applied', dur: '0.4s', stmts: 2 },
  { version: '20260601001', name: 'add_tenant_id_to_api_keys', status: 'applied', dur: '8.4s', stmts: 4 },
  { version: '20260524003', name: 'create_events_partitioned', status: 'applied', dur: '2.1s', stmts: 5 },
];

const LINTS = [
  { check: 'MF101', desc: 'Missing version file for migration', status: 'PASS' },
  { check: 'DS101', desc: 'Destructive change detected', status: 'PASS' },
  { check: 'CD101', desc: 'Concurrent index needed', status: 'WARN' },
  { check: 'LT101', desc: 'Lock time exceeds threshold', status: 'PASS' },
];

const STATUS_COLOR: Record<string, string> = { applied: '#4ade80', pending: '#fbbf24', failed: '#f87171' };
const LINT_COLOR: Record<string, string> = { PASS: '#4ade80', WARN: '#fbbf24', FAIL: '#f87171' };

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta)), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function AtlasPanel() {
  const [visible, setVisible] = useState(false);
  const [migRows, setMigRows] = useState(0);
  const [lintRows, setLintRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalMigs = useCounter(MIGRATIONS.length, 0, 60000);
  const schemaHash = useState('sha256:4f8a')[0];

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const m = setInterval(() => setMigRows((x) => Math.min(x + 1, MIGRATIONS.length)), 160);
    const l = setInterval(() => setLintRows((x) => Math.min(x + 1, LINTS.length)), 150);
    return () => { clearInterval(m); clearInterval(l); };
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
          atlas -- schema migrations -- lint + versioned
        </span>
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {schemaHash}
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>atlas@schema</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>atlas migrate apply --url postgres://prod:5432/construx --revisions-schema atlas</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'migrations', value: totalMigs.toString(), color: '#a78bfa' },
          { label: 'applied', value: MIGRATIONS.filter(m => m.status === 'applied').length.toString(), color: '#4ade80' },
          { label: 'lint checks', value: LINTS.length.toString(), color: '#67e8f9' },
          { label: 'warnings', value: LINTS.filter(l => l.status === 'WARN').length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Migrations */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // migration history
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {MIGRATIONS.slice(0, migRows).map((mig) => (
            <div key={mig.version} style={{ display: 'grid', gridTemplateColumns: '72px 1fr 40px 24px 40px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8 }}>{mig.version.slice(-6)}</span>
              <span style={{ color: '#a78bfa', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mig.name}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{mig.dur}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 8, textAlign: 'right' }}>{mig.stmts}</span>
              <span style={{ color: STATUS_COLOR[mig.status], fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{mig.status.toUpperCase().slice(0, 5)}</span>
            </div>
          ))}
        </div>

        {/* Lint */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // lint analysis
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {LINTS.slice(0, lintRows).map((lint) => (
            <div key={lint.check} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: `${LINT_COLOR[lint.status]}06`, border: `1px solid ${LINT_COLOR[lint.status]}14`, borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600 }}>{lint.check}</span>
              <span style={{ color: 'rgba(240,239,255,0.4)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lint.desc}</span>
              <span style={{ color: LINT_COLOR[lint.status], fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{lint.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          atlas v0.25 - ariga.io - hcl schema language
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {MIGRATIONS.length} migrations applied
        </span>
      </div>
    </div>
  );
}
