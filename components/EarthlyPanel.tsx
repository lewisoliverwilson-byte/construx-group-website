'use client';

import { useEffect, useRef, useState } from 'react';

const TARGETS = [
  { name: '+build', type: 'build', cached: true, duration: '8s', deps: 3, platform: 'linux/amd64' },
  { name: '+test', type: 'test', cached: false, duration: '42s', deps: 1, platform: 'linux/amd64' },
  { name: '+docker', type: 'image', cached: true, duration: '12s', deps: 2, platform: 'linux/amd64,arm64' },
  { name: '+lint', type: 'build', cached: true, duration: '4s', deps: 1, platform: 'linux/amd64' },
  { name: '+deploy', type: 'run', cached: false, duration: '28s', deps: 2, platform: 'linux/amd64' },
];

const STEPS = [
  { target: '+build', step: 'FROM golang:1.22-alpine', status: 'cached', layer: 'sha256:a3f2' },
  { target: '+build', step: 'COPY go.mod go.sum', status: 'cached', layer: 'sha256:b8c1' },
  { target: '+build', step: 'RUN go mod download', status: 'cached', layer: 'sha256:d4e9' },
  { target: '+build', step: 'RUN go build -o app', status: 'run', layer: 'sha256:f1a7' },
];

const STATUS_COLOR: Record<string, string> = {
  cached: '#4ade80',
  run: '#fbbf24',
  failed: '#f87171',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function EarthlyPanel() {
  const [visible, setVisible] = useState(false);
  const [tRows, setTRows] = useState(0);
  const [sRows, setSRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const cacheHit = useCounter(84, 0, 60000);
  const totalBuilds = useCounter(2840, 3, 1400);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setTRows((x) => Math.min(x + 1, TARGETS.length)), 160);
    const s = setInterval(() => setSRows((x) => Math.min(x + 1, STEPS.length)), 140);
    return () => { clearInterval(t); clearInterval(s); };
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
          earthly -- repeatable builds -- earthfile / buildkit
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {cacheHit}% cache hit
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>earthly@builds</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>earthly --ci +docker --platform linux/amd64,linux/arm64 --push</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'cache hit %', value: `${cacheHit}%`, color: '#67e8f9' },
          { label: 'total builds', value: totalBuilds.toLocaleString(), color: '#4ade80' },
          { label: 'targets', value: TARGETS.length.toString(), color: '#a78bfa' },
          { label: 'cached', value: TARGETS.filter(t => t.cached).length.toString(), color: '#4ade80' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Targets */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // earthfile targets
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {TARGETS.slice(0, tRows).map((t) => (
            <div key={t.name} style={{ display: 'grid', gridTemplateColumns: '56px 36px 36px 36px 1fr', alignItems: 'center', gap: 8, padding: '5px 8px', background: t.cached ? 'rgba(74,222,128,0.04)' : 'rgba(251,191,36,0.04)', border: `1px solid ${t.cached ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600 }}>{t.name}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{t.type}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{t.duration}</span>
              <span style={{ color: t.cached ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'center' }}>{t.cached ? 'CACHED' : 'RUN'}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.platform}</span>
            </div>
          ))}
        </div>

        {/* Build steps */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // build steps — +build
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {STEPS.slice(0, sRows).map((step) => (
            <div key={step.step} style={{ display: 'grid', gridTemplateColumns: '1fr 48px 56px', alignItems: 'center', gap: 8, padding: '4px 8px', background: `${STATUS_COLOR[step.status]}06`, border: `1px solid ${STATUS_COLOR[step.status]}14`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{step.step}</span>
              <span style={{ color: STATUS_COLOR[step.status], fontSize: 7, fontWeight: 700, textAlign: 'center' }}>{step.status.toUpperCase()}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{step.layer}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          earthly v0.8 - busl-1.1 - buildkit native
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalBuilds.toLocaleString()} builds - {cacheHit}% cached
        </span>
      </div>
    </div>
  );
}
