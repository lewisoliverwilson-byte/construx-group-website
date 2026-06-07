'use client';

import { useEffect, useRef, useState } from 'react';

const MODULES = [
  { name: 'construx/api', files: 28, messages: 84, services: 6, version: 'v1.4.2', status: 'ok' },
  { name: 'construx/events', files: 12, messages: 42, services: 2, version: 'v2.1.0', status: 'ok' },
  { name: 'construx/ml', files: 8, messages: 24, services: 3, version: 'v0.8.4', status: 'warning' },
];

const LINT = [
  { module: 'construx/api', rule: 'FIELD_NAMES_LOWER_SNAKE_CASE', file: 'api/v1/user.proto', line: 42, severity: 'error' },
  { module: 'construx/ml', rule: 'MESSAGE_NAMES_UPPER_CAMEL_CASE', file: 'ml/v1/embed.proto', line: 18, severity: 'warning' },
  { module: 'construx/events', rule: 'ENUM_ZERO_VALUE_SUFFIX', file: 'events/v1/event.proto', line: 8, severity: 'warning' },
];

const BREAKING = [
  { module: 'construx/api', change: 'FIELD_REMOVED', file: 'api/v1/user.proto', desc: 'user_id field removed', severity: 'error' },
  { module: 'construx/events', change: 'ENUM_VALUE_REMOVED', file: 'events/v1/event.proto', desc: 'EVENT_UNKNOWN removed', severity: 'error' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function BufPanel() {
  const [visible, setVisible] = useState(false);
  const [mRows, setMRows] = useState(0);
  const [lRows, setLRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalMessages = MODULES.reduce((a, m) => a + m.messages, 0);
  const pushCount = useCounter(284, 2, 1400);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const m = setInterval(() => setMRows((x) => Math.min(x + 1, MODULES.length)), 160);
    const l = setInterval(() => setLRows((x) => Math.min(x + 1, LINT.length + BREAKING.length)), 140);
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
          buf -- protobuf schema registry -- lint / breaking
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {pushCount} pushes
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>buf@schema</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>buf lint && buf breaking --against ".git#branch=main" && buf push</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'pushes', value: pushCount.toString(), color: '#a78bfa' },
          { label: 'messages', value: totalMessages.toString(), color: '#4ade80' },
          { label: 'modules', value: MODULES.length.toString(), color: '#67e8f9' },
          { label: 'breaking', value: BREAKING.length.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Modules */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // modules
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {MODULES.slice(0, mRows).map((m) => (
            <div key={m.name} style={{ display: 'grid', gridTemplateColumns: '1fr 24px 24px 20px 40px 28px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600 }}>{m.name}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 8, textAlign: 'center' }}>{m.files}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 8, textAlign: 'center' }}>{m.messages}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'center' }}>{m.services}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{m.version}</span>
              <span style={{ color: m.status === 'ok' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{m.status}</span>
            </div>
          ))}
        </div>

        {/* Lint + Breaking */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // lint errors &amp; breaking changes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[...BREAKING, ...LINT].slice(0, lRows).map((item, i) => {
            const isBreaking = i < BREAKING.length && 'change' in item;
            const b = item as typeof BREAKING[0];
            const l = item as typeof LINT[0];
            return (
              <div key={('change' in item ? b.change : l.rule) + i} style={{ display: 'grid', gridTemplateColumns: '48px 1fr 1fr 32px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.1)', borderRadius: 2 }}>
                <span style={{ color: '#f87171', fontSize: 7, fontWeight: 700 }}>{isBreaking ? 'BREAK' : 'LINT'}</span>
                <span style={{ color: 'rgba(240,239,255,0.3)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{'change' in item ? b.change : l.rule}</span>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{'change' in item ? b.file : l.file}</span>
                <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{'change' in item ? '' : `:${l.line}`}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          buf v1.32 - apache 2.0 - buf build
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {MODULES.length} modules - {totalMessages} messages
        </span>
      </div>
    </div>
  );
}
