'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'service' | 'node' | 'upgrade' | 'event' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# talos linux: immutable kubernetes os — no ssh, no shell, api-driven' },
  { kind: 'prompt',   text: 'talosctl service --nodes 10.0.0.11' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# SERVICE     STATE    HEALTH   SINCE' },
  { kind: 'service',  text: '  apid         Running  OK       4d12h10m' },
  { kind: 'service',  text: '  containerd   Running  OK       4d12h10m' },
  { kind: 'service',  text: '  etcd         Running  OK       4d12h08m' },
  { kind: 'service',  text: '  kubelet      Running  OK       4d12h05m' },
  { kind: 'service',  text: '  machined     Running  OK       4d12h12m' },
  { kind: 'blank',    text: '' },
  { kind: 'prompt',   text: 'talosctl get members' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# NODE        ROLE           TALOS    KUBERNETES  STATUS' },
  { kind: 'node',     text: '  10.0.0.11   control-plane  v1.7.5   v1.31.2     Ready' },
  { kind: 'node',     text: '  10.0.0.12   control-plane  v1.7.5   v1.31.2     Ready' },
  { kind: 'node',     text: '  10.0.0.13   control-plane  v1.7.5   v1.31.2     Ready' },
  { kind: 'upgrade',  text: '  10.0.0.21   worker         v1.7.4→v1.7.5  upgrading  Cordoned' },
  { kind: 'blank',    text: '' },
  { kind: 'event',    text: '  upgrade: writing partition B  image: talos:v1.7.5  progress: 92%' },
  { kind: 'metric',   text: '  nodes: 7  api-only  no-ssh  immutable  uptime-max: {LIVE}d' },
  { kind: 'stat',     text: '  talos v1.7.5  kubernetes v1.31.2  cilium-cni  no-iptables  xfs' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'service':  return '#4ade80';
    case 'node':     return '#67e8f9';
    case 'upgrade':  return '#a78bfa';
    case 'event':    return '#fbbf24';
    case 'metric':   return 'rgba(240,239,255,0.5)';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function TalosPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [liveUptime, setLiveUptime] = useState(4);
  const ref      = useRef<HTMLDivElement>(null);
  const started  = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
          timerRef.current = setInterval(() => {
            setLiveUptime((d) => d + (Math.random() > 0.7 ? 1 : 0));
          }, 3200);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 80;
    const id = setTimeout(() => setRevealed((r) => r + 1), delay);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const allDone    = revealed > TOTAL;
  const shownLines = LINES.slice(0, Math.max(0, revealed - 1));

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
          construx@os — talos · immutable · api-driven · no-ssh · upgrade
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#67e8f9' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveUptime}d up` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@talos# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          talosctl · immutable · no-ssh · api-only · upgrade · machine-config
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => {
          const text = l.kind === 'metric'
            ? l.text.replace('{LIVE}', String(liveUptime))
            : l.text;
          return (
            <div
              key={i}
              className="text-[7.5px] leading-[1.8]"
              style={{ color: lineColor(l.kind) }}
            >
              {l.kind === 'blank' ? ' ' : (
                <>
                  {l.kind === 'prompt' && (
                    <span style={{ color: 'rgba(74,222,128,0.45)', marginRight: '6px' }}>$</span>
                  )}
                  {text}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Metadata */}
      {allDone && (
        <div
          className="flex items-center gap-4 flex-wrap px-4 py-1.5 text-[7.5px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Talos v1.7.5 ·</span>
          <span style={{ color: '#4ade80' }}>5 services running</span>
          <span style={{ color: '#67e8f9' }}>3 nodes ready</span>
          <span style={{ color: '#a78bfa' }}>1 upgrading</span>
          <span style={{ color: '#fbbf24' }}>partition write 92%</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          talos · immutable · no-ssh · api-driven · atomic-upgrade · raft
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#a78bfa' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● upgrading' : 'loading'}
        </span>
      </div>
    </div>
  );
}
