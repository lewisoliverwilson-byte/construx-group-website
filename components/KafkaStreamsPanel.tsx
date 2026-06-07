'use client';

import { useState, useEffect, useRef } from 'react';

interface StreamTask {
  id:          string;
  partition:   number;
  state:       'RUNNING' | 'STANDBY' | 'SUSPENDED';
  inputTopic:  string;
  position:    string;
  lag:         number;
  processedPs: number;
}

interface StoreInfo {
  name:       string;
  type:       string;
  sizeBytes:  number;
  records:    number;
}

const TASKS: StreamTask[] = [
  { id: '0_0', partition: 0, state: 'RUNNING',  inputTopic: 'orders',   position: '0/4A2F1E08', lag: 0,    processedPs: 841 },
  { id: '0_1', partition: 1, state: 'RUNNING',  inputTopic: 'orders',   position: '1/1B8C3F20', lag: 0,    processedPs: 773 },
  { id: '0_2', partition: 2, state: 'RUNNING',  inputTopic: 'orders',   position: '2/22D4A100', lag: 2,    processedPs: 601 },
  { id: '0_3', partition: 3, state: 'STANDBY',  inputTopic: 'orders',   position: '3/0F91B2C0', lag: 14,   processedPs: 0   },
  { id: '1_0', partition: 0, state: 'RUNNING',  inputTopic: 'customers', position: '0/A3F91200', lag: 0,    processedPs: 42  },
  { id: '1_1', partition: 1, state: 'RUNNING',  inputTopic: 'customers', position: '1/B2E84400', lag: 0,    processedPs: 38  },
];

const STORES: StoreInfo[] = [
  { name: 'order-counts-store',  type: 'InMemoryKeyValueStore', sizeBytes: 2_097_152,  records: 18241 },
  { name: 'customer-table',      type: 'RocksDB',               sizeBytes: 52_428_800, records: 94012 },
  { name: 'order-window-store',  type: 'RocksDB (windowed)',    sizeBytes: 8_388_608,  records: 4401  },
];

const TOTAL = TASKS.length + STORES.length + 5;

function stateColor(s: StreamTask['state']): string {
  if (s === 'RUNNING')   return '#4ade80';
  if (s === 'STANDBY')   return '#fbbf24';
  return 'rgba(240,239,255,0.25)';
}

function lagColor(lag: number): string {
  if (lag === 0)   return '#4ade80';
  if (lag < 100)   return '#fbbf24';
  return '#f87171';
}

function fmtBytes(b: number): string {
  if (b >= 1_048_576) return `${(b / 1_048_576).toFixed(1)}MB`;
  return `${(b / 1024).toFixed(0)}KB`;
}

export default function KafkaStreamsPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [totalPs,     setTotalPs]     = useState(2295);
  const [consumerLag, setConsumerLag] = useState(16);
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
            setTotalPs(Math.floor(2100 + Math.random() * 400));
            setConsumerLag(Math.floor(Math.random() * 5));
          }, 1950);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 83);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const allDone      = revealed > TOTAL;
  const taskStart    = 2;
  const storeStart   = TASKS.length + 3;
  const shownTasks   = TASKS.slice(0, Math.max(0, revealed - taskStart));
  const shownStores  = STORES.slice(0, Math.max(0, revealed - storeStart));

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
          construx@streams — kafka streams topology
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: consumerLag === 0 ? '#4ade80' : '#fbbf24' }}>
          {allDone ? `LIVE ${totalPs.toLocaleString()} rec/s · lag ${consumerLag}` : 'querying…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@streams$ </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          kafka-streams-describe --app order-enrichment --bootstrap-server kafka:9092
        </span>
      </div>

      {/* Tasks */}
      {shownTasks.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.18)' }}>
            Stream tasks — 4 partitions · application: order-enrichment
          </div>
          <div
            className="flex items-center text-[6.5px] uppercase tracking-widest mb-0.5"
            style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '2px' }}
          >
            <span style={{ minWidth: '40px', flexShrink: 0 }}>Task</span>
            <span style={{ minWidth: '70px', flexShrink: 0 }}>State</span>
            <span style={{ minWidth: '100px', flexShrink: 0 }}>Input topic</span>
            <span style={{ minWidth: '100px', flexShrink: 0 }}>Position</span>
            <span style={{ minWidth: '48px', flexShrink: 0 }}>Lag</span>
            <span>Rec/s</span>
          </div>
          {shownTasks.map((t) => (
            <div key={t.id} className="flex items-center text-[7.5px] leading-[1.85]">
              <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '40px', flexShrink: 0 }}>{t.id}</span>
              <span style={{ color: stateColor(t.state), minWidth: '70px', flexShrink: 0, fontSize: '7px' }}>{t.state}</span>
              <span style={{ color: 'rgba(240,239,255,0.4)', minWidth: '100px', flexShrink: 0 }}>{t.inputTopic}</span>
              <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '100px', flexShrink: 0, fontFamily: 'monospace' }}>{t.position}</span>
              <span style={{ color: lagColor(t.lag), minWidth: '48px', flexShrink: 0 }}>{t.lag}</span>
              <span style={{ color: t.state === 'RUNNING' ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>{t.processedPs > 0 ? `${t.processedPs}` : '—'}</span>
            </div>
          ))}
        </div>
      )}

      {/* State stores */}
      {shownStores.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.18)' }}>
            State stores
          </div>
          <div
            className="flex items-center text-[6.5px] uppercase tracking-widest mb-0.5"
            style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '2px' }}
          >
            <span style={{ minWidth: '180px', flexShrink: 0 }}>Name</span>
            <span style={{ minWidth: '140px', flexShrink: 0 }}>Type</span>
            <span style={{ minWidth: '64px', flexShrink: 0 }}>Size</span>
            <span>Records</span>
          </div>
          {shownStores.map((s) => (
            <div key={s.name} className="flex items-center text-[7.5px] leading-[1.85]">
              <span style={{ color: 'rgba(240,239,255,0.5)', minWidth: '180px', flexShrink: 0 }}>{s.name}</span>
              <span style={{ color: 'rgba(240,239,255,0.28)', minWidth: '140px', flexShrink: 0 }}>{s.type}</span>
              <span style={{ color: '#fbbf24', minWidth: '64px', flexShrink: 0 }}>{fmtBytes(s.sizeBytes)}</span>
              <span style={{ color: 'rgba(240,239,255,0.4)' }}>{s.records.toLocaleString()}</span>
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
          <span style={{ color: '#4ade80' }}>5 tasks running</span>
          <span style={{ color: '#fbbf24' }}>1 standby (partition 3)</span>
          <span style={{ color: '#4ade80' }}>consumer lag 0</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          kafka streams 3.9 · rocksdb state · exactly-once semantics
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● topology healthy' : 'loading'}
        </span>
      </div>
    </div>
  );
}
