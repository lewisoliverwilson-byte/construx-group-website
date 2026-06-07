'use client';

import { useEffect, useRef, useState } from 'react';

const SANDBOXES = [
  { id: 'sbox-api-0', image: 'construx/api:v2.4', sandbox: 'ptrace', cpu: '180m', mem: '128 MB', uptime: '4d 2h', status: 'running' },
  { id: 'sbox-worker-0', image: 'construx/worker:v1.8', sandbox: 'kvm', cpu: '420m', mem: '256 MB', uptime: '4d 2h', status: 'running' },
  { id: 'sbox-redis-0', image: 'redis:7.2', sandbox: 'kvm', cpu: '60m', mem: '64 MB', uptime: '12d 0h', status: 'running' },
  { id: 'sbox-task-2', image: 'construx/task:v0.9', sandbox: 'ptrace', cpu: '90m', mem: '96 MB', uptime: '0d 3h', status: 'running' },
];

const SYSCALL_GROUPS = [
  { group: 'file I/O', calls: 42, intercepted: 42, emulated: 38 },
  { group: 'network', calls: 18, intercepted: 18, emulated: 17 },
  { group: 'process', calls: 12, intercepted: 12, emulated: 11 },
  { group: 'memory', calls: 28, intercepted: 28, emulated: 28 },
  { group: 'signals', calls: 8, intercepted: 8, emulated: 8 },
];

const KERNEL_STATS = [
  { metric: 'gofer cache hits', value: '94.2%', color: '#4ade80' },
  { metric: 'page faults/s', value: '1,240', color: '#fbbf24' },
  { metric: 'netstack throughput', value: '2.1 GB/s', color: '#67e8f9' },
  { metric: 'sentry overhead', value: '~8%', color: '#a78bfa' },
];

function useCounter(base: number, delta: number, ms = 700) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function GVisorPanel() {
  const [visible, setVisible] = useState(false);
  const [sbRows, setSbRows] = useState(0);
  const [scRows, setScRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const syscallsTotal = useCounter(2_840_000, 2400, 700);
  const intercepted = useCounter(2_840_000, 2400, 700);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setSbRows((x) => Math.min(x + 1, SANDBOXES.length)), 150);
    const sc = setInterval(() => setScRows((x) => Math.min(x + 1, SYSCALL_GROUPS.length)), 140);
    return () => { clearInterval(s); clearInterval(sc); };
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
          gvisor -- sandboxed container runtime (runsc)
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {SANDBOXES.length} sandboxes
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>sentry@sandbox</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>runsc --platform=kvm --network=sandbox run construx/api && runsc ps</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'sandboxes', value: SANDBOXES.length.toString(), color: '#4ade80' },
          { label: 'syscalls total', value: (syscallsTotal / 1_000_000).toFixed(1) + 'M', color: '#a78bfa' },
          { label: 'intercepted', value: (intercepted / 1_000_000).toFixed(1) + 'M', color: '#67e8f9' },
          { label: 'sentry overhead', value: '~8%', color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Sandboxes */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // running sandboxes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {SANDBOXES.slice(0, sbRows).map((sb) => (
            <div key={sb.id} style={{ display: 'grid', gridTemplateColumns: '84px 1fr 40px 52px 52px 60px 52px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 8 }}>{sb.id}</span>
              <span style={{ color: '#4ade80', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sb.image}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, padding: '1px 4px', background: 'rgba(103,232,249,0.1)', borderRadius: 2, textAlign: 'center' }}>{sb.sandbox}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, textAlign: 'right' }}>{sb.cpu}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{sb.mem}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{sb.uptime}</span>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{sb.status.toUpperCase()}</span>
            </div>
          ))}
        </div>

        {/* Syscall interception */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
              // syscall interception
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {SYSCALL_GROUPS.slice(0, scRows).map((sg) => (
                <div key={sg.group} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 44px', alignItems: 'center', gap: 6, padding: '4px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
                  <span style={{ color: 'rgba(240,239,255,0.55)', fontSize: 8 }}>{sg.group}</span>
                  <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(sg.emulated / sg.calls) * 100}%`, background: '#a78bfa', borderRadius: 2, transition: 'width 1s ease' }} />
                  </div>
                  <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 8, textAlign: 'right' }}>{sg.calls}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
              // kernel emulation stats
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {KERNEL_STATS.map((ks) => (
                <div key={ks.metric} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px', background: `${ks.color}06`, border: `1px solid ${ks.color}18`, borderRadius: 2 }}>
                  <span style={{ fontSize: 8, color: 'rgba(240,239,255,0.45)' }}>{ks.metric}</span>
                  <span className="tabular-nums" style={{ fontSize: 9, color: ks.color, fontWeight: 700 }}>{ks.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          gvisor runsc v20240402 - google - kvm/ptrace
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {(syscallsTotal / 1_000_000).toFixed(1)}M syscalls intercepted
        </span>
      </div>
    </div>
  );
}
