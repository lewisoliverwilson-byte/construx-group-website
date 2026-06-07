'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind =
  | 'prompt'
  | 'service'
  | 'comment'
  | 'proto-header'
  | 'proto-method'
  | 'proto-brace'
  | 'json-key'
  | 'json-str'
  | 'json-num'
  | 'status-ok'
  | 'timing'
  | 'blank';

interface GrpcLine {
  kind:   LineKind;
  text:   string;
  indent?: number;
}

const LINES: GrpcLine[] = [
  { kind: 'comment',      text: '# List all gRPC services (server reflection)' },
  { kind: 'prompt',       text: 'grpcurl -plaintext localhost:50051 list' },
  { kind: 'service',      text: 'construx.orders.OrdersService' },
  { kind: 'service',      text: 'construx.users.UsersService' },
  { kind: 'service',      text: 'construx.analytics.AnalyticsService' },
  { kind: 'service',      text: 'grpc.reflection.v1alpha.ServerReflection' },
  { kind: 'blank',        text: '' },
  { kind: 'comment',      text: '# Describe service — shows all methods and proto types' },
  { kind: 'prompt',       text: 'grpcurl -plaintext localhost:50051 describe construx.orders.OrdersService' },
  { kind: 'proto-header', text: 'service OrdersService {' },
  { kind: 'proto-method', text: 'rpc CreateOrder (CreateOrderRequest) returns (CreateOrderResponse);', indent: 2 },
  { kind: 'proto-method', text: 'rpc GetOrder (GetOrderRequest) returns (Order);', indent: 2 },
  { kind: 'proto-method', text: 'rpc ListOrders (ListOrdersRequest) returns (stream Order);', indent: 2 },
  { kind: 'proto-method', text: 'rpc CancelOrder (CancelOrderRequest) returns (CancelOrderResponse);', indent: 2 },
  { kind: 'proto-method', text: 'rpc StreamEvents (EventsRequest) returns (stream OrderEvent);', indent: 2 },
  { kind: 'proto-brace',  text: '}' },
  { kind: 'blank',        text: '' },
  { kind: 'comment',      text: '# Server-streaming call — receives 3 orders' },
  { kind: 'prompt',       text: 'grpcurl -d \'{"userId":"usr_01JA8X2","limit":3}\' -plaintext localhost:50051 construx.orders.OrdersService/ListOrders' },
  { kind: 'json-key',     text: '{' },
  { kind: 'json-str',     text: '  "orderId":   "ord_01JA9KF2N3",' },
  { kind: 'json-str',     text: '  "userId":    "usr_01JA8X2",' },
  { kind: 'json-num',     text: '  "amount":    4999,' },
  { kind: 'json-str',     text: '  "status":    "completed",' },
  { kind: 'json-str',     text: '  "createdAt": "2031-08-09T14:22:31Z"' },
  { kind: 'json-key',     text: '}' },
  { kind: 'json-key',     text: '{' },
  { kind: 'json-str',     text: '  "orderId":   "ord_01JA7HB1M2",' },
  { kind: 'json-str',     text: '  "userId":    "usr_01JA8X2",' },
  { kind: 'json-num',     text: '  "amount":    1499,' },
  { kind: 'json-str',     text: '  "status":    "completed",' },
  { kind: 'json-str',     text: '  "createdAt": "2031-08-07T09:11:04Z"' },
  { kind: 'json-key',     text: '}' },
  { kind: 'json-key',     text: '{' },
  { kind: 'json-str',     text: '  "orderId":   "ord_01JA4DC9P1",' },
  { kind: 'json-str',     text: '  "userId":    "usr_01JA8X2",' },
  { kind: 'json-num',     text: '  "amount":    9900,' },
  { kind: 'json-str',     text: '  "status":    "refunded",' },
  { kind: 'json-str',     text: '  "createdAt": "2031-08-01T18:44:57Z"' },
  { kind: 'json-key',     text: '}' },
  { kind: 'blank',        text: '' },
  { kind: 'status-ok',    text: 'Status: OK' },
  { kind: 'timing',       text: 'Sent 1 request and received 3 responses · 3.2ms' },
];

const TOTAL = LINES.length;

function lineColor(kind: LineKind): string {
  switch (kind) {
    case 'prompt':       return 'rgba(240,239,255,0.55)';
    case 'comment':      return 'rgba(240,239,255,0.22)';
    case 'service':      return 'rgba(96,165,250,0.75)';
    case 'proto-header': return 'rgba(167,139,250,0.7)';
    case 'proto-method': return 'rgba(240,239,255,0.38)';
    case 'proto-brace':  return 'rgba(167,139,250,0.5)';
    case 'json-key':     return 'rgba(240,239,255,0.45)';
    case 'json-str':     return 'rgba(74,222,128,0.55)';
    case 'json-num':     return 'rgba(251,191,36,0.7)';
    case 'status-ok':    return '#4ade80';
    case 'timing':       return 'rgba(240,239,255,0.28)';
    case 'blank':        return 'transparent';
    default:             return 'rgba(240,239,255,0.35)';
  }
}

export default function GrpcCallPanel() {
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
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 40 : 82;
    const id = setTimeout(() => setRevealed((r) => r + 1), delay);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone   = revealed > TOTAL;
  const shownLines = LINES.slice(0, Math.max(0, Math.min(LINES.length, revealed)));

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
          construx@dev-macbook — grpcurl
        </span>
        <span className="text-[8px]" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? '● OK · 3.2ms' : 'connecting…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@dev-macbook:~/construx-api$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          grpcurl -plaintext localhost:50051 list
        </span>
      </div>

      {/* Lines */}
      <div className="px-4 py-2 space-y-px">
        {shownLines.map((line, i) => {
          if (line.kind === 'blank') return <div key={i} className="h-1.5" />;
          const isPrompt = line.kind === 'prompt';
          const indent   = line.indent ?? 0;
          return (
            <div
              key={i}
              className="flex items-start gap-2 text-[7.5px] leading-[1.8]"
              style={{ paddingLeft: indent ? `${indent * 10}px` : undefined }}
            >
              {isPrompt && (
                <span className="shrink-0 text-[7.5px]" style={{ color: 'rgba(74,222,128,0.5)', marginTop: '1px' }}>$</span>
              )}
              {!isPrompt && (
                <span className="shrink-0 text-[7.5px]" style={{ color: 'rgba(255,255,255,0.1)', marginTop: '1px' }}>›</span>
              )}
              <span style={{ color: lineColor(line.kind), whiteSpace: 'pre' }}>{line.text}</span>
            </div>
          );
        })}

        {/* Cursor */}
        {!allDone && revealed > 0 && (
          <div className="flex items-center gap-2 text-[7.5px]">
            <span style={{ color: 'rgba(74,222,128,0.5)' }}>$</span>
            <span
              className="inline-block w-1.5 h-3"
              style={{ background: 'rgba(74,222,128,0.5)', animation: 'pulse 1s infinite' }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          grpcurl v1.9.1 · proto3 · server reflection
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● connected' : 'loading'}
        </span>
      </div>
    </div>
  );
}
