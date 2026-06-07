'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'record' | 'sync' | 'source' | 'provider' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# external-dns: k8s → route53/cloudflare — auto dns from ingress/service' },
  { kind: 'prompt',   text: 'kubectl logs -n external-dns deploy/external-dns --tail=20' },
  { kind: 'blank',    text: '' },
  { kind: 'sync',     text: '  time="08:14:22" msg="Desired change: CREATE api.construx.io A [1.2.3.4]"' },
  { kind: 'sync',     text: '  time="08:14:22" msg="Desired change: CREATE api.construx.io TXT"' },
  { kind: 'sync',     text: '  time="08:14:23" msg="2 record(s) in zone construx.io were successfully updated"' },
  { kind: 'blank',    text: '' },
  { kind: 'record',   text: '  api.construx.io          A    1.2.3.4   TTL: 300s   source: Ingress' },
  { kind: 'record',   text: '  grpc.construx.io         A    1.2.3.4   TTL: 300s   source: Service/LB' },
  { kind: 'record',   text: '  staging.construx.io      A    5.6.7.8   TTL: 60s    source: Ingress' },
  { kind: 'blank',    text: '' },
  { kind: 'source',   text: '  sources: [ingress, service]  annotation: external-dns.alpha.kubernetes.io' },
  { kind: 'provider', text: '  provider: aws/route53  zoneType: public  interval: 1m  policy: sync' },
  { kind: 'metric',   text: '  managed-records: {LIVE}  last-sync: 42s ago  sync-errors: 0' },
  { kind: 'stat',     text: '  external-dns v0.14.2  route53  txt-ownership  dry-run: false' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'record':   return '#4ade80';
    case 'sync':     return '#67e8f9';
    case 'source':   return '#a78bfa';
    case 'provider': return '#fbbf24';
    case 'metric':   return 'rgba(240,239,255,0.5)';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function ExternalDnsPanel() {
  const [revealed,        setRevealed]        = useState(0);
  const [managedRecords,  setManagedRecords]  = useState(31);
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
            setManagedRecords((c) => c + (Math.random() > 0.8 ? 1 : 0));
          }, 8000);
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
          construx@external-dns — route53 · ingress · service · txt-ownership · sync
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${managedRecords} records` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@external-dns# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          external-dns · route53 · ingress · service · txt-ownership · sync · create
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => {
          const text = l.kind === 'metric'
            ? l.text.replace('{LIVE}', String(managedRecords))
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>ExternalDNS v0.14.2 ·</span>
          <span style={{ color: '#4ade80' }}>{managedRecords} records</span>
          <span style={{ color: '#67e8f9' }}>Route53</span>
          <span style={{ color: '#a78bfa' }}>TXT ownership</span>
          <span style={{ color: '#fbbf24' }}>1m sync</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          external-dns · route53 · ingress · service · txt-ownership · sync
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● in sync' : 'loading'}
        </span>
      </div>
    </div>
  );
}
