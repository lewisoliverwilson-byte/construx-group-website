'use client';

import { useState, useEffect, useRef } from 'react';

interface Commit {
  hash:       string;
  author:     string;
  date:       string;
  message:    string;
  sigStatus:  'good' | 'expired' | 'no-key';
  keyId:      string;
  fingerprint: string;
}

const COMMITS: Commit[] = [
  {
    hash:        'a050b87',
    author:      'Lewis Wilson',
    date:        'Sat Aug 21 09:14:22 2031 +0000',
    message:     'feat: GrpcCallPanel on contact page; dispatches 812-814',
    sigStatus:   'good',
    keyId:       '3AA5C34371567BD2',
    fingerprint: '4096R/3AA5C34371567BD2 2029-01-04',
  },
  {
    hash:        '74a037a',
    author:      'Lewis Wilson',
    date:        'Fri Aug 20 22:31:07 2031 +0000',
    message:     'feat: JaegerTracePanel on stats page; dispatches 815-817',
    sigStatus:   'good',
    keyId:       '3AA5C34371567BD2',
    fingerprint: '4096R/3AA5C34371567BD2 2029-01-04',
  },
  {
    hash:        'c93d281',
    author:      'Lewis Wilson',
    date:        'Thu Aug 19 17:55:44 2031 +0000',
    message:     'feat: TurboRepoPanel on uses page; dispatches 809-811',
    sigStatus:   'good',
    keyId:       '3AA5C34371567BD2',
    fingerprint: '4096R/3AA5C34371567BD2 2029-01-04',
  },
  {
    hash:        'd2e6eed',
    author:      'Lewis Wilson',
    date:        'Wed Aug 18 11:20:16 2031 +0000',
    message:     'feat: SbomPanel on journal page; dispatches 806-808',
    sigStatus:   'good',
    keyId:       '3AA5C34371567BD2',
    fingerprint: '4096R/3AA5C34371567BD2 2029-01-04',
  },
  {
    hash:        '1bfdc66',
    author:      'Lewis Wilson',
    date:        'Mon Aug 16 08:44:52 2031 +0000',
    message:     'feat: GhActionsRunPanel on work-with-us; dispatches 803-805',
    sigStatus:   'good',
    keyId:       '3AA5C34371567BD2',
    fingerprint: '4096R/3AA5C34371567BD2 2029-01-04',
  },
];

type RevealLine =
  | { type: 'commit-hash'; commit: Commit }
  | { type: 'author'; commit: Commit }
  | { type: 'date'; commit: Commit }
  | { type: 'sig-status'; commit: Commit }
  | { type: 'sig-key'; commit: Commit }
  | { type: 'message'; commit: Commit }
  | { type: 'blank' };

const LINES: RevealLine[] = COMMITS.flatMap((commit) => [
  { type: 'commit-hash' as const, commit },
  { type: 'author'      as const, commit },
  { type: 'date'        as const, commit },
  { type: 'sig-status'  as const, commit },
  { type: 'sig-key'     as const, commit },
  { type: 'message'     as const, commit },
  { type: 'blank'       as const },
]);

const TOTAL = LINES.length;

function sigColor(s: Commit['sigStatus']): string {
  if (s === 'good')    return '#4ade80';
  if (s === 'expired') return '#fbbf24';
  return '#f87171';
}

function sigLabel(s: Commit['sigStatus']): string {
  if (s === 'good')    return 'gpg: Good signature from "Lewis Wilson <lewis@construxgroup.io>"';
  if (s === 'expired') return 'gpg: WARNING: This key has expired!';
  return 'gpg: Can\'t check signature: No public key';
}

export default function GitSignPanel() {
  const [revealed, setRevealed] = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const line  = LINES[revealed - 1];
    const delay = line.type === 'blank' ? 35 : 80;
    const id = setTimeout(() => setRevealed((r) => r + 1), delay);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone    = revealed > TOTAL;
  const shownLines = LINES.slice(0, Math.min(LINES.length, revealed));

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
          construx@dev-macbook — git log --show-signature
        </span>
        <span className="text-[8px]" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `● ${COMMITS.length} verified` : 'verifying…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@dev-macbook:~/construx-group-website$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          git log --show-signature -5
        </span>
      </div>

      {/* Lines */}
      <div className="px-4 py-2">
        {shownLines.map((line, i) => {
          if (line.type === 'blank') return <div key={i} className="h-2" />;

          const { commit } = line;

          if (line.type === 'commit-hash') return (
            <div key={i} className="text-[7.5px] leading-[1.8]">
              <span style={{ color: '#fbbf24', fontWeight: 600 }}>commit </span>
              <span style={{ color: '#fbbf24' }}>{commit.hash}</span>
            </div>
          );

          if (line.type === 'author') return (
            <div key={i} className="text-[7.5px] leading-[1.8]">
              <span style={{ color: 'rgba(240,239,255,0.35)' }}>Author: </span>
              <span style={{ color: 'rgba(240,239,255,0.6)' }}>{commit.author} &lt;lewis@construxgroup.io&gt;</span>
            </div>
          );

          if (line.type === 'date') return (
            <div key={i} className="text-[7.5px] leading-[1.8]">
              <span style={{ color: 'rgba(240,239,255,0.35)' }}>Date:   </span>
              <span style={{ color: 'rgba(240,239,255,0.4)' }}>{commit.date}</span>
            </div>
          );

          if (line.type === 'sig-status') return (
            <div key={i} className="text-[7.5px] leading-[1.8]">
              <span style={{ color: sigColor(commit.sigStatus) }}>{sigLabel(commit.sigStatus)}</span>
            </div>
          );

          if (line.type === 'sig-key') return (
            <div key={i} className="text-[7.5px] leading-[1.8]">
              <span style={{ color: 'rgba(240,239,255,0.22)' }}>
                Primary key fingerprint: {commit.fingerprint}
              </span>
            </div>
          );

          if (line.type === 'message') return (
            <div key={i} className="text-[7.5px] leading-[1.8] mt-0.5">
              <span style={{ color: 'rgba(240,239,255,0.55)' }}>    {commit.message}</span>
            </div>
          );

          return null;
        })}

        {!allDone && revealed > 0 && (
          <div className="flex items-center gap-1 mt-1 text-[7.5px]" style={{ color: 'rgba(74,222,128,0.4)' }}>
            <span>verifying signature</span>
            <span style={{ animation: 'pulse 1s infinite' }}>…</span>
          </div>
        )}
      </div>

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>{COMMITS.filter((c) => c.sigStatus === 'good').length} good signatures</span>
          <span>key 3AA5C34371567BD2</span>
          <span>4096-bit RSA · Ed25519</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          gpg 2.4.6 · git 2.47.0 · commit.gpgsign=true
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? `● all verified` : 'loading'}
        </span>
      </div>
    </div>
  );
}
