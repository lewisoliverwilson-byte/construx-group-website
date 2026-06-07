'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'allow' | 'deny' | 'policy' | 'result' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# opa: Open Policy Agent — policy-as-code for authorization decisions' },
  { kind: 'prompt',  text: "opa eval -d policy.rego -i input.json 'data.construx.authz.allow'" },
  { kind: 'result',  text: '{' },
  { kind: 'allow',   text: '  "result": true' },
  { kind: 'result',  text: '}' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# evaluate with trace — show which rules fired' },
  { kind: 'prompt',  text: "opa eval -d policy.rego -i input.json 'data.construx.authz.allow' --explain full" },
  { kind: 'stat',    text: 'Enter construx.authz.allow = true' },
  { kind: 'allow',   text: '  ✓  user.role == "admin"  (input.user.role = "admin")' },
  { kind: 'allow',   text: '  ✓  data.construx.resources[input.resource].public = true' },
  { kind: 'stat',    text: 'Exit  construx.authz.allow = true' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# opa run: interactive REPL for policy development' },
  { kind: 'prompt',  text: 'opa run policy.rego' },
  { kind: 'stat',    text: 'OPA 0.68.0 (commit abc123, built 2032-11-08T00:00:00Z)' },
  { kind: 'stat',    text: 'Run "help" to see a list of commands.' },
  { kind: 'prompt',  text: '> data.construx.authz.deny' },
  { kind: 'deny',    text: '[]   (no deny rules matched — allow granted)' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# opa test: unit-test policies (TDD for authorization)' },
  { kind: 'prompt',  text: 'opa test -v policy.rego policy_test.rego' },
  { kind: 'allow',   text: 'PASS: test_admin_can_read_orders (0.3ms)' },
  { kind: 'allow',   text: 'PASS: test_viewer_cannot_delete_orders (0.1ms)' },
  { kind: 'allow',   text: 'PASS: test_expired_token_denied (0.2ms)' },
  { kind: 'deny',    text: 'FAIL: test_cross_tenant_denied — expected false, got true' },
  { kind: 'stat',    text: '3 passed, 1 failed  (4 tests, 0.8ms)' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'allow':   return '#4ade80';
    case 'deny':    return '#f87171';
    case 'policy':  return '#a78bfa';
    case 'result':  return '#67e8f9';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    default:        return 'transparent';
  }
}

export default function OpaPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveTests,   setLiveTests]   = useState(3);
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
            setLiveTests(Math.floor(2 + Math.random() * 4));
          }, 2400);
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
          construx@prod-01 — opa · policy-as-code authorization
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveTests} tests` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          opa eval · run REPL · test · Rego policy · authz decisions
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>OPA 0.68 ·</span>
          <span style={{ color: '#4ade80' }}>{liveTests} tests pass</span>
          <span style={{ color: '#f87171' }}>1 fail</span>
          <span style={{ color: '#67e8f9' }}>allow=true</span>
          <span style={{ color: '#a78bfa' }}>Rego · policy-as-code</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          opa · Rego · eval · test · Gatekeeper · RBAC · policy-as-code
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● evaluated' : 'loading'}
        </span>
      </div>
    </div>
  );
}
