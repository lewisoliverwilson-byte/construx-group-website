'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'alert-critical' | 'alert-warning' | 'alert-info' | 'rule' | 'metric' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',        text: '# Falco — kernel-level runtime security via eBPF' },
  { kind: 'prompt',         text: 'falcoctl driver install --type ebpf && falco --modern-bpf' },
  { kind: 'alert-info',     text: '2032-04-15T14:32:01.284913000+0000: Info Falco initialized, watching 31 syscalls' },
  { kind: 'blank',          text: '' },
  { kind: 'comment',        text: '# Live alert stream — rule violations from running containers' },
  { kind: 'alert-warning',  text: '14:32:14 WARN  spawned_process_in_container: construx-api spawned bash (user=root)' },
  { kind: 'alert-warning',  text: '          rule=Terminal shell in container  container=construx-api-6d9f  cmd=bash' },
  { kind: 'alert-critical', text: '14:32:31 CRIT  write_below_binary_dir: construx-worker wrote to /usr/bin (user=root)' },
  { kind: 'alert-critical', text: '          rule=Write below binary directories  container=construx-worker-4c7d  file=/usr/bin/nc' },
  { kind: 'alert-warning',  text: '14:33:02 WARN  network_tool_launched: nmap executed in construx-api  container=construx-api-6d9f' },
  { kind: 'alert-info',     text: '14:33:18 INFO  read_sensitive_file_trusted: postgres read /etc/shadow  (expected)' },
  { kind: 'blank',          text: '' },
  { kind: 'comment',        text: '# Custom Falco rule — detect S3 credential theft attempt' },
  { kind: 'rule',           text: '- rule: Attempt to access AWS credentials' },
  { kind: 'rule',           text: '  desc: Detect reading of AWS credential files in containers' },
  { kind: 'rule',           text: '  condition: >-' },
  { kind: 'rule',           text: '    open_read and container and' },
  { kind: 'rule',           text: '    (fd.name startswith "/root/.aws" or fd.name startswith "/home/.aws")' },
  { kind: 'rule',           text: '  output: >-' },
  { kind: 'rule',           text: '    AWS credential file read (user=%user.name container=%container.name file=%fd.name)' },
  { kind: 'rule',           text: '  priority: CRITICAL' },
  { kind: 'blank',          text: '' },
  { kind: 'comment',        text: '# Alert counts by rule — last 1 hour' },
  { kind: 'prompt',         text: 'falco-exporter metrics | grep falco_events' },
  { kind: 'metric',         text: 'falco_events_total{priority="CRITICAL",rule="Write below binary directories"}  2' },
  { kind: 'metric',         text: 'falco_events_total{priority="WARNING",rule="Terminal shell in container"}     14' },
  { kind: 'metric',         text: 'falco_events_total{priority="WARNING",rule="Network tool launched"}           3' },
  { kind: 'metric',         text: 'falco_events_total{priority="INFO",rule="Read sensitive file trusted"}       82' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':        return 'rgba(240,239,255,0.22)';
    case 'prompt':         return 'rgba(240,239,255,0.6)';
    case 'alert-critical': return '#f87171';
    case 'alert-warning':  return '#fbbf24';
    case 'alert-info':     return 'rgba(240,239,255,0.4)';
    case 'rule':           return '#a78bfa';
    case 'metric':         return '#fb923c';
    default:               return 'transparent';
  }
}

export default function FalcoPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveEvents,  setLiveEvents]  = useState(101);
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
            setLiveEvents((v) => v + Math.floor(Math.random() * 3));
          }, 2300);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 82;
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
          construx@prod-01 — falco · runtime security · eBPF syscall audit
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#f87171' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveEvents} events` : 'watching…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          falco --modern-bpf · runtime anomaly detection · custom rules
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => (
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
                {l.text}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Metadata */}
      {allDone && (
        <div
          className="flex items-center gap-4 flex-wrap px-4 py-1.5 text-[7.5px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Falco 0.38 · eBPF ·</span>
          <span style={{ color: '#f87171' }}>2 CRITICAL</span>
          <span style={{ color: '#fbbf24' }}>17 WARNING</span>
          <span style={{ color: '#67e8f9' }}>{liveEvents} total events/hr</span>
          <span style={{ color: '#a78bfa' }}>31 syscalls watched</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          Falco 0.38.2 · modern eBPF probe · kernel 6.8 · CNCF graduated
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● watching' : 'loading'}
        </span>
      </div>
    </div>
  );
}
