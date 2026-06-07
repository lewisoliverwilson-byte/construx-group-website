'use client';

import { useEffect, useRef, useState } from 'react';

const NODES = [
  { host: 'prod-api-01', os: 'linux', cpu: 42, mem: 68, disk: 54, alarms: 0 },
  { host: 'prod-worker-01', os: 'linux', cpu: 78, mem: 84, disk: 32, alarms: 1 },
  { host: 'prod-db-01', os: 'linux', cpu: 28, mem: 91, disk: 72, alarms: 0 },
  { host: 'prod-gateway-01', os: 'linux', cpu: 18, mem: 44, disk: 28, alarms: 0 },
];

const ALARMS = [
  { node: 'prod-worker-01', alarm: 'ram_in_use', status: 'WARNING', value: '84%', threshold: '80%' },
  { node: 'prod-db-01', alarm: 'disk_space_usage', status: 'CLEAR', value: '72%', threshold: '85%' },
  { node: 'prod-api-01', alarm: 'net_drops', status: 'CLEAR', value: '0/s', threshold: '1/s' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

function Gauge({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ width: 28, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 1, opacity: 0.8 }} />
    </div>
  );
}

export default function NetdataPanel() {
  const [visible, setVisible] = useState(false);
  const [nRows, setNRows] = useState(0);
  const [aRows, setARows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const metricsPerSec = useCounter(128400, 840, 600);
  const totalNodes = useCounter(4, 0, 60000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const n = setInterval(() => setNRows((x) => Math.min(x + 1, NODES.length)), 160);
    const a = setInterval(() => setARows((x) => Math.min(x + 1, ALARMS.length)), 140);
    return () => { clearInterval(n); clearInterval(a); };
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
          netdata -- real-time monitoring -- ebpf / plugins
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {metricsPerSec.toLocaleString()} metrics/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>netdata@monitor</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>netdatacli aclk-state && netdatacli ping && curl -s http://localhost:19999/api/v1/info | jq .version</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'metrics/s', value: metricsPerSec.toLocaleString(), color: '#4ade80' },
          { label: 'nodes', value: totalNodes.toString(), color: '#67e8f9' },
          { label: 'alarms', value: ALARMS.filter(a => a.status === 'WARNING').length.toString(), color: '#fbbf24' },
          { label: 'critical', value: ALARMS.filter(a => a.status === 'CRITICAL').length.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Nodes */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // monitored nodes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {NODES.slice(0, nRows).map((n) => (
            <div key={n.host} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 36px 36px 28px 28px 28px', alignItems: 'center', gap: 6, padding: '5px 8px', background: n.alarms > 0 ? 'rgba(251,191,36,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${n.alarms > 0 ? 'rgba(251,191,36,0.1)' : 'rgba(74,222,128,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.host}</span>
              <Gauge pct={n.cpu} color={n.cpu > 70 ? '#fbbf24' : '#4ade80'} />
              <Gauge pct={n.mem} color={n.mem > 80 ? '#f87171' : '#67e8f9'} />
              <Gauge pct={n.disk} color={n.disk > 80 ? '#f87171' : '#a78bfa'} />
              <span className="tabular-nums" style={{ color: n.cpu > 70 ? '#fbbf24' : 'rgba(255,255,255,0.25)', fontSize: 7, textAlign: 'right' }}>{n.cpu}%</span>
              <span className="tabular-nums" style={{ color: n.mem > 80 ? '#f87171' : 'rgba(255,255,255,0.25)', fontSize: 7, textAlign: 'right' }}>{n.mem}%</span>
              <span className="tabular-nums" style={{ color: n.alarms > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, fontWeight: n.alarms > 0 ? 700 : 400, textAlign: 'right' }}>{n.alarms}</span>
            </div>
          ))}
        </div>

        {/* Alarms */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // active alarms
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ALARMS.slice(0, aRows).map((a) => (
            <div key={a.node + a.alarm} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 56px 36px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: a.status === 'WARNING' ? 'rgba(251,191,36,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${a.status === 'WARNING' ? 'rgba(251,191,36,0.1)' : 'rgba(74,222,128,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.node}</span>
              <span style={{ color: a.status === 'WARNING' ? '#fbbf24' : '#4ade80', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.alarm}</span>
              <span style={{ color: a.status === 'WARNING' ? '#fbbf24' : '#4ade80', fontSize: 7, fontWeight: 700 }}>{a.status}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 7, textAlign: 'right' }}>{a.value}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{a.threshold}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          netdata v1.45 - gpl-3.0 - real-time agent
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {metricsPerSec.toLocaleString()} metrics/s - {totalNodes} nodes
        </span>
      </div>
    </div>
  );
}
