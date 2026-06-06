'use client';

import { useState, useEffect, useRef } from 'react';

interface Rule {
  to:     string;
  action: 'ALLOW' | 'DENY' | 'LIMIT' | 'REJECT';
  from:   string;
  proto:  string;
  iface?: string;
}

const RULES: Rule[] = [
  { to: '22/tcp',   action: 'LIMIT', from: 'Anywhere',         proto: 'tcp',  iface: 'eth0' },
  { to: '80/tcp',   action: 'ALLOW', from: 'Anywhere',         proto: 'tcp',  iface: 'eth0' },
  { to: '443/tcp',  action: 'ALLOW', from: 'Anywhere',         proto: 'tcp',  iface: 'eth0' },
  { to: '443/udp',  action: 'ALLOW', from: 'Anywhere',         proto: 'udp',  iface: 'eth0' },
  { to: '3000/tcp', action: 'ALLOW', from: '10.0.0.0/8',       proto: 'tcp',  iface: 'eth1' },
  { to: '5432/tcp', action: 'ALLOW', from: '127.0.0.1',        proto: 'tcp' },
  { to: '6379/tcp', action: 'ALLOW', from: '127.0.0.1',        proto: 'tcp' },
  { to: '9090/tcp', action: 'ALLOW', from: '10.0.1.0/24',      proto: 'tcp',  iface: 'eth1' },
  { to: '51820/udp',action: 'ALLOW', from: 'Anywhere',         proto: 'udp',  iface: 'eth0' },
  { to: 'Anywhere', action: 'DENY',  from: '82.44.12.91',      proto: 'any' },
  { to: 'Anywhere', action: 'DENY',  from: '185.220.101.0/24', proto: 'any' },
  { to: '22/tcp',   action: 'LIMIT', from: 'Anywhere (v6)',    proto: 'tcp6', iface: 'eth0' },
  { to: '80/tcp',   action: 'ALLOW', from: 'Anywhere (v6)',    proto: 'tcp6', iface: 'eth0' },
  { to: '443/tcp',  action: 'ALLOW', from: 'Anywhere (v6)',    proto: 'tcp6', iface: 'eth0' },
  { to: '443/udp',  action: 'ALLOW', from: 'Anywhere (v6)',    proto: 'udp6', iface: 'eth0' },
];

const COUNTERS: { label: string; val: number; delta: number }[] = [
  { label: 'pkts allowed', val: 2847361, delta: 47  },
  { label: 'pkts denied',  val:    1293, delta:   3  },
  { label: 'pkts limited', val:   14821, delta:   9  },
  { label: 'bytes in',     val: 4812947, delta: 512  },
];

function actionColor(action: Rule['action']): string {
  if (action === 'ALLOW')  return '#4ade80';
  if (action === 'LIMIT')  return '#fbbf24';
  if (action === 'DENY')   return '#f87171';
  if (action === 'REJECT') return '#fb923c';
  return 'rgba(240,239,255,0.35)';
}

function protoColor(proto: string): string {
  if (proto.startsWith('tcp')) return '#60a5fa';
  if (proto.startsWith('udp')) return '#a78bfa';
  return 'rgba(240,239,255,0.3)';
}

