'use client';

import { useState, useEffect, useRef } from 'react';

interface NatsMessage {
  subject: string;
  payload: string;
  size:    number;
  sid:     string;
  ts:      string;
}

const SUBSCRIPTIONS = [
  { sub: 'orders.>', sid: 'sid-1', desc: 'order events (wildcard)' },
  { sub: 'users.created', sid: 'sid-2', desc: 'new user events' },
  { sub: 'payments.>', sid: 'sid-3', desc: 'payment events (wildcard)' },
  { sub: '_INBOX.kZ9mP2', sid: 'sid-4', desc: 'reply inbox' },
];

const MESSAGES: NatsMessage[] = [
  {
    subject: 'orders.created',
    sid:     'sid-1',
    ts:      '09:14:22.441',
    size:    128,
    payload: '{"orderId":"ord_01JA9KF2","userId":"usr_abc","amount":4999,"status":"pending"}',
  },
  {
    subject: 'users.created',
    sid:     'sid-2',
    ts:      '09:14:22.883',
    size:    72,
    payload: '{"userId":"usr_xyz","email":"lewis@construxgroup.io","plan":"pro"}',
  },
  {
    subject: 'payments.initiated',
    sid:     'sid-3',
    ts:      '09:14:23.112',
    size:    96,
    payload: '{"paymentId":"pay_01JA","orderId":"ord_01JA9KF2","amount":4999,"provider":"stripe"}',
  },
  {
    subject: 'payments.succeeded',
    sid:     'sid-3',
    ts:      '09:14:24.891',
    size:    112,
    payload: '{"paymentId":"pay_01JA","orderId":"ord_01JA9KF2","status":"succeeded","chargeId":"ch_3P8"}',
  },
  {
    subject: 'orders.confirmed',
    sid:     'sid-1',
    ts:      '09:14:24.942',
    size:    140,
    payload: '{"orderId":"ord_01JA9KF2","userId":"usr_abc","status":"confirmed","confirmedAt":"2031-10-05T09:14:24Z"}',
  },
  {
    subject: '_INBOX.kZ9mP2',
    sid:     'sid-4',
    ts:      '09:14:25.018',
    size:    48,
    payload: '{"status":"ok","processedAt":"2031-10-05T09:14:25Z"}',
  },
  {
    subject: 'orders.shipped',
    sid:     'sid-1',
    ts:      '09:14:31.774',
    size:    104,
    payload: '{"orderId":"ord_01JA9KF2","trackingId":"DHL-4829-X7","carrier":"dhl"}',
  },
  {
    subject: 'users.created',
    sid:     'sid-2',
    ts:      '09:14:44.221',
    size:    68,
    payload: '{"userId":"usr_def","email":"dan@construxgroup.io","plan":"starter"}',
  },
];

const TOTAL_ROWS = SUBSCRIPTIONS.length + MESSAGES.length + 2;

function subjectColor(subject: string): string {
  if (subject.startsWith('orders'))   return '#4ade80';
  if (subject.startsWith('users'))    return '#60a5fa';
  if (subject.startsWith('payments')) return '#fbbf24';
  if (subject.startsWith('_INBOX'))   return 'rgba(167,139,250,0.7)';
  return 'rgba(240,239,255,0.4)';
}

export default function NatsPubSubPanel() {
  const [revealed, setRevealed]   = useState(0);
  const [msgCount, setMsgCount]   = useState(0);
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
            setMsgCount((c) => c + Math.floor(Math.random() * 4) + 1);
          }, 2100);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL_ROWS) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 83);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const allDone      = revealed > TOTAL_ROWS;
  const shownSubs    = SUBSCRIPTIONS.slice(0, Math.min(SUBSCRIPTIONS.length, Math.max(0, revealed - 1)));
  const msgStart     = SUBSCRIPTIONS.length + 2;
  const shownMsgs    = MESSAGES.slice(0, Math.max(0, revealed - msgStart));
  const totalMsgs    = MESSAGES.length + msgCount;

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
          construx@dev-macbook — nats sub
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: '#4ade80' }}>
          {allDone ? `LIVE ${totalMsgs} msgs` : 'connecting…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@dev-macbook:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          nats sub --server nats://localhost:4222 'orders.&gt;' 'users.created' 'payments.&gt;'
        </span>
      </div>

      {/* Subscriptions */}
      {shownSubs.length > 0 && (
        <div className="px-4 pt-2 pb-1 space-y-0.5">
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.18)' }}>Subscriptions</div>
          {shownSubs.map((s, i) => (
            <div key={i} className="flex items-center gap-3 text-[7.5px] leading-[1.7]">
              <span style={{ color: subjectColor(s.sub), minWidth: '130px', flexShrink: 0 }}>{s.sub}</span>
              <span style={{ color: 'rgba(240,239,255,0.22)', minWidth: '60px', flexShrink: 0 }}>{s.sid}</span>
              <span style={{ color: 'rgba(240,239,255,0.2)' }}>{s.desc}</span>
            </div>
          ))}
        </div>
      )}

      {/* Divider after subs */}
      {revealed >= SUBSCRIPTIONS.length + 2 && (
        <div className="px-4 py-1">
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} />
          <div className="text-[7px] uppercase tracking-widest mt-1.5" style={{ color: 'rgba(240,239,255,0.18)' }}>Messages</div>
        </div>
      )}

      {/* Message rows */}
      {shownMsgs.length > 0 && (
        <div className="px-4 pb-2 space-y-px">
          {shownMsgs.map((msg, i) => (
            <div
              key={i}
              className="text-[7.5px] leading-[1.7]"
              style={{
                borderLeft: `2px solid ${subjectColor(msg.subject)}44`,
                paddingLeft: '6px',
              }}
            >
              <div className="flex items-center gap-3">
                <span style={{ color: subjectColor(msg.subject), fontWeight: 600, minWidth: '160px', flexShrink: 0 }}>{msg.subject}</span>
                <span style={{ color: 'rgba(240,239,255,0.22)', minWidth: '80px', flexShrink: 0 }}>{msg.ts}</span>
                <span style={{ color: 'rgba(240,239,255,0.2)' }}>{msg.size}B · {msg.sid}</span>
              </div>
              <div style={{ color: 'rgba(240,239,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '520px' }}>
                {msg.payload}
              </div>
            </div>
          ))}

          {!allDone && shownMsgs.length > 0 && (
            <div className="flex items-center gap-1 mt-1 text-[7.5px]" style={{ color: 'rgba(74,222,128,0.4)' }}>
              <span style={{ animation: 'pulse 1s infinite' }}>▋</span>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>{SUBSCRIPTIONS.length} subscriptions</span>
          <span>{MESSAGES.length} messages received</span>
          <span style={{ color: '#4ade80' }}>● connected · nats.construxgroup.io:4222</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          nats 0.1.6 · server 2.10.22 · jetstream enabled
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? `● ${SUBSCRIPTIONS.length} subs` : 'loading'}
        </span>
      </div>
    </div>
  );
}
