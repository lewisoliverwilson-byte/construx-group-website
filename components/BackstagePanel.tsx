'use client';

import { useEffect, useRef, useState } from 'react';

const CATALOG = [
  { name: 'construx-api', kind: 'Component', owner: 'platform-team', lifecycle: 'production', techdocs: true, status: 'ok' },
  { name: 'construx-workspace', kind: 'System', owner: 'product-team', lifecycle: 'production', techdocs: true, status: 'ok' },
  { name: 'construx-infra', kind: 'Resource', owner: 'platform-team', lifecycle: 'production', techdocs: false, status: 'ok' },
  { name: 'data-pipeline', kind: 'Component', owner: 'data-team', lifecycle: 'experimental', techdocs: true, status: 'ok' },
];

const TECHDOCS = [
  { title: 'Platform Engineering Guide', entity: 'construx-infra', views: 284, updated: '2d ago', size: '48KB' },
  { title: 'API Reference v2', entity: 'construx-api', views: 840, updated: '12h ago', size: '120KB' },
  { title: 'Deployment Runbook', entity: 'construx-workspace', views: 120, updated: '5d ago', size: '28KB' },
  { title: 'Data Pipeline ADR-012', entity: 'data-pipeline', views: 48, updated: '1d ago', size: '12KB' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function BackstagePanel() {
  const [visible, setVisible] = useState(false);
  const [catRows, setCatRows] = useState(0);
  const [docRows, setDocRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const catalogEntities = useCounter(284, 2, 1200);
  const pageViews = useCounter(28400, 48, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const c = setInterval(() => setCatRows((x) => Math.min(x + 1, CATALOG.length)), 160);
    const d = setInterval(() => setDocRows((x) => Math.min(x + 1, TECHDOCS.length)), 140);
    return () => { clearInterval(c); clearInterval(d); };
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
          backstage -- developer portal -- catalog / techdocs / plugins
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {catalogEntities.toLocaleString()} entities
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>backstage@portal</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>yarn backstage-cli catalog-import --location https://github.com/construxgroup/catalog-info.yaml</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'entities', value: catalogEntities.toLocaleString(), color: '#a78bfa' },
          { label: 'page views', value: (pageViews / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'techdocs', value: TECHDOCS.length.toString(), color: '#67e8f9' },
          { label: 'owners', value: [...new Set(CATALOG.map(c => c.owner))].length.toString(), color: '#fbbf24' },
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
          // software catalog
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {CATALOG.slice(0, catRows).map((ent) => (
            <div key={ent.name} style={{ display: 'grid', gridTemplateColumns: '80px 64px 72px 68px 28px 24px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600 }}>{ent.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{ent.kind}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ent.owner}</span>
              <span style={{ color: ent.lifecycle === 'production' ? '#4ade80' : '#fbbf24', fontSize: 7 }}>{ent.lifecycle}</span>
              <span style={{ color: ent.techdocs ? '#4ade80' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{ent.techdocs ? 'doc' : '-'}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{ent.status}</span>
            </div>
          ))}
        </div>

        {/* TechDocs */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // techdocs
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TECHDOCS.slice(0, docRows).map((doc, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 28px 44px 40px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.entity}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{doc.views}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{doc.updated}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{doc.size}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          backstage v1.28 - apache-2.0 - cncf developer portal
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {catalogEntities.toLocaleString()} entities - {(pageViews / 1000).toFixed(0)}k views
        </span>
      </div>
    </div>
  );
}