export default function UfwStatusPanel() {
  const [revealed, setRevealed] = useState(0);
  const [counters, setCounters] = useState(COUNTERS.map((c) => c.val));
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > RULES.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 72);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= RULES.length) return;
    const id = setInterval(() => {
      setCounters((prev) =>
        prev.map((v, i) => v + COUNTERS[i].delta + Math.floor(Math.random() * COUNTERS[i].delta)),
      );
    }, 2200);
    return () => clearInterval(id);
  }, [revealed]);

  const allDone = revealed > RULES.length;
  const displayed = RULES.slice(0, allDone ? RULES.length : revealed);

  const allowed = displayed.filter((r) => r.action === 'ALLOW').length;
  const denied  = displayed.filter((r) => r.action === 'DENY').length;
  const limited = displayed.filter((r) => r.action === 'LIMIT').length;

  return (
    <div
      ref={ref}
      className="overflow-x-auto font-mono"
      style={{
        background:   'rgba(1,1,10,0.97)',
        border:       '1px solid rgba(255,255,255,0.07)',
        borderRadius: '3px',
        boxShadow:    '0 0 0 1px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.6)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57', boxShadow: '0 0 4px rgba(255,95,87,0.4)' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E', boxShadow: '0 0 4px rgba(255,189,46,0.3)' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840', boxShadow: '0 0 4px rgba(40,200,64,0.3)' }} />
        </div>
        <span
          className="flex-1 text-center text-[9px] uppercase tracking-[0.2em]"
          style={{ color: 'rgba(255,255,255,0.22)' }}
        >
          construx@sys — ufw status verbose
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${RULES.length} rules` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>sudo ufw status verbose</span>
      </div>

      {/* Status header */}
      {revealed > 0 && (
        <div className="px-4 pt-2.5 pb-1 space-y-0.5">
          <div className="text-[8px]" style={{ color: 'rgba(240,239,255,0.3)' }}>
            Status: <span style={{ color: '#4ade80', fontWeight: 700 }}>active</span>
          </div>
          <div className="text-[8px]" style={{ color: 'rgba(240,239,255,0.3)' }}>
            Default: <span style={{ color: '#f87171' }}>deny</span> (incoming) · <span style={{ color: '#4ade80' }}>allow</span> (outgoing) · <span style={{ color: '#f87171' }}>deny</span> (routed)
          </div>
          <div className="text-[8px]" style={{ color: 'rgba(240,239,255,0.3)' }}>
            New profiles: skip
          </div>
        </div>
      )}

      {/* Column headers */}
      {revealed > 0 && (
        <div
          className="flex items-center px-4 py-1 mt-1 text-[8px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.18)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ minWidth: '96px', flexShrink: 0 }}>To</span>
          <span style={{ minWidth: '60px', flexShrink: 0 }}>Action</span>
          <span style={{ minWidth: '168px', flexShrink: 0 }}>From</span>
          <span style={{ minWidth: '48px', flexShrink: 0 }}>Proto</span>
          <span style={{ color: 'rgba(240,239,255,0.12)' }}>Iface</span>
        </div>
      )}

      {/* Rules */}
      <div className="px-4 py-1.5 space-y-0.5">
        {displayed.map((rule, i) => (
          <div key={i} className="flex items-center text-[8px] leading-[1.7]">
            <span style={{ color: 'rgba(240,239,255,0.45)', minWidth: '96px', flexShrink: 0, fontWeight: 600 }}>
              {rule.to}
            </span>
            <span style={{ color: actionColor(rule.action), minWidth: '60px', flexShrink: 0, fontWeight: 700 }}>
              {rule.action}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.38)', minWidth: '168px', flexShrink: 0 }}>
              {rule.from}
            </span>
            <span style={{ color: protoColor(rule.proto), minWidth: '48px', flexShrink: 0 }}>
              {rule.proto}
            </span>
            {rule.iface && (
              <span style={{ color: 'rgba(240,239,255,0.2)' }}>
                {rule.iface}
              </span>
            )}
          </div>
        ))}
        {allDone && (
          <div className="text-[8px] mt-0.5" style={{ color: 'rgba(74,222,128,0.3)' }}>▌</div>
        )}
      </div>

      {/* Live counters */}
      {allDone && (
        <div
          className="px-4 py-2 mt-0.5 grid grid-cols-4 gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
        >
          {COUNTERS.map((c, i) => (
            <div key={c.label} className="text-center">
              <div className="text-[9px] tabular-nums font-bold" style={{ color: i === 1 ? '#f87171' : i === 2 ? '#fbbf24' : '#4ade80' }}>
                {counters[i].toLocaleString()}
              </div>
              <div className="text-[7px] uppercase tracking-widest mt-0.5" style={{ color: 'rgba(240,239,255,0.2)' }}>
                {c.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary chips */}
      {allDone && (
        <div
          className="flex items-center gap-3 px-4 py-1.5 select-none"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
        >
          <span className="text-[8px]" style={{ color: 'rgba(74,222,128,0.6)' }}>ALLOW {allowed}</span>
          <span className="text-[8px]" style={{ color: 'rgba(248,113,113,0.6)' }}>DENY {denied}</span>
          <span className="text-[8px]" style={{ color: 'rgba(251,191,36,0.6)' }}>LIMIT {limited}</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          ufw 0.36 · iptables · netfilter
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● active' : 'loading'}
        </span>
      </div>
    </div>
  );
}
