'use client';

import { useEffect, useRef, useState } from 'react';

const APPS = [
  { name: 'construx-web', sessions: 2840, errors: 4, webVital: 'LCP: 1.2s', apm: 'OK' },
  { name: 'scoutr-ui', sessions: 840, errors: 2, webVital: 'LCP: 0.9s', apm: 'OK' },
  { name: 'marqet-ui', sessions: 1240, errors: 0, webVital: 'LCP: 1.4s', apm: 'OK' },
  { name: 'hyve-app', sessions: 420, errors: 8, webVital: 'LCP: 2.1s', apm: 'WARN' },
];

const ERRORS = [
  { message: 'TypeError: Cannot read properties of undefined', app: 'construx-web', count: 2, type: 'exception', browser: 'Chrome' },
  { message: 'Unhandled Promise rejection: NetworkError', app: 'construx-web', count: 2, type: 'promise', browser: 'Safari' },
  { message: 'RangeError: Maximum call stack size exceeded', app: 'hyve-app', count: 5, type: 'exception', browser: 'Firefox' },
  { message: 'ChunkLoadError: Loading chunk 12 failed', app: 'hyve-app', count: 3, type: 'exception', browser: 'Chrome' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function GrafanaFaroPanel() {
  const [visible, setVisible] = useState(false);
  const [aRows, setARows] = useState(0);
  const [eRows, setERows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalSessions = APPS.reduce((a, app) => a + app.sessions, 0);
  const eventsPerSec = useCounter(840, 18, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const a = setInterval(() => setARows((x) => Math.min(x + 1, APPS.length)), 160);
    const e = setInterval(() => setERows((x) => Math.min(x + 1, ERRORS.length)), 140);
    return () => { clearInterval(a); clearInterval(e); };
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
          grafana faro -- frontend observability -- errors / web vitals / apm
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {eventsPerSec.toLocaleString()} events/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>faro@frontend</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>faro-web-sdk init --app construx-web --url https://faro-collector.construxgroup.io/collect</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'events/s', value: eventsPerSec.toLocaleString(), color: '#f97316' },
          { label: 'sessions', value: totalSessions.toLocaleString(), color: '#4ade80' },
          { label: 'apps', value: APPS.length.toString(), color: '#a78bfa' },
          { label: 'errors', value: ERRORS.reduce((a, e) => a + e.count, 0).toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Apps */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // applications
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {APPS.slice(0, aRows).map((app) => (
            <div key={app.name} style={{ display: 'grid', gridTemplateColumns: '88px 40px 24px 56px 28px', alignItems: 'center', gap: 8, padding: '5px 8px', background: app.errors > 0 ? 'rgba(248,113,113,0.04)' : 'rgba(249,115,22,0.04)', border: `1px solid ${app.errors > 0 ? 'rgba(248,113,113,0.1)' : 'rgba(249,115,22,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600 }}>{app.name}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{app.sessions.toLocaleString()}</span>
              <span className="tabular-nums" style={{ color: app.errors > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 8, textAlign: 'center', fontWeight: app.errors > 0 ? 700 : 400 }}>{app.errors}</span>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{app.webVital}</span>
              <span style={{ color: app.apm === 'OK' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{app.apm}</span>
            </div>
          ))}
        </div>

        {/* Frontend errors */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // frontend errors
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ERRORS.slice(0, eRows).map((er) => (
            <div key={er.message} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 20px 40px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.1)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.3)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{er.message}</span>
              <span style={{ color: '#f97316', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{er.app}</span>
              <span className="tabular-nums" style={{ color: '#f87171', fontSize: 8, textAlign: 'center', fontWeight: 700 }}>{er.count}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{er.browser}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          grafana faro v1.4 - agpl-3.0 - frontend observability
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalSessions.toLocaleString()} sessions - {eventsPerSec.toLocaleString()} events/s
        </span>
      </div>
    </div>
  );
}
