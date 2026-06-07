'use client';

import { useEffect, useRef, useState } from 'react';

const STREAMS = [
  { labels: '{app="api",env="prod"}', entries: 248400, rate: '84/s', bytes: '2.4 MB/s' },
  { labels: '{app="worker",env="prod"}', entries: 124200, rate: '42/s', bytes: '1.1 MB/s' },
  { labels: '{app="gateway",env="prod"}', entries: 96000, rate: '28/s', bytes: '0.8 MB/s' },
  { labels: '{job="cron",env="prod"}', entries: 18400, rate: '6/s', bytes: '0.1 MB/s' },
];

const LINES = [
  { ts: '12:04:01', level: 'info', stream: 'api', msg: 'POST /api/v1/embeddings 200 142ms' },
  { ts: '12:04:01', level: 'info', stream: 'worker', msg: 'job EmbeddingJob completed attempt=1' },
  { ts: '12:04:02', level: 'warn', stream: 'gateway', msg: 'upstream latency spike p99=842ms' },
  { ts: '12:04:02', level: 'info', stream: 'api', msg: 'GET /api/v1/health 200 1ms' },
  { ts: '12:04:03', level: 'error', stream: 'worker', msg: 'job ReportJob failed attempt=3/3' },
];

const LEVEL_COLOR: Record<string, string> = {
  info: '#4ade80',
  warn: '#fbbf24',
  error: '#f87171',
  debug: 'rgba(255,255,255,0.3)',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function LokiPanel() {
  const [visible, setVisible] = useState(false);
  const [sRows, setSRows] = useState(0);
  const [lRows, setLRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const ingestRate = useCounter(160, 6, 700);
  const totalEntries = useCounter(487000, 85, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setSRows((x) => Math.min(x + 1, STREAMS.length)), 160);
    const l = setInterval(() => setLRows((x) => Math.min(x + 1, LINES.length)), 140);
    return () => { clearInterval(s); clearInterval(l); };
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
          grafana loki -- log aggregation -- logql
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {ingestRate.toLocaleString()} lines/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>loki@logs</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>logcli query '{`{app="api",env="prod"}`}' --limit 100 --tail</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'lines/s', value: ingestRate.toLocaleString(), color: '#f97316' },
          { label: 'total entries', value: totalEntries.toLocaleString(), color: '#4ade80' },
          { label: 'streams', value: STREAMS.length.toString(), color: '#a78bfa' },
          { label: 'errors', value: LINES.filter(l => l.level === 'error').length.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Streams */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // log streams
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {STREAMS.slice(0, sRows).map((s) => (
            <div key={s.labels} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 52px 64px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.labels}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 8, textAlign: 'right' }}>{s.rate}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{s.bytes}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 7, textAlign: 'right' }}>{s.entries.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Log lines */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent log lines
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {LINES.slice(0, lRows).map((line) => (
            <div key={line.ts + line.msg} style={{ display: 'grid', gridTemplateColumns: '48px 32px 48px 1fr', alignItems: 'center', gap: 8, padding: '4px 8px', background: `${LEVEL_COLOR[line.level]}06`, border: `1px solid ${LEVEL_COLOR[line.level]}14`, borderRadius: 2 }}>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{line.ts}</span>
              <span style={{ color: LEVEL_COLOR[line.level], fontSize: 7, fontWeight: 700, textAlign: 'center' }}>{line.level.toUpperCase()}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{line.stream}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{line.msg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          loki v3.0 - apache 2.0 - grafana labs
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalEntries.toLocaleString()} entries - {ingestRate.toLocaleString()} /s
        </span>
      </div>
    </div>
  );
}
