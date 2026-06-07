'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind =
  | 'prompt'
  | 'comment'
  | 'build-step'
  | 'build-ok'
  | 'build-warn'
  | 'size'
  | 'wit-type'
  | 'wit-func'
  | 'compose-step'
  | 'compose-ok'
  | 'run-output'
  | 'blank';

interface WasmLine {
  kind:  LineKind;
  text:  string;
  delay?: number;
}

const LINES: WasmLine[] = [
  { kind: 'prompt',       text: 'lewis@construx:~/orders-component$ cargo build --target wasm32-wasip1 --release' },
  { kind: 'build-step',   text: '   Compiling orders v1.4.2 (/home/lewis/orders-component)' },
  { kind: 'build-step',   text: '   Compiling wit-bindgen-rt v0.36.0' },
  { kind: 'build-ok',     text: '    Finished `release` profile [optimised + debuginfo] target(s) in 4.28s' },
  { kind: 'blank',        text: '' },
  { kind: 'prompt',       text: 'lewis@construx:~/orders-component$ wasm-tools component new target/wasm32-wasip1/release/orders.wasm -o orders-component.wasm' },
  { kind: 'size',         text: '  → orders-component.wasm  (284 KB)' },
  { kind: 'blank',        text: '' },
  { kind: 'prompt',       text: 'lewis@construx:~/orders-component$ wasm-tools component wit orders-component.wasm' },
  { kind: 'wit-type',     text: 'package construx:orders@1.0.0;' },
  { kind: 'blank',        text: '' },
  { kind: 'wit-type',     text: 'interface order-service {' },
  { kind: 'wit-func',     text: '  create-order: func(customer-id: string, total-cents: u64) -> result<order, order-error>;' },
  { kind: 'wit-func',     text: '  get-order:    func(id: string) -> result<order, order-error>;' },
  { kind: 'wit-func',     text: '  list-orders:  func(customer-id: string, limit: u32) -> list<order>;' },
  { kind: 'wit-type',     text: '}' },
  { kind: 'blank',        text: '' },
  { kind: 'prompt',       text: 'lewis@construx:~/orders-component$ wasm-tools compose orders-component.wasm analytics-component.wasm -o composed.wasm' },
  { kind: 'compose-step', text: '  linking construx:orders/order-service → construx:analytics/ingest' },
  { kind: 'compose-step', text: '  resolving imports...' },
  { kind: 'compose-ok',   text: '  ✓ composed.wasm  (391 KB)' },
  { kind: 'blank',        text: '' },
  { kind: 'prompt',       text: 'lewis@construx:~/orders-component$ wasmtime run --wasm component-model composed.wasm -- create-order cust-001 4999' },
  { kind: 'run-output',   text: '{' },
  { kind: 'run-output',   text: '  "id": "order-a3f9b2c1",' },
  { kind: 'run-output',   text: '  "customer_id": "cust-001",' },
  { kind: 'run-output',   text: '  "total_cents": 4999,' },
  { kind: 'run-output',   text: '  "status": "pending"' },
  { kind: 'run-output',   text: '}' },
];

const TOTAL = LINES.length + 2;

function lineColor(kind: LineKind): string {
  switch (kind) {
    case 'build-step':    return 'rgba(240,239,255,0.3)';
    case 'build-ok':      return '#4ade80';
    case 'build-warn':    return '#fbbf24';
    case 'size':          return '#fbbf24';
    case 'wit-type':      return 'rgba(167,139,250,0.8)';
    case 'wit-func':      return 'rgba(96,165,250,0.75)';
    case 'compose-step':  return 'rgba(240,239,255,0.3)';
    case 'compose-ok':    return '#4ade80';
    case 'run-output':    return '#4ade80';
    case 'comment':       return 'rgba(240,239,255,0.2)';
    default:              return 'transparent';
  }
}

export default function WasmComponentPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [compSize,  setCompSize]  = useState(391);
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
            setCompSize(Math.floor(385 + Math.random() * 12));
          }, 2300);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const line = LINES[revealed - 1];
    const delay = line?.delay ?? (line?.kind === 'blank' ? 35 : 78);
    const id = setTimeout(() => setRevealed((r) => r + 1), delay);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed > TOTAL && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setCompSize(391);
    }
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
          construx@orders-component — wasm component model
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : '#fbbf24' }}>
          {allDone ? `COMPOSED ${compSize} KB · wasmtime` : 'building…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@wasm$ </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          cargo build · wasm-tools component · compose · wasmtime
        </span>
      </div>

      {/* Content */}
      <div className="px-4 pt-3 pb-2">
        {shownLines.map((line, i) => {
          if (line.kind === 'blank') return <div key={i} className="h-2" />;
          if (line.kind === 'prompt') {
            const idx = line.text.indexOf('$ ');
            const prompt = line.text.slice(0, idx + 2);
            const cmd    = line.text.slice(idx + 2);
            return (
              <div key={i} className="text-[7.5px] leading-[1.75] break-all">
                <span style={{ color: 'rgba(74,222,128,0.5)' }}>{prompt}</span>
                <span style={{ color: 'rgba(240,239,255,0.55)' }}>{cmd}</span>
              </div>
            );
          }
          return (
            <div key={i} className="text-[7.5px] leading-[1.75]" style={{ color: lineColor(line.kind) }}>
              {line.text}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          rust 1.83 · wasm-tools 1.223 · wasmtime 27.0 · wit component model
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● 2 components composed' : 'loading'}
        </span>
      </div>
    </div>
  );
}
