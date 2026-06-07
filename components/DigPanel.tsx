'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'section' | 'record-a' | 'record-mx' | 'record-txt' | 'record-ns' | 'timing' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# dig: DNS lookup — A, MX, TXT, NS, AAAA records + authoritative trace' },
  { kind: 'prompt',   text: 'dig construx.io A +short' },
  { kind: 'record-a', text: '203.0.113.47' },
  { kind: 'record-a', text: '203.0.113.48' },
  { kind: 'blank',    text: '' },
  { kind: 'prompt',   text: 'dig construx.io MX +short' },
  { kind: 'record-mx', text: '10 mx1.construx.io.' },
  { kind: 'record-mx', text: '20 mx2.construx.io.' },
  { kind: 'blank',    text: '' },
  { kind: 'prompt',   text: 'dig construx.io TXT +short' },
  { kind: 'record-txt', text: '"v=spf1 include:_spf.google.com ip4:203.0.113.0/24 ~all"' },
  { kind: 'record-txt', text: '"v=DMARC1; p=reject; rua=mailto:dmarc@construx.io"' },
  { kind: 'record-txt', text: '"google-site-verification=a3f9b2c1d4e5f6a7b8c9"' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# Trace the authoritative path (who is responsible?)' },
  { kind: 'prompt',   text: 'dig construx.io NS +short' },
  { kind: 'record-ns', text: 'ns1.cloudflare.com.' },
  { kind: 'record-ns', text: 'ns2.cloudflare.com.' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# Query a specific resolver (1.1.1.1) and show RTT' },
  { kind: 'prompt',   text: 'dig @1.1.1.1 api.construx.io A' },
  { kind: 'section',  text: ';; ANSWER SECTION:' },
  { kind: 'record-a', text: 'api.construx.io.  60  IN  A  203.0.113.47' },
  { kind: 'section',  text: ';; SERVER: 1.1.1.1#53(1.1.1.1)' },
  { kind: 'timing',   text: ';; Query time: 8 msec   (TTL 60 — set by Cloudflare)' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':    return 'rgba(240,239,255,0.22)';
    case 'prompt':     return 'rgba(240,239,255,0.6)';
    case 'section':    return 'rgba(240,239,255,0.3)';
    case 'record-a':   return '#4ade80';
    case 'record-mx':  return '#67e8f9';
    case 'record-txt': return '#a78bfa';
    case 'record-ns':  return '#fbbf24';
    case 'timing':     return '#4ade80';
    default:           return 'transparent';
  }
}

export default function DigPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [liveRtt,   setLiveRtt]   = useState(8);
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
            setLiveRtt(4 + Math.floor(Math.random() * 18));
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
          construx@dev — dig · DNS record lookup + authoritative trace
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveRtt}ms` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@dev# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          dig · A · MX · TXT · NS · @resolver · +short · +trace
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>BIND 9.18 ·</span>
          <span style={{ color: '#4ade80' }}>A 203.0.113.47/48</span>
          <span style={{ color: '#67e8f9' }}>MX 10/20</span>
          <span style={{ color: '#a78bfa' }}>SPF+DMARC TXT</span>
          <span style={{ color: '#fbbf24' }}>{liveRtt}ms @1.1.1.1</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          BIND 9.18 · dig · A/MX/TXT/NS/AAAA · +short · @resolver · +trace
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● resolved' : 'loading'}
        </span>
      </div>
    </div>
  );
}
