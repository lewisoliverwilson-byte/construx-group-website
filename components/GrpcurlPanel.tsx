'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'proto-field' | 'proto-msg' | 'json-key' | 'json-val' | 'json-str' | 'status-ok' | 'status-err' | 'list-item' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',    text: '# List available gRPC services (server reflection)' },
  { kind: 'prompt',     text: 'grpcurl -plaintext localhost:50051 list' },
  { kind: 'list-item',  text: 'construx.order.v1.OrderService' },
  { kind: 'list-item',  text: 'construx.product.v1.ProductService' },
  { kind: 'list-item',  text: 'grpc.health.v1.Health' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# Describe the OrderService — shows protobuf schema' },
  { kind: 'prompt',     text: 'grpcurl -plaintext localhost:50051 describe construx.order.v1.OrderService' },
  { kind: 'proto-msg',  text: 'service OrderService {' },
  { kind: 'proto-field', text: '  rpc CreateOrder (CreateOrderRequest) returns (Order);' },
  { kind: 'proto-field', text: '  rpc GetOrder    (GetOrderRequest)    returns (Order);' },
  { kind: 'proto-field', text: '  rpc StreamOrders(StreamOrdersRequest) returns (stream Order);' },
  { kind: 'proto-msg',  text: '}' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# Call CreateOrder with JSON body' },
  { kind: 'prompt',     text: 'grpcurl -plaintext -d \'{"customer_id":"cust-001","items":[{"sku":"SKU-42","qty":2}]}\' \\ localhost:50051 construx.order.v1.OrderService/CreateOrder' },
  { kind: 'json-key',   text: '{' },
  { kind: 'json-key',   text: '  "order_id":' },
  { kind: 'json-str',   text: '    "a3f9b2c1-4d5e-6f7a-8b9c-0d1e2f3a4b5c",' },
  { kind: 'json-key',   text: '  "status":' },
  { kind: 'json-val',   text: '    "PENDING",' },
  { kind: 'json-key',   text: '  "total_cents":' },
  { kind: 'json-val',   text: '    8998,' },
  { kind: 'json-key',   text: '  "created_at":' },
  { kind: 'json-str',   text: '    "2032-03-10T14:32:07Z"' },
  { kind: 'json-key',   text: '}' },
  { kind: 'status-ok',  text: 'Status: OK' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# Server-streaming RPC: stream live order updates' },
  { kind: 'prompt',     text: 'grpcurl -plaintext -d \'{"customer_id":"cust-001"}\' \\ localhost:50051 construx.order.v1.OrderService/StreamOrders' },
  { kind: 'json-val',   text: '{"order_id":"a3f9b2c1","status":"PROCESSING","updated_at":"14:32:08Z"}' },
  { kind: 'json-val',   text: '{"order_id":"a3f9b2c1","status":"SHIPPED","updated_at":"14:32:09Z"}' },
  { kind: 'json-val',   text: '{"order_id":"a3f9b2c1","status":"DELIVERED","updated_at":"14:32:11Z"}' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':     return 'rgba(240,239,255,0.22)';
    case 'prompt':      return 'rgba(240,239,255,0.6)';
    case 'proto-msg':   return '#a78bfa';
    case 'proto-field': return '#67e8f9';
    case 'json-key':    return '#fbbf24';
    case 'json-val':    return '#4ade80';
    case 'json-str':    return '#fb923c';
    case 'status-ok':   return '#4ade80';
    case 'status-err':  return '#f87171';
    case 'list-item':   return '#67e8f9';
    default:            return 'transparent';
  }
}

export default function GrpcurlPanel() {
  const [revealed,   setRevealed]   = useState(0);
  const [liveLatMs,  setLiveLatMs]  = useState(4.2);
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
            setLiveLatMs(Math.round((2.5 + Math.random() * 4) * 10) / 10);
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
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 35 : 80;
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
          construx@prod-01 — grpcurl · OrderService · localhost:50051
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveLatMs}ms avg` : 'connecting…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          grpcurl -plaintext localhost:50051 describe construx.order.v1
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
                {l.kind === 'list-item' && (
                  <span style={{ color: 'rgba(240,239,255,0.2)', marginRight: '8px' }}>→</span>
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>proto3 ·</span>
          <span style={{ color: '#a78bfa' }}>3 RPCs (unary + server-streaming)</span>
          <span style={{ color: '#4ade80' }}>latency: {liveLatMs}ms</span>
          <span style={{ color: '#67e8f9' }}>reflection: enabled</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          grpcurl 1.9.3 · protobuf 3.27 · grpc 1.68 · tls disabled (dev)
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● connected' : 'loading'}
        </span>
      </div>
    </div>
  );
}
