'use client';

import { useEffect, useRef, useState } from 'react';

const ACCOUNTS = [
  { id: 'acc_construx_ops', ledger: 1, code: 1000, debits: 2840000, credits: 2840000, flags: 'linked', status: 'OK' },
  { id: 'acc_construx_rev', ledger: 1, code: 4000, debits: 128400, credits: 840200, flags: 'history', status: 'OK' },
  { id: 'acc_construx_fee', ledger: 2, code: 5000, debits: 12400, credits: 12400, flags: 'none', status: 'OK' },
  { id: 'acc_escrow_hold', ledger: 2, code: 2000, debits: 4800, credits: 3200, flags: 'linked', status: 'PEND' },
];

const TRANSFERS = [
  { id: 'txn_001af2', amount: 84000, debit: 'acc_construx_ops', credit: 'acc_construx_rev', pending: false, latency: 0.8 },
  { id: 'txn_002bc4', amount: 12000, debit: 'acc_construx_fee', credit: 'acc_construx_ops', pending: false, latency: 0.4 },
  { id: 'txn_003de9', amount: 4800, debit: 'acc_escrow_hold', credit: 'acc_construx_rev', pending: true, latency: 1.2 },
  { id: 'txn_004fa1', amount: 28400, debit: 'acc_construx_ops', credit: 'acc_escrow_hold', pending: false, latency: 0.6 },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function TigerBeetlePanel() {
  const [visible, setVisible] = useState(false);
  const [accRows, setAccRows] = useState(0);
  const [txnRows, setTxnRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const txnPerSec = useCounter(284000, 840, 400);
  const totalTxns = useCounter(28400000, 4800, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const a = setInterval(() => setAccRows((x) => Math.min(x + 1, ACCOUNTS.length)), 160);
    const t = setInterval(() => setTxnRows((x) => Math.min(x + 1, TRANSFERS.length)), 140);
    return () => { clearInterval(a); clearInterval(t); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(167,139,250,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(167,139,250,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(167,139,250,0.08)', background: 'rgba(167,139,250,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(167,139,250,0.4)' }}>
          tigerbeetle -- financial ledger -- accounts / transfers / two-phase
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {txnPerSec.toLocaleString()} txn/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>tb@ledger</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>tigerbeetle start --cluster=0 --replica=0 --replica-count=3 --addresses=127.0.0.1:3000</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'txn/s', value: txnPerSec.toLocaleString(), color: '#a78bfa' },
          { label: 'total txns', value: (totalTxns / 1000000).toFixed(1) + 'M', color: '#4ade80' },
          { label: 'accounts', value: ACCOUNTS.length.toString(), color: '#67e8f9' },
          { label: 'pending', value: TRANSFERS.filter(t => t.pending).length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Accounts */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // accounts
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {ACCOUNTS.slice(0, accRows).map((acc) => (
            <div key={acc.id} style={{ display: 'grid', gridTemplateColumns: '1fr 28px 52px 52px 40px 36px', alignItems: 'center', gap: 8, padding: '5px 8px', background: acc.status === 'PEND' ? 'rgba(251,191,36,0.04)' : 'rgba(167,139,250,0.04)', border: `1px solid ${acc.status === 'PEND' ? 'rgba(251,191,36,0.1)' : 'rgba(167,139,250,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.id}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>L{acc.ledger}</span>
              <span className="tabular-nums" style={{ color: '#f87171', fontSize: 7, textAlign: 'right' }}>{(acc.debits / 1000).toFixed(0)}k</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{(acc.credits / 1000).toFixed(0)}k</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{acc.flags}</span>
              <span style={{ color: acc.status === 'OK' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{acc.status}</span>
            </div>
          ))}
        </div>

        {/* Transfers */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent transfers
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TRANSFERS.slice(0, txnRows).map((txn) => (
            <div key={txn.id} style={{ display: 'grid', gridTemplateColumns: '56px 48px 1fr 1fr 40px', alignItems: 'center', gap: 8, padding: '4px 8px', background: txn.pending ? 'rgba(251,191,36,0.04)' : 'rgba(167,139,250,0.04)', border: `1px solid ${txn.pending ? 'rgba(251,191,36,0.1)' : 'rgba(167,139,250,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{txn.id}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>${(txn.amount / 100).toFixed(2)}</span>
              <span style={{ color: '#f87171', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{txn.debit}</span>
              <span style={{ color: '#4ade80', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{txn.credit}</span>
              <span style={{ color: txn.pending ? '#fbbf24' : 'rgba(255,255,255,0.3)', fontSize: 7, textAlign: 'right' }}>{txn.pending ? 'PEND' : `${txn.latency}ms`}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          tigerbeetle v0.16 - apache-2.0 - financial ledger db
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {txnPerSec.toLocaleString()} txn/s - {(totalTxns / 1000000).toFixed(1)}M total
        </span>
      </div>
    </div>
  );
}
