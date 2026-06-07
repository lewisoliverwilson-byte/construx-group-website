'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'resource-create' | 'resource-update' | 'resource-delete' | 'resource-same' | 'output' | 'summary-ok' | 'summary-warn' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',         text: '# Pulumi: infrastructure as code in TypeScript, Go, Python, or Java' },
  { kind: 'prompt',          text: 'pulumi preview --stack prod' },
  { kind: 'resource-same',   text: '  construx-vpc               AWS:ec2/vpc:Vpc              no changes' },
  { kind: 'resource-same',   text: '  construx-eks-cluster        AWS:eks/cluster:Cluster      no changes' },
  { kind: 'resource-create', text: '+ construx-api-asg            AWS:autoscaling:Group        create' },
  { kind: 'resource-create', text: '+ construx-api-lt             AWS:ec2:LaunchTemplate       create' },
  { kind: 'resource-update', text: '~ construx-postgres-sg        AWS:ec2/securityGroup        update' },
  { kind: 'resource-update', text: '    [~] ingress: [0]→ add rule: port 5432 from 10.0.0.0/8' },
  { kind: 'resource-delete', text: '- construx-old-nlb            AWS:elasticloadbalancing:LB  delete' },
  { kind: 'blank',           text: '' },
  { kind: 'summary-ok',      text: 'Resources:  2 to create, 1 to update, 1 to delete, 12 unchanged' },
  { kind: 'blank',           text: '' },
  { kind: 'prompt',          text: 'pulumi up --stack prod --yes' },
  { kind: 'resource-create', text: 'Updating (prod)' },
  { kind: 'resource-same',   text: 'construx-vpc                  running...' },
  { kind: 'resource-create', text: 'construx-api-lt               created    (2s)' },
  { kind: 'resource-create', text: 'construx-api-asg              created    (28s)' },
  { kind: 'resource-update', text: 'construx-postgres-sg          updated    (1s)' },
  { kind: 'resource-delete', text: 'construx-old-nlb              deleted    (18s)' },
  { kind: 'blank',           text: '' },
  { kind: 'output',          text: 'Outputs:' },
  { kind: 'output',          text: '  api_endpoint:  "https://api.construx.io"' },
  { kind: 'output',          text: '  asg_name:      "construx-api-asg-prod-3f8a2"' },
  { kind: 'blank',           text: '' },
  { kind: 'summary-ok',      text: 'Resources: 2 created, 1 updated, 1 deleted, 12 unchanged' },
  { kind: 'summary-ok',      text: 'Duration: 51s' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':         return 'rgba(240,239,255,0.22)';
    case 'prompt':          return 'rgba(240,239,255,0.6)';
    case 'resource-create': return '#4ade80';
    case 'resource-update': return '#fbbf24';
    case 'resource-delete': return '#f87171';
    case 'resource-same':   return 'rgba(240,239,255,0.35)';
    case 'output':          return '#67e8f9';
    case 'summary-ok':      return '#4ade80';
    case 'summary-warn':    return '#fbbf24';
    default:                return 'transparent';
  }
}

export default function PulumiPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveDuration, setLiveDuration] = useState(51);
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
            setLiveDuration(40 + Math.floor(Math.random() * 25));
          }, 2000);
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
          construx@dev — pulumi up · infrastructure as code · TypeScript
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveDuration}s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@dev# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          pulumi · preview + up · AWS provider · stack outputs
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>pulumi 3.118 ·</span>
          <span style={{ color: '#4ade80' }}>2 created</span>
          <span style={{ color: '#fbbf24' }}>1 updated</span>
          <span style={{ color: '#f87171' }}>1 deleted</span>
          <span style={{ color: '#67e8f9' }}>{liveDuration}s · TypeScript</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          pulumi 3.118 · AWS provider · state in S3 · TypeScript strict
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● deployed' : 'loading'}
        </span>
      </div>
    </div>
  );
}
