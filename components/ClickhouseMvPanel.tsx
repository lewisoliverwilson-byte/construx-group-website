'use client';

import { useState, useEffect, useRef } from 'react';

interface MvRow {
  hour:      string;
  region:    string;
  orders:    number;
  totalGbp:  string;
  avgOrder:  string;
  uniqueCust: number;
}

interface InsertStat {
  label: string;
  value: string;
  color?: string;
}

const MV_ROWS: MvRow[] = [
  { hour: '2031-12-28 15:00', region: 'eu-west-2',       orders: 841,  totalGbp: '4,224.59',  avgOrder: '5.02', uniqueCust: 793 },
  { hour: '2031-12-28 15:00', region: 'us-east-1',       orders: 612,  totalGbp: '3,047.88',  avgOrder: '4.98', uniqueCust: 588 },
  { hour: '2031-12-28 15:00', region: 'ap-southeast-1',  orders: 304,  totalGbp: '1,512.96',  avgOrder: '4.98', uniqueCust: 291 },
  { hour: '2031-12-28 14:00', region: 'eu-west-2',       orders: 773,  totalGbp: '3,842.27',  avgOrder: '4.97', uniqueCust: 741 },
  { hour: '2031-12-28 14:00', region: 'us-east-1',       orders: 541,  totalGbp: '2,699.59',  avgOrder: '4.99', uniqueCust: 519 },
  { hour: '2031-12-28 13:00', region: 'eu-west-2',       orders: 698,  totalGbp: '3,502.02',  avgOrder: '5.02', uniqueCust: 672 },
];

const INSERT_STATS: InsertStat[] = [
  { label: 'insert_rate',          value: '2,295 rows/s',   color: '#4ade80' },
  { label: 'mv_update_latency',    value: '< 1ms',          color: '#4ade80' },
  { label: 'parts_active',         value: '14',             color: 'rgba(240,239,255,0.4)' },
  { label: 'parts_merged_total',   value: '3,841',          color: 'rgba(240,239,255,0.3)' },
  { label: 'compressed_bytes',     value: '2.1 GB',         color: 'rgba(240,239,255,0.4)' },
  { label: 'compression_ratio',    value: '12.4x',          color: '#fbbf24' },
];

const TOTAL = MV_ROWS.length + INSERT_STATS.length + 5;

function regionColor(r: string): string {
  if (r.startsWith('eu'))  return '#60a5fa';
  if (r.startsWith('us'))  return '#4ade80';
  return '#a78bfa';
}

export default function ClickhouseMvPanel() {
  const [revealed,   setRevealed]   = useState(0);
  const [insertRate, setInsertRate] = useState(2295);
  const [totalRows,  setTotalRows]  = useState(18241);
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
            const rate = Math.floor(2100 + Math.random() * 400);
            setInsertRate(rate);
            setTotalRows((t) => t + rate);
          }, 1900);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 84);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const allDone    = revealed > TOTAL;
  const rowStart   = 2;
  const statStart  = MV_ROWS.length + 3;
  const shownRows  = MV_ROWS.slice(0, Math.max(0, revealed - rowStart));
  const shownStats = INSERT_STATS.slice(0, Math.max(0, revealed - statStart));

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
          construx@clickhouse — materialized view query
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: '#4ade80' }}>
          {allDone ? `LIVE ${insertRate.toLocaleString()} rows/s · ${totalRows.toLocaleString()} total` : 'querying…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx :) </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          SELECT hour, region, countMerge(order_count) AS orders, sumMerge(total_cents)/100 AS total_gbp FROM orders_hourly_agg WHERE hour &gt;= now() - INTERVAL 24 HOUR GROUP BY hour, region ORDER BY hour DESC, orders DESC
        </span>
      </div>

      {/* MV query results */}
      {shownRows.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div
            className="flex items-center text-[6.5px] uppercase tracking-widest mb-0.5"
            style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '2px' }}
          >
            <span style={{ minWidth: '128px', flexShrink: 0 }}>Hour</span>
            <span style={{ minWidth: '124px', flexShrink: 0 }}>Region</span>
            <span style={{ minWidth: '56px',  flexShrink: 0 }}>Orders</span>
            <span style={{ minWidth: '80px',  flexShrink: 0 }}>Total GBP</span>
            <span style={{ minWidth: '60px',  flexShrink: 0 }}>Avg order</span>
            <span>Unique cust</span>
          </div>
          {shownRows.map((r, i) => (
            <div key={i} className="flex items-center text-[7.5px] leading-[1.85]">
              <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '128px', flexShrink: 0 }}>{r.hour}</span>
              <span style={{ color: regionColor(r.region), minWidth: '124px', flexShrink: 0 }}>{r.region}</span>
              <span style={{ color: '#4ade80', minWidth: '56px', flexShrink: 0 }}>{r.orders}</span>
              <span style={{ color: 'rgba(240,239,255,0.5)', minWidth: '80px', flexShrink: 0 }}>£{r.totalGbp}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', minWidth: '60px', flexShrink: 0 }}>£{r.avgOrder}</span>
              <span style={{ color: 'rgba(240,239,255,0.3)' }}>{r.uniqueCust}</span>
            </div>
          ))}
          {shownRows.length > 0 && (
            <div className="text-[7px] mt-1" style={{ color: 'rgba(240,239,255,0.18)' }}>
              {shownRows.length} rows in set. Elapsed: 0.003 sec.
            </div>
          )}
        </div>
      )}

      {/* Insert and MV stats */}
      {shownStats.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.18)' }}>
            AggregatingMergeTree — insert pipeline stats
          </div>
          {shownStats.map((s, i) => (
            <div key={i} className="flex items-center text-[7.5px] leading-[1.85] gap-4">
              <span style={{ color: 'rgba(240,239,255,0.28)', minWidth: '200px', flexShrink: 0 }}>{s.label}</span>
              <span style={{ color: s.color ?? 'rgba(240,239,255,0.45)' }}>{s.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>MV latency &lt; 1ms</span>
          <span style={{ color: '#fbbf24' }}>12.4x compression</span>
          <span style={{ color: '#4ade80' }}>3 regions aggregated</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          clickhouse 24.10 · aggregatingmergetree · materialized view
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● mv up to date' : 'loading'}
        </span>
      </div>
    </div>
  );
}
