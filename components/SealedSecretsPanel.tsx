'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'sealed' | 'cert' | 'decrypt' | 'gitops' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# sealed-secrets: bitnami — kubeseal, gitops-safe secret encryption' },
  { kind: 'prompt',   text: 'kubeseal --fetch-cert --controller-name=sealed-secrets -n kube-system' },
  { kind: 'blank',    text: '' },
  { kind: 'cert',     text: '  cert: construx-sealing-cert  age: 32d  rotates: every 30d' },
  { kind: 'cert',     text: '  fingerprint: SHA256:7f3a...e9c2  algorithm: RSA-4096' },
  { kind: 'blank',    text: '' },
  { kind: 'prompt',   text: 'kubeseal --format=yaml < secret.yaml > sealed-secret.yaml && cat' },
  { kind: 'blank',    text: '' },
  { kind: 'sealed',   text: '  apiVersion: bitnami.com/v1alpha1  kind: SealedSecret' },
  { kind: 'sealed',   text: '  encryptedData.STRIPE_KEY: AgBy8hmkLz...XqR3  (RSA-OAEP)' },
  { kind: 'sealed',   text: '  encryptedData.DB_PASSWORD: AgCwVqp9nk...Zm4f  (RSA-OAEP)' },
  { kind: 'decrypt',  text: '  controller: decrypted → Secret/orders-api-secrets  status: ✔' },
  { kind: 'gitops',   text: '  safe to commit: sealed-secrets.yaml  plaintext never in git' },
  { kind: 'metric',   text: '  sealed-secrets: {LIVE}  unseal-errors: 0  cert-age: 32d' },
  { kind: 'stat',     text: '  sealed-secrets v0.27.1  rsa-4096  cluster-scoped  flux-compatible' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'cert':     return '#67e8f9';
    case 'sealed':   return '#a78bfa';
    case 'decrypt':  return '#4ade80';
    case 'gitops':   return '#fbbf24';
    case 'metric':   return 'rgba(240,239,255,0.5)';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function SealedSecretsPanel() {
  const [revealed,       setRevealed]       = useState(0);
  const [sealedCount,    setSealedCount]    = useState(47);
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
            setSealedCount((c) => c + (Math.random() > 0.8 ? 1 : 0));
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
          construx@sealed-secrets — kubeseal · rsa-4096 · gitops · flux · argocd
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${sealedCount} sealed` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sealed-secrets# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          sealed-secrets · kubeseal · rsa-4096 · gitops · cert-rotation · flux
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => {
          const text = l.kind === 'metric'
            ? l.text.replace('{LIVE}', String(sealedCount))
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Sealed Secrets v0.27.1 ·</span>
          <span style={{ color: '#4ade80' }}>{sealedCount} secrets</span>
          <span style={{ color: '#67e8f9' }}>RSA-4096</span>
          <span style={{ color: '#fbbf24' }}>GitOps-safe</span>
          <span style={{ color: '#a78bfa' }}>0 errors</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          sealed-secrets · kubeseal · rsa-4096 · gitops · flux · argocd
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● sealed' : 'loading'}
        </span>
      </div>
    </div>
  );
}
