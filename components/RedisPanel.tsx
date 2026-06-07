'use client';

import { useEffect, useRef, useState } from 'react';

const NODES = [
  { id: 'redis-0', role: 'master', slots: '0-5460', keys: 28400, memory: '284MB', status: 'ok' },
  { id: 'redis-1', role: 'master', slots: '5461-10922', keys: 24800, memory: '248MB', status: 'ok' },
  { id: 'redis-2', role: 'master', slots: '10923-16383', keys: 27200, memory: '272MB', status: 'ok' },
  { id: 'redis-3', role: 'replica', slots: '0-5460', keys: 28400, memory: '284MB', status: 'ok' },
];

const COMMANDS = [
  { cmd: 'SET', calls: 28400, usec: 4, rejects: 0, key: 'session:lewis:token' },
  { cmd: 'GET', calls: 284000, usec: 2, rejects: 0, key: 'listing:cache:4812' },
  { cmd: 'ZADD', calls: 4800, usec: 8, rejects: 0, key: 'leaderboard:construx' },
  { cmd: 'XADD', calls: 12000, usec: 6, rejects: 0, key: 'stream:events' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function RedisPanel() {
  const [visible, setVisible] = useState(false);
  const [nodeRows, setNodeRows] = useState(0);
  const [cmdRows, setCmdRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const opsPerSec = useCounter(28400, 480, 400);
  const hitsPerSec = useCounter(24000, 240, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const n = setInterval(() => setNodeRows((x) => Math.min(x + 1, NODES.length)), 160);
    const c = setInterval(() => setCmdRows((x) => Math.min(x + 1, COMMANDS.length)), 140);
    return () => { clearInterval(n); clearInterval(c); };
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
          redis -- in-memory store -- cluster / streams / commands
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {opsPerSec.toLocaleString()} ops/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>redis@cluster</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>redis-cli --cluster check redis-0:6379 && redis-cli info stats | grep instantaneous_ops_per_sec</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'ops/s', value: opsPerSec.toLocaleString(), color: '#67e8f9' },
          { label: 'hits/s', value: hitsPerSec.toLocaleString(), color: '#4ade80' },
          { label: 'total keys', value: NODES.filter(n => n.role === 'master').reduce((a, n) => a + n.keys, 0).toLocaleString(), color: '#a78bfa' },
          { label: 'nodes', value: NODES.length.toString(), color: '#fbbf24' },
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
          // cluster nodes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {NODES.slice(0, nodeRows).map((node) => (
            <div key={node.id} style={{ display: 'grid', gridTemplateColumns: '52px 44px 80px 48px 48px 24px', alignItems: 'center', gap: 8, padding: '5px 8px', background: node.role === 'master' ? 'rgba(103,232,249,0.04)' : 'rgba(103,232,249,0.02)', border: `1px solid ${node.role === 'master' ? 'rgba(103,232,249,0.1)' : 'rgba(103,232,249,0.06)'}`, borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600 }}>{node.id}</span>
              <span style={{ color: node.role === 'master' ? '#fbbf24' : '#a78bfa', fontSize: 7 }}>{node.role}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{node.slots}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{node.keys.toLocaleString()}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{node.memory}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{node.status}</span>
            </div>
          ))}
        </div>

        {/* Commands */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // top commands
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {COMMANDS.slice(0, cmdRows).map((cmd, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 48px 20px 20px 1fr', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 7, fontWeight: 700 }}>{cmd.cmd}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{cmd.calls.toLocaleString()}</span>
              <span className="tabular-nums" style={{ color: cmd.usec > 5 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{cmd.usec}μs</span>
              <span className="tabular-nums" style={{ color: cmd.rejects > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{cmd.rejects}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cmd.key}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          redis v7.4 - rsal-1.1 - in-memory data structure store
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {opsPerSec.toLocaleString()} ops/s - {hitsPerSec.toLocaleString()} hits/s
        </span>
      </div>
    </div>
  );
}
