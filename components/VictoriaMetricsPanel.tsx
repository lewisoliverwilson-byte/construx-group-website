'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'ingest' | 'query' | 'compress' | 'target' | 'alert' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# victoriametrics: high-performance drop-in Prometheus replacement' },
  { kind: 'prompt',   text: 'curl -s http://victoria-metrics:8428/metrics | grep vm_rows' },
  { kind: 'ingest',   text: '  vm_rows{type="storage/big"}      2847392810' },
  { kind: 'ingest',   text: '  vm_rows{type="storage/small"}      142837021' },
  { kind: 'ingest',   text: '  vm_data_size_bytes{type="storage"} 1437000000  (1.4 GB)' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# equivalent Prometheus would use ~28 GB — 20x compression' },
  { kind: 'prompt',   text: 'vmctl verify-block /var/lib/victoria-metrics/data/big/' },
  { kind: 'compress', text: '  blocks: 2847  compression: zstd  ratio: 21.4x' },
  { kind: 'compress', text: '  index:  roaring bitmaps  avg series/block: 1024' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# active scrape targets and ingestion rate' },
  { kind: 'prompt',   text: 'curl -s http://vmagent:8429/api/v1/targets | jq .data.activeTargets|length' },
  { kind: 'target',   text: '  342 active targets  (14 down)' },
  { kind: 'target',   text: '  ingestion: 284000 samples/s  queued: 0' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# MetricsQL query — p99 latency with gap-filling' },
  { kind: 'prompt',   text: 'vmctl query --query "keep_last_value(histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m])), 300s)"' },
  { kind: 'query',    text: '  construx-api     p99=18ms  (gaps filled: 0)' },
  { kind: 'query',    text: '  construx-worker  p99=4ms   (gaps filled: 2)' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# vmalert: recording rules and alerting' },
  { kind: 'prompt',   text: 'curl -s http://vmalert:8880/api/v1/rules | jq .data.groups[].rules|length' },
  { kind: 'alert',    text: '  24 rules evaluated  firing: 0  pending: 1' },
  { kind: 'stat',     text: '  vminsert ×3  vmselect ×3  vmstorage ×6  — cluster mode' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'ingest':   return '#4ade80';
    case 'compress': return '#67e8f9';
    case 'target':   return '#fbbf24';
    case 'query':    return '#a78bfa';
    case 'alert':    return '#fb923c';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function VictoriaMetricsPanel() {
  const [revealed,       setRevealed]       = useState(0);
  const [liveSamplesPs,  setLiveSamplesPs]  = useState(284000);
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
            setLiveSamplesPs(270000 + Math.floor(Math.random() * 30000));
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
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 81;
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
          construx@prod-eu — victoriametrics · tsdb · vmagent · vmalert
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveSamplesPs.toLocaleString()}/s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-eu# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          victoriametrics · vmagent · vmalert · MetricsQL · cluster
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>VictoriaMetrics v1.102 ·</span>
          <span style={{ color: '#4ade80' }}>{liveSamplesPs.toLocaleString()} samples/s</span>
          <span style={{ color: '#67e8f9' }}>21x compression</span>
          <span style={{ color: '#fbbf24' }}>342 targets</span>
          <span style={{ color: '#a78bfa' }}>MetricsQL</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          victoriametrics · vmagent · vmalert · MetricsQL · cluster · zstd
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● ingesting' : 'loading'}
        </span>
      </div>
    </div>
  );
}
