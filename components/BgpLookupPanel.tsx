'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'header' | 'route' | 'attr' | 'peer-up' | 'peer-down' | 'summary' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# BGP routing table — construx border router (AS64512)' },
  { kind: 'prompt',   text: 'birdc show protocols all' },
  { kind: 'header',   text: 'Name       Proto   Table   State   Since        Info' },
  { kind: 'peer-up',  text: 'upstream1  BGP     ---     up      2032-02-14   Established' },
  { kind: 'attr',     text: '  Description: Lumen Technologies (AS3356)' },
  { kind: 'attr',     text: '  BGP state: Established, up 18d 04:12:33' },
  { kind: 'attr',     text: '  Neighbor address: 185.229.168.1 · AS: 3356' },
  { kind: 'attr',     text: '  IPv4: 142 imported, 4 exported, 142 preferred' },
  { kind: 'peer-up',  text: 'upstream2  BGP     ---     up      2032-02-19   Established' },
  { kind: 'attr',     text: '  Description: Cloudflare Transit (AS13335)' },
  { kind: 'attr',     text: '  BGP state: Established, up 13d 22:08:01' },
  { kind: 'attr',     text: '  Neighbor address: 172.70.32.1 · AS: 13335' },
  { kind: 'attr',     text: '  IPv4: 98 imported, 4 exported, 61 preferred' },
  { kind: 'peer-down', text: 'peer_hk    BGP     ---     idle    2032-03-01   Active' },
  { kind: 'attr',     text: '  Description: HK PoP peer (AS4134) — handshake timeout' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# Best path for construx.io /24 prefix' },
  { kind: 'prompt',   text: 'birdc show route for 203.0.113.0/24 all' },
  { kind: 'route',    text: '203.0.113.0/24    unicast [upstream1 2032-02-14] * (100/20) [AS64512i]' },
  { kind: 'attr',     text: '  AS path: 3356 1299 6939 64512 I' },
  { kind: 'attr',     text: '  Next hop: 185.229.168.1 on eth0' },
  { kind: 'attr',     text: '  Communities: 3356:2 3356:22 3356:100 3356:123 64512:10' },
  { kind: 'attr',     text: '  Local pref: 100 · MED: 20 · Weight: 0' },
  { kind: 'route',    text: '203.0.113.0/24    unicast [upstream2 2032-02-19] (90/0) [AS64512i]' },
  { kind: 'attr',     text: '  AS path: 13335 64512 I' },
  { kind: 'attr',     text: '  Next hop: 172.70.32.1 on eth1' },
  { kind: 'attr',     text: '  Communities: 13335:19020 13335:20050 64512:20' },
  { kind: 'attr',     text: '  Local pref: 90 · MED: 0 · Weight: 0' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# Route summary across all peers' },
  { kind: 'prompt',   text: 'birdc show route summary' },
  { kind: 'summary',  text: 'Table master4: 240 routes in 8 tables, 240 destinations' },
  { kind: 'summary',  text: '  upstream1: 142 routes (142 active, 0 filtered)' },
  { kind: 'summary',  text: '  upstream2:  98 routes (61 active, 37 filtered)' },
  { kind: 'summary',  text: '  static:      4 routes (4 active, 0 filtered)' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':   return 'rgba(240,239,255,0.22)';
    case 'prompt':    return 'rgba(240,239,255,0.6)';
    case 'header':    return 'rgba(240,239,255,0.35)';
    case 'route':     return '#67e8f9';
    case 'attr':      return '#fbbf24';
    case 'peer-up':   return '#4ade80';
    case 'peer-down': return '#f87171';
    case 'summary':   return '#a78bfa';
    default:          return 'transparent';
  }
}

export default function BgpLookupPanel() {
  const [revealed,     setRevealed]     = useState(0);
  const [liveRxRoutes, setLiveRxRoutes] = useState(240);
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
            setLiveRxRoutes(238 + Math.floor(Math.random() * 5));
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
          construx@border-01 — birdc · AS64512 · BGP peers
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveRxRoutes} routes` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@border-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          birdc show protocols · show route · AS64512 dual-upstream
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>BIRD 2.15 ·</span>
          <span style={{ color: '#4ade80' }}>2 peers established</span>
          <span style={{ color: '#f87171' }}>1 peer idle</span>
          <span style={{ color: '#67e8f9' }}>{liveRxRoutes} routes active</span>
          <span style={{ color: '#a78bfa' }}>dual-stack IPv4/IPv6</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          BIRD 2.15.1 · BGPv4 · RFC 4271 · AS64512 private
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● routing' : 'loading'}
        </span>
      </div>
    </div>
  );
}
