'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'event-net' | 'event-fs' | 'event-proc' | 'event-warn' | 'stat' | 'filter' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',    text: '# sysdig: system-level syscall tracing for containers and processes' },
  { kind: 'prompt',     text: 'sysdig -c topprocs_net' },
  { kind: 'stat',       text: 'Bytes/s  Process         PID     Fd   Proto' },
  { kind: 'event-net',  text: '48.2 MB  construx-api    1847    12   tcp:0.0.0.0:8080→10.0.1.100:42871' },
  { kind: 'event-net',  text: '12.4 MB  postgres        3241    28   tcp:127.0.0.1:5432→127.0.0.1:41982' },
  { kind: 'event-net',  text: ' 3.1 MB  construx-worker 2198    6    tcp:0.0.0.0:9090→10.0.1.101:51234' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# Filter: only construx-api, only network events' },
  { kind: 'prompt',     text: 'sysdig -p "%proc.name %evt.type %fd.name" proc.name=construx-api and evt.is_io=true' },
  { kind: 'filter',     text: 'construx-api  read   10.0.1.100:42871->0.0.0.0:8080' },
  { kind: 'event-net',  text: 'construx-api  write  10.0.1.100:42871->0.0.0.0:8080 (2.4KB response)' },
  { kind: 'filter',     text: 'construx-api  read   127.0.0.1:41982->127.0.0.1:5432 (query)' },
  { kind: 'event-fs',   text: 'construx-api  openat /etc/construx/config.yaml' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# Detect sensitive file access in any container' },
  { kind: 'prompt',     text: 'sysdig evt.type=openat and fd.name contains "/etc/passwd" or fd.name contains "/.ssh"' },
  { kind: 'event-warn', text: 'WARNING: construx-worker[2198] opened /etc/passwd (unexpected)' },
  { kind: 'event-warn', text: 'WARNING: unknown[8821] opened /root/.ssh/id_rsa  — pid 8821 is not in known list' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# Container-aware: see which pod/container generated each syscall' },
  { kind: 'prompt',     text: 'sysdig -p "%container.name %proc.name %evt.type %fd.name" container.name!=host' },
  { kind: 'event-proc', text: 'construx-api    construx-api  connect  10.0.1.4:5432' },
  { kind: 'event-proc', text: 'construx-worker node          execve   /usr/bin/node' },
  { kind: 'event-proc', text: 'sidecar-envoy   envoy         read     /etc/envoy/envoy.yaml' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# Capture to file and replay offline' },
  { kind: 'prompt',     text: 'sysdig -w /tmp/construx-incident.scap proc.name=construx-api' },
  { kind: 'stat',       text: '38241 events captured to /tmp/construx-incident.scap (14.8 MB)' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':    return 'rgba(240,239,255,0.22)';
    case 'prompt':     return 'rgba(240,239,255,0.6)';
    case 'event-net':  return '#67e8f9';
    case 'event-fs':   return '#a78bfa';
    case 'event-proc': return '#4ade80';
    case 'event-warn': return '#f87171';
    case 'stat':       return 'rgba(240,239,255,0.45)';
    case 'filter':     return '#fbbf24';
    default:           return 'transparent';
  }
}

export default function SysdigPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveEvtps,  setLiveEvtps]   = useState(38241);
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
            setLiveEvtps(32000 + Math.floor(Math.random() * 10000));
          }, 2050);
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
          construx@prod-01 — sysdig · syscall tracing · container-aware
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveEvtps.toLocaleString()} evt/s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          sysdig · chisel filters · container-aware · .scap capture
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>sysdig 0.37 ·</span>
          <span style={{ color: '#67e8f9' }}>net I/O traced</span>
          <span style={{ color: '#f87171' }}>2 sensitive file alerts</span>
          <span style={{ color: '#4ade80' }}>{liveEvtps.toLocaleString()} evt/s</span>
          <span style={{ color: '#a78bfa' }}>container-aware</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          sysdig 0.37 · eBPF driver · chisel filters · .scap capture + replay
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● tracing' : 'loading'}
        </span>
      </div>
    </div>
  );
}
