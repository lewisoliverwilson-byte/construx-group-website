'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'entry-err' | 'entry-warn' | 'entry-ok' | 'entry-info' | 'header' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',    text: '# journalctl: structured logs from systemd units, kernel, and boot' },
  { kind: 'prompt',     text: 'journalctl -u construx-api.service -n 8 --no-pager' },
  { kind: 'header',     text: '-- Journal begins at Mon 2032-05-21 00:00:01 UTC --' },
  { kind: 'entry-ok',   text: 'Jun 05 14:32:07 prod-01 construx-api[1847]: listening on :8080' },
  { kind: 'entry-ok',   text: 'Jun 05 14:32:07 prod-01 construx-api[1847]: connected to postgres at 10.0.1.4:5432' },
  { kind: 'entry-ok',   text: 'Jun 05 14:32:08 prod-01 construx-api[1847]: cache warm: 901 entries loaded' },
  { kind: 'entry-warn', text: 'Jun 05 14:39:12 prod-01 construx-api[1847]: WARN slow query 342ms: SELECT * FROM orders' },
  { kind: 'entry-warn', text: 'Jun 05 14:41:30 prod-01 construx-api[1847]: WARN ratelimit hit: cust-001 429' },
  { kind: 'entry-err',  text: 'Jun 05 14:47:03 prod-01 construx-api[1847]: ERROR postgres: connection reset by peer' },
  { kind: 'entry-ok',   text: 'Jun 05 14:47:04 prod-01 construx-api[1847]: reconnected to postgres in 312ms' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# Filter by priority: 3=err, 4=warn, 6=info' },
  { kind: 'prompt',     text: 'journalctl -u construx-api -p err..warning --since "1 hour ago"' },
  { kind: 'entry-err',  text: 'Jun 05 14:47:03 prod-01 construx-api[1847]: ERROR postgres: connection reset by peer' },
  { kind: 'entry-warn', text: 'Jun 05 14:39:12 prod-01 construx-api[1847]: WARN slow query 342ms: SELECT * FROM orders' },
  { kind: 'entry-warn', text: 'Jun 05 14:41:30 prod-01 construx-api[1847]: WARN ratelimit hit: cust-001 429' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# JSON output for structured log ingestion (Loki, Splunk, Datadog)' },
  { kind: 'prompt',     text: 'journalctl -u construx-api -o json | jq \'{ts: .__REALTIME_TIMESTAMP, msg: .MESSAGE}\'' },
  { kind: 'entry-info', text: '{"ts":"1748592727000000","msg":"listening on :8080"}' },
  { kind: 'entry-info', text: '{"ts":"1748592727100000","msg":"connected to postgres at 10.0.1.4:5432"}' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# Disk usage and log rotation' },
  { kind: 'prompt',     text: 'journalctl --disk-usage && journalctl --vacuum-size=500M' },
  { kind: 'stat',       text: 'Archived and active journals take up 1.2 GiB on disk.' },
  { kind: 'stat',       text: 'Vacuuming done, freed 732.4 MiB of archived journals.' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':    return 'rgba(240,239,255,0.22)';
    case 'prompt':     return 'rgba(240,239,255,0.6)';
    case 'entry-err':  return '#f87171';
    case 'entry-warn': return '#fbbf24';
    case 'entry-ok':   return '#4ade80';
    case 'entry-info': return '#67e8f9';
    case 'header':     return 'rgba(240,239,255,0.3)';
    case 'stat':       return '#a78bfa';
    default:           return 'transparent';
  }
}

export default function JournaldPanel() {
  const [revealed,   setRevealed]   = useState(0);
  const [liveErrors, setLiveErrors] = useState(1);
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
            setLiveErrors(Math.floor(Math.random() * 4));
          }, 1950);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 79;
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
          construx@prod-01 — journalctl · structured systemd logs
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? (liveErrors > 0 ? '#f87171' : '#4ade80') : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveErrors} err` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          journalctl · priority filter · JSON output · vacuum
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>systemd 255 ·</span>
          <span style={{ color: liveErrors > 0 ? '#f87171' : '#4ade80' }}>{liveErrors} errors this hour</span>
          <span style={{ color: '#fbbf24' }}>2 warnings</span>
          <span style={{ color: '#67e8f9' }}>JSON structured output</span>
          <span style={{ color: '#a78bfa' }}>vacuumed to 500MiB</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          systemd 255 · journald · structured · JSON · vacuum · cursor
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● watching' : 'loading'}
        </span>
      </div>
    </div>
  );
}
