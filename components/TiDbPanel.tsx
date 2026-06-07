'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'schema' | 'oltp' | 'olap' | 'plan' | 'node' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# tidb: htap database — tikv row storage + tiflash columnar in one sql interface' },
  { kind: 'prompt',  text: 'mysql -h tidb.storage.svc -P 4000 -u construx -D construx' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# cluster: tikv (row/oltp) + tiflash (columnar/olap), no separate etl' },
  { kind: 'node',    text: '  pd-1       coordinator    running  region leader: true' },
  { kind: 'node',    text: '  tikv-1/2/3 row storage    running  284 GB / 500 GB each' },
  { kind: 'node',    text: '  tiflash-1  columnar store running  192 GB  lag: <1s from tikv' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# oltp write: tikv row storage via raft — standard mysql tx' },
  { kind: 'oltp',    text: '  INSERT INTO orders (user_id, total_pence) VALUES (10001, 4999)' },
  { kind: 'oltp',    text: '  affected rows: 1  time: 3.2ms  engine: tikv' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# olap query: planner routes to tiflash mpp automatically — same sql' },
  { kind: 'prompt',  text: 'SELECT date_format(created_at,"%Y-%m-%d"), count(*), sum(total_pence)/100 FROM orders WHERE created_at > now()-INTERVAL 30 DAY GROUP BY 1;' },
  { kind: 'plan',    text: '  estRows: 100M  task: mpp[tiflash]  MPP_Exchange  MPP_HashAgg  193ms' },
  { kind: 'olap',    text: '  2033-05-01  14,291  £142,918  (columnar scan — no separate pipeline)' },
  { kind: 'olap',    text: '  2033-05-02  15,847  £158,472' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# tiflash replica sync status' },
  { kind: 'schema',  text: '  orders      AVAILABLE: 1  PROGRESS: 1.0  ← fully synced to tiflash' },
  { kind: 'stat',    text: '  tikv: p99 write 8ms  tiflash: p99 olap 193ms  rows: 100M  lag: 0.4s' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'schema':  return '#a78bfa';
    case 'oltp':    return '#4ade80';
    case 'olap':    return '#67e8f9';
    case 'plan':    return '#fbbf24';
    case 'node':    return 'rgba(240,239,255,0.45)';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    default:        return 'transparent';
  }
}

export default function TiDbPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [liveRows,  setLiveRows]  = useState(100);
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
            setLiveRows(95 + Math.floor(Math.random() * 10));
          }, 2250);
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
          construx@storage — tidb · htap · tikv · tiflash · mpp · mysql-compat
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#67e8f9' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveRows}M rows` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@storage# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          tidb · htap · tikv-oltp · tiflash-olap · mpp · no-etl-pipeline
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>TiDB v7.5 ·</span>
          <span style={{ color: '#67e8f9' }}>{liveRows}M rows</span>
          <span style={{ color: '#4ade80' }}>tikv OLTP</span>
          <span style={{ color: '#fbbf24' }}>tiflash MPP</span>
          <span style={{ color: '#a78bfa' }}>HTAP</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          tidb · tikv · tiflash · htap · mpp · mysql-compatible
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#67e8f9' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● querying' : 'loading'}
        </span>
      </div>
    </div>
  );
}
