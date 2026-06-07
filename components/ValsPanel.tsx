'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'resolved' | 'ref' | 'pushed' | 'warn' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# vals: secret interpolation from Vault, SSM, GCP — no plaintext in git' },
  { kind: 'prompt',   text: 'cat k8s/secrets/construx-db.yaml' },
  { kind: 'ref',      text: 'stringData:' },
  { kind: 'ref',      text: '  password:    ref+vault://secret/data/construx/db#password' },
  { kind: 'ref',      text: '  api-key:     ref+awsssm:///construx/prod/stripe-key' },
  { kind: 'ref',      text: '  redis-url:   ref+gcpsecrets://construx-project/redis-url' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# resolve references and apply to Kubernetes' },
  { kind: 'prompt',   text: 'vals eval -f k8s/secrets/construx-db.yaml | kubectl apply -f -' },
  { kind: 'resolved', text: '  ✓  resolved ref+vault://secret/data/construx/db#password' },
  { kind: 'resolved', text: '  ✓  resolved ref+awsssm:///construx/prod/stripe-key' },
  { kind: 'resolved', text: '  ✓  resolved ref+gcpsecrets://construx-project/redis-url' },
  { kind: 'stat',     text: 'secret/construx-db configured' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# vals exec: inject secrets as env vars into child process' },
  { kind: 'prompt',   text: 'vals exec -f env-secrets.yaml -- ./construx-api serve' },
  { kind: 'resolved', text: '  ✓  DATABASE_PASSWORD   resolved (32 chars)' },
  { kind: 'resolved', text: '  ✓  STRIPE_SECRET_KEY  resolved (56 chars)' },
  { kind: 'resolved', text: '  ✓  REDIS_URL          resolved (48 chars)' },
  { kind: 'stat',     text: 'server listening on :8080' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# helm upgrade with vals-interpolated values' },
  { kind: 'prompt',   text: 'vals eval -f values.yaml | helm upgrade construx-api ./charts -f -' },
  { kind: 'pushed',   text: '  ↑  construx-api  release v1.8.3 → construx-prod' },
  { kind: 'stat',     text: 'Release "construx-api" has been upgraded. Happy Helming!' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# fetch cert: retrieve public key for offline sealing' },
  { kind: 'prompt',   text: 'vals --version' },
  { kind: 'stat',     text: 'vals version 0.37.2 (go1.23, linux/amd64)' },
  { kind: 'stat',     text: 'backends: vault awsssm awssecrets gcpsecrets azurekeyvault' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'resolved': return '#4ade80';
    case 'ref':      return '#67e8f9';
    case 'pushed':   return '#fbbf24';
    case 'warn':     return '#f87171';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function ValsPanel() {
  const [revealed,   setRevealed]   = useState(0);
  const [liveRefs,   setLiveRefs]   = useState(3);
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
            setLiveRefs(Math.floor(2 + Math.random() * 4));
          }, 2200);
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
          construx@prod-01 — vals · secret interpolation · zero plaintext
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveRefs} refs` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          vals · eval · exec · Vault · SSM · GCP · Helm · no secrets in git
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>vals v0.37 ·</span>
          <span style={{ color: '#4ade80' }}>{liveRefs} refs resolved</span>
          <span style={{ color: '#67e8f9' }}>Vault · SSM · GCP</span>
          <span style={{ color: '#fbbf24' }}>Helm integrated</span>
          <span style={{ color: '#a78bfa' }}>zero plaintext</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          vals · vault · awsssm · gcpsecrets · helm · kubernetes · secrets
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● resolved' : 'loading'}
        </span>
      </div>
    </div>
  );
}
