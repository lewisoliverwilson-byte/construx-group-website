'use client';

import { useEffect, useRef, useState } from 'react';

const TARGETS = [
  { job: 'construx-web', path: '/var/log/app/*.log', labels: 'app=web,env=prod', state: 'active', rate: '840 B/s' },
  { job: 'nginx-access', path: '/var/log/nginx/access.log', labels: 'app=nginx,env=prod', state: 'active', rate: '2.4 KB/s' },
  { job: 'postgres-logs', path: '/var/log/postgresql/*.log', labels: 'app=postgres,env=prod', state: 'active', rate: '120 B/s' },
  { job: 'k8s-events', path: '/var/log/pods/**/*.log', labels: 'source=k8s,env=prod', state: 'active', rate: '4.8 KB/s' },
];

const PIPELINES = [
  { stage: 'regex', action: 'output: `(?P<level>INFO|WARN|ERROR) (?P<msg>.*)`', dropped: 0 },
  { stage: 'labels', action: 'level, app, env → loki labels', dropped: 0 },
  { stage: 'drop', action: 'drop if level=DEBUG', dropped: 284 },
  { stage: 'limit', action: 'rate limit 1000 lines/s', dropped: 0 },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function PromtailPanel() {
  const [visible, setVisible] = useState(false);
  const [tRows, setTRows] = useState(0);
  const [pRows, setPRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const linesPerSec = useCounter(2840, 48, 500);
  const bytesPerSec = useCounter(8400, 120, 400);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setTRows((x) => Math.min(x + 1, TARGETS.length)), 160);
    const p = setInterval(() => setPRows((x) => Math.min(x + 1, PIPELINES.length)), 140);
    return () => { clearInterval(t); clearInterval(p); };
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
          promtail -- loki log shipper -- scrape / pipeline / push
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {linesPerSec.toLocaleString()} lines/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>promtail@logging</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>promtail -config.file=/etc/promtail/config.yml -print-config-stderr 2&gt;&amp;1 | head -40</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'lines/s', value: linesPerSec.toLocaleString(), color: '#f97316' },
          { label: 'bytes/s', value: (bytesPerSec / 1024).toFixed(1) + ' KB/s', color: '#67e8f9' },
          { label: 'targets', value: TARGETS.length.toString(), color: '#4ade80' },
          { label: 'dropped', value: PIPELINES.reduce((a, p) => a + p.dropped, 0).toString(), color: '#fbbf24' },
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
          // scrape targets
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {TARGETS.slice(0, tRows).map((tgt) => (
            <div key={tgt.job} style={{ display: 'grid', gridTemplateColumns: '72px 1fr 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600 }}>{tgt.job}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tgt.path}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{tgt.rate}</span>
            </div>
          ))}
        </div>

        {/* Pipeline stages */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // pipeline stages
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {PIPELINES.slice(0, pRows).map((pp) => (
            <div key={pp.stage} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 48px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600 }}>{pp.stage}</span>
              <span style={{ color: 'rgba(240,239,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pp.action}</span>
              <span className="tabular-nums" style={{ color: pp.dropped > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'right' }}>{pp.dropped > 0 ? `−${pp.dropped}` : 'pass'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          promtail v3.0 - agpl-3.0 - loki log shipping agent
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {TARGETS.length} targets - {linesPerSec.toLocaleString()} lines/s
        </span>
      </div>
    </div>
  );
}
