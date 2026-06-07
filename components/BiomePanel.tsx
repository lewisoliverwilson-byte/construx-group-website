'use client';

import { useEffect, useRef, useState } from 'react';

const FILES = [
  { path: 'src/api/handler.ts', lintErrors: 0, formatDiff: 0, size: '4.2 KB', status: 'clean' },
  { path: 'src/worker/queue.ts', lintErrors: 2, formatDiff: 0, size: '8.4 KB', status: 'errors' },
  { path: 'src/utils/logger.ts', lintErrors: 0, formatDiff: 4, size: '2.1 KB', status: 'format' },
  { path: 'src/db/migrations.ts', lintErrors: 0, formatDiff: 0, size: '12.8 KB', status: 'clean' },
  { path: 'src/routes/index.ts', lintErrors: 1, formatDiff: 2, size: '6.4 KB', status: 'errors' },
];

const DIAGNOSTICS = [
  { rule: 'lint/correctness/noUnusedVariables', file: 'worker/queue.ts', line: 42, severity: 'error', msg: 'Variable `retryCount` is unused' },
  { rule: 'lint/suspicious/noExplicitAny', file: 'worker/queue.ts', line: 84, severity: 'error', msg: 'Unexpected any. Specify a different type.' },
  { rule: 'lint/style/noUnusedTemplateLiteral', file: 'routes/index.ts', line: 12, severity: 'warn', msg: 'Do not use template literals if not necessary' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function BiomePanel() {
  const [visible, setVisible] = useState(false);
  const [fRows, setFRows] = useState(0);
  const [dRows, setDRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const filesChecked = useCounter(2840, 4, 1200);
  const checkDur = useCounter(84, 0, 60000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const f = setInterval(() => setFRows((x) => Math.min(x + 1, FILES.length)), 160);
    const d = setInterval(() => setDRows((x) => Math.min(x + 1, DIAGNOSTICS.length)), 140);
    return () => { clearInterval(f); clearInterval(d); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(249,115,22,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(249,115,22,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(249,115,22,0.08)', background: 'rgba(249,115,22,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(249,115,22,0.4)' }}>
          biome -- rust linter + formatter -- js / ts / json
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {checkDur}ms check
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>biome@lint</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>biome ci --error-on-warnings src/ && biome format --write src/</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'check ms', value: `${checkDur}ms`, color: '#f97316' },
          { label: 'files', value: filesChecked.toLocaleString(), color: '#4ade80' },
          { label: 'errors', value: FILES.reduce((a, f) => a + f.lintErrors, 0).toString(), color: '#f87171' },
          { label: 'format diffs', value: FILES.reduce((a, f) => a + f.formatDiff, 0).toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Files */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // checked files
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {FILES.slice(0, fRows).map((f) => (
            <div key={f.path} style={{ display: 'grid', gridTemplateColumns: '1fr 20px 20px 40px 36px', alignItems: 'center', gap: 8, padding: '5px 8px', background: f.status === 'clean' ? 'rgba(74,222,128,0.04)' : 'rgba(248,113,113,0.04)', border: `1px solid ${f.status === 'clean' ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.path}</span>
              <span className="tabular-nums" style={{ color: f.lintErrors > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 8, fontWeight: f.lintErrors > 0 ? 700 : 400, textAlign: 'center' }}>{f.lintErrors}</span>
              <span className="tabular-nums" style={{ color: f.formatDiff > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 8, fontWeight: f.formatDiff > 0 ? 700 : 400, textAlign: 'center' }}>{f.formatDiff}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{f.size}</span>
              <span style={{ color: f.status === 'clean' ? '#4ade80' : '#f87171', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{f.status}</span>
            </div>
          ))}
        </div>

        {/* Diagnostics */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // diagnostics
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {DIAGNOSTICS.slice(0, dRows).map((d) => (
            <div key={d.rule + d.line} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 20px', alignItems: 'center', gap: 8, padding: '4px 8px', background: d.severity === 'error' ? 'rgba(248,113,113,0.04)' : 'rgba(251,191,36,0.04)', border: `1px solid ${d.severity === 'error' ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: d.severity === 'error' ? '#f87171' : '#fbbf24', fontSize: 7, fontWeight: 700 }}>{d.severity.toUpperCase()}</span>
              <span style={{ color: 'rgba(240,239,255,0.3)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.msg}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>:{d.line}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          biome v1.8 - mit - rust-based toolchain
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {filesChecked.toLocaleString()} files - {checkDur}ms
        </span>
      </div>
    </div>
  );
}
