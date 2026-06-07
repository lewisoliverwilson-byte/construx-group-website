'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'vm' | 'running' | 'migrate' | 'event' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# kubevirt: virtual machines on kubernetes — live migration, cdi, virt-launcher' },
  { kind: 'prompt',   text: 'virtctl get vms -n construx-prod' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# NAME                   STATUS    NODE                     AGE    IP' },
  { kind: 'vm',       text: '  windows-build-agent-0  Running   k8s-worker-gpu-01        4d     10.0.4.12' },
  { kind: 'vm',       text: '  ubuntu-dev-sandbox     Running   k8s-worker-03            12h    10.0.4.17' },
  { kind: 'running',  text: '  rhel9-compliance-scan  Starting  k8s-worker-02            0m     pending' },
  { kind: 'migrate',  text: '  legacy-oracle-db-vm    Migrating k8s-worker-01→worker-04  2m     10.0.4.8' },
  { kind: 'blank',    text: '' },
  { kind: 'prompt',   text: 'virtctl migration-jobs -n construx-prod' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# MIGRATION                         PHASE    SOURCE          TARGET' },
  { kind: 'migrate',  text: '  kubevirt-migrate-legacy-oracle-db  Running  k8s-worker-01   k8s-worker-04' },
  { kind: 'event',    text: '  Memory copied: 82%  Network: 1.4 GB/s  ETA: ~18s  pre-copy active' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# virt-launcher pod cpu: 1.2 cores  memory: 16Gi  vmis total: 4' },
  { kind: 'metric',   text: '  vms-running: 3  vms-starting: 1  live-migrations: 1  cdi-imports: 0' },
  { kind: 'metric',   text: '  cpu-overhead: {LIVE}%  network-virt: 2.8 GB/s  uptime-max: 4d12h' },
  { kind: 'stat',     text: '  kubevirt v1.2.0  cdi v1.59.0  4 nodes  virtctl  live-migration:enabled' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'vm':       return '#4ade80';
    case 'running':  return '#fbbf24';
    case 'migrate':  return '#a78bfa';
    case 'event':    return '#67e8f9';
    case 'metric':   return 'rgba(240,239,255,0.5)';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function KubeVirtPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveCpuPct,  setLiveCpuPct]  = useState(14);
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
            setLiveCpuPct((p) => {
              const delta = Math.floor(Math.random() * 5) - 2;
              return Math.min(28, Math.max(8, p + delta));
            });
          }, 2600);
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
          construx@virt — kubevirt · vms · live-migration · cdi · virtctl
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#a78bfa' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `cpu ${liveCpuPct}%` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@virt# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          kubevirt · vms · live-migration · cdi · virt-launcher · virtctl
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => {
          const text = l.kind === 'metric'
            ? l.text.replace('{LIVE}', String(liveCpuPct))
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>KubeVirt v1.2.0 ·</span>
          <span style={{ color: '#4ade80' }}>3 VMs running</span>
          <span style={{ color: '#fbbf24' }}>1 starting</span>
          <span style={{ color: '#a78bfa' }}>1 live migration</span>
          <span style={{ color: '#67e8f9' }}>cpu {liveCpuPct}% overhead</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          kubevirt · vms · live-migration · cdi · virt-launcher · vmis
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#a78bfa' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● migrating' : 'loading'}
        </span>
      </div>
    </div>
  );
}
