'use client';

import { useEffect, useRef, useState } from 'react';

const CATALOG = [
  { kind: 'Service', name: 'api-gateway', owner: 'platform', lifecycle: 'production', health: 'OK' },
  { kind: 'Service', name: 'auth-service', owner: 'security', lifecycle: 'production', health: 'OK' },
  { kind: 'Library', name: '@construx/ui', owner: 'frontend', lifecycle: 'production', health: 'OK' },
  { kind: 'Service', name: 'worker-queue', owner: 'platform', lifecycle: 'experimental', health: 'WARN' },
  { kind: 'Component', name: 'data-pipeline', owner: 'data', lifecycle: 'production', health: 'OK' },
  { kind: 'API', name: 'openapi-v2', owner: 'platform', lifecycle: 'deprecated', health: 'WARN' },
];

const RADAR = [
  { name: 'Next.js', ring: 'ADOPT', quadrant: 'frameworks' },
  { name: 'eBPF', ring: 'TRIAL', quadrant: 'techniques' },
  { name: 'Temporal', ring: 'TRIAL', quadrant: 'platforms' },
  { name: 'Turso', ring: 'ASSESS', quadrant: 'platforms' },
  { name: 'Pkl', ring: 'ASSESS', quadrant: 'languages' },
  { name: 'REST APIs', ring: 'HOLD', quadrant: 'techniques' },
];

const RING_COLOR: Record<string, string> = {
  ADOPT: '#4ade80',
  TRIAL: '#67e8f9',
  ASSESS: '#fbbf24',
  HOLD: '#f87171',
};

const KIND_COLOR: Record<string, string> = {
  Service: '#a78bfa',
  Library: '#67e8f9',
  Component: '#fbbf24',
  API: '#f87171',
};

const HEALTH_COLOR: Record<string, string> = { OK: '#4ade80', WARN: '#fbbf24', ERR: '#f87171' };

function useCounter(base: number, delta: number, ms = 2200) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function BackstagePanel() {
  const [visible, setVisible] = useState(false);
  const [catalogRows, setCatalogRows] = useState(0);
  const [radarRows, setRadarRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const components = useCounter(142, 1, 3000);
  const plugins = useCounter(38, 0, 5000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const c = setInterval(() => setCatalogRows((x) => Math.min(x + 1, CATALOG.length)), 150);
    const r = setInterval(() => setRadarRows((x) => Math.min(x + 1, RADAR.length)), 130);
    return () => { clearInterval(c); clearInterval(r); };
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
          backstage -- developer portal -- service catalog
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {components} components
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>dev@portal</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>backstage-cli catalog:import --target . --watch --dry-run=false</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'components', value: components.toString(), color: '#a78bfa' },
          { label: 'plugins', value: plugins.toString(), color: '#67e8f9' },
          { label: 'owners', value: '14', color: '#fbbf24' },
          { label: 'healthy', value: `${CATALOG.filter((c) => c.health === 'OK').length}/${CATALOG.length}`, color: '#4ade80' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Catalog */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // service catalog
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {CATALOG.slice(0, catalogRows).map((c) => (
            <div key={c.name} style={{ display: 'grid', gridTemplateColumns: '62px 1fr 60px 80px 40px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: KIND_COLOR[c.kind] ?? '#a78bfa', fontSize: 8, fontWeight: 600 }}>{c.kind}</span>
              <span style={{ color: 'rgba(240,239,255,0.7)', fontSize: 9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.owner}</span>
              <span style={{ color: c.lifecycle === 'production' ? 'rgba(255,255,255,0.4)' : c.lifecycle === 'deprecated' ? '#f87171' : '#fbbf24', fontSize: 8 }}>{c.lifecycle}</span>
              <span style={{ color: HEALTH_COLOR[c.health], fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{c.health}</span>
            </div>
          ))}
        </div>

        {/* Tech Radar */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // tech radar
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {RADAR.slice(0, radarRows).map((item) => (
            <div key={item.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', background: `${RING_COLOR[item.ring]}08`, border: `1px solid ${RING_COLOR[item.ring]}28`, borderRadius: 2 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: RING_COLOR[item.ring], display: 'inline-block' }} />
              <span style={{ fontSize: 8, color: 'rgba(240,239,255,0.65)' }}>{item.name}</span>
              <span style={{ fontSize: 7, color: RING_COLOR[item.ring], fontWeight: 600 }}>{item.ring}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          backstage v1.26 - cncf - spotify
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {components} components - {plugins} plugins
        </span>
      </div>
    </div>
  );
}
