'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'constraint' | 'violation' | 'audit' | 'template' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',    text: '# opa gatekeeper: k8s admission control — constraints, violations, audit' },
  { kind: 'prompt',     text: 'kubectl get constraints -A' },
  { kind: 'blank',      text: '' },
  { kind: 'constraint', text: '  RequireResourceLimits     enforced   violations: 0   total: 142' },
  { kind: 'constraint', text: '  DisallowPrivileged        enforced   violations: 0   total: 38' },
  { kind: 'constraint', text: '  RequireLabels             warn       violations: 4   total: 89' },
  { kind: 'constraint', text: '  AllowedRegistries         enforced   violations: 0   total: 142' },
  { kind: 'blank',      text: '' },
  { kind: 'prompt',     text: 'kubectl describe constrainttemplate requireresourcelimits' },
  { kind: 'blank',      text: '' },
  { kind: 'template',   text: '  rego: containers must specify resources.limits.cpu and .memory' },
  { kind: 'template',   text: '  targets: admission.k8s.gatekeeper.sh  enforcementAction: deny' },
  { kind: 'violation',  text: '  audit-result: 0 violations in construx-prod (last: 2m ago)' },
  { kind: 'audit',      text: '  audit-interval: 60s  total-constraints: 9  exemptions: 2 namespaces' },
  { kind: 'metric',     text: '  denied-today: {LIVE}  warned: 12  passed: 2847  audit-age: 45s' },
  { kind: 'stat',       text: '  gatekeeper v3.17.1  opa v0.68.0  webhooks: 2  audit-pods: 2' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':    return 'rgba(240,239,255,0.22)';
    case 'prompt':     return 'rgba(240,239,255,0.6)';
    case 'constraint': return '#4ade80';
    case 'violation':  return '#fbbf24';
    case 'audit':      return '#67e8f9';
    case 'template':   return '#a78bfa';
    case 'metric':     return 'rgba(240,239,255,0.5)';
    case 'stat':       return 'rgba(240,239,255,0.45)';
    default:           return 'transparent';
  }
}

export default function GatekeeperPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [deniedToday, setDeniedToday] = useState(7);
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
            setDeniedToday((c) => c + (Math.random() > 0.7 ? 1 : 0));
          }, 6000);
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
          construx@gatekeeper — opa · constraints · audit · violations · admission
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${deniedToday} denied` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@gatekeeper# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          gatekeeper · opa · constraints · templates · audit · violations · admission
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => {
          const text = l.kind === 'metric'
            ? l.text.replace('{LIVE}', String(deniedToday))
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Gatekeeper v3.17.1 ·</span>
          <span style={{ color: '#f87171' }}>{deniedToday} denied today</span>
          <span style={{ color: '#4ade80' }}>0 violations</span>
          <span style={{ color: '#a78bfa' }}>9 constraints</span>
          <span style={{ color: '#67e8f9' }}>audit 60s</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          gatekeeper · opa · constraints · templates · audit · admission
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● enforcing' : 'loading'}
        </span>
      </div>
    </div>
  );
}
