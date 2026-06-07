'use client';

import { useEffect, useRef, useState } from 'react';

const TABLES = [
  { name: 'filter', family: 'ip', chains: 3 },
  { name: 'nat', family: 'ip', chains: 2 },
  { name: 'mangle', family: 'ip', chains: 1 },
];

const CHAINS = [
  { table: 'filter', name: 'input', hook: 'input', policy: 'drop', prio: 0 },
  { table: 'filter', name: 'forward', hook: 'forward', policy: 'drop', prio: 0 },
  { table: 'filter', name: 'output', hook: 'output', policy: 'accept', prio: 0 },
  { table: 'nat', name: 'prerouting', hook: 'prerouting', policy: 'accept', prio: -100 },
  { table: 'nat', name: 'postrouting', hook: 'postrouting', policy: 'accept', prio: 100 },
];

const RULES = [
  { chain: 'input', expr: 'ct state established,related accept', pkts: 2481902, bytes: '3.1 GB', verdict: 'accept' },
  { chain: 'input', expr: 'iif lo accept', pkts: 82401, bytes: '14 MB', verdict: 'accept' },
  { chain: 'input', expr: 'tcp dport { 80, 443 } accept', pkts: 147220, bytes: '284 MB', verdict: 'accept' },
  { chain: 'input', expr: 'tcp dport 22 ip saddr 10.0.0.0/8 accept', pkts: 1240, bytes: '2.1 MB', verdict: 'accept' },
  { chain: 'input', expr: 'ip protocol icmp accept', pkts: 8402, bytes: '840 kB', verdict: 'accept' },
  { chain: 'input', expr: 'counter drop', pkts: 84201, bytes: '12 MB', verdict: 'drop' },
  { chain: 'postrouting', expr: 'ip saddr 10.0.0.0/8 masquerade', pkts: 48200, bytes: '62 MB', verdict: 'masq' },
];

function useCounter(base: number, delta: number, ms = 800) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

const VERDICT_COLOR: Record<string, string> = {
  accept: '#4ade80',
  drop: '#f87171',
  masq: '#fbbf24',
};

export default function NftablesPanel() {
  const [visible, setVisible] = useState(false);
  const [ruleRows, setRuleRows] = useState(0);
  const [chainRows, setChainRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const pktsSec = useCounter(42800, 300, 700);
  const dropsSec = useCounter(840, 8, 900);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setRuleRows((x) => Math.min(x + 1, RULES.length)), 140);
    const c = setInterval(() => setChainRows((x) => Math.min(x + 1, CHAINS.length)), 160);
    return () => { clearInterval(r); clearInterval(c); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(103,232,249,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(103,232,249,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(103,232,249,0.08)', background: 'rgba(103,232,249,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(103,232,249,0.4)' }}>
          nftables -- netfilter packet filtering -- linux kernel
        </span>
        <span
          style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', boxShadow: '0 0 5px rgba(248,113,113,0.6)', display: 'inline-block' }}
        />
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>root@firewall</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>{'nft --json list ruleset | jq . && nft monitor trace 2>/dev/null'}</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'pkts/sec', value: pktsSec.toLocaleString(), color: '#4ade80' },
          { label: 'drops/sec', value: dropsSec.toLocaleString(), color: '#f87171' },
          { label: 'chains', value: CHAINS.length.toString(), color: '#67e8f9' },
          { label: 'rules', value: RULES.length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Tables + chains */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div style={{ flex: '0 0 auto' }}>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
              // tables
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {TABLES.map((t) => (
                <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 8px', background: 'rgba(103,232,249,0.06)', border: '1px solid rgba(103,232,249,0.12)', borderRadius: 2 }}>
                  <span style={{ fontSize: 7, color: '#67e8f9', padding: '0 4px', background: 'rgba(103,232,249,0.12)', borderRadius: 2 }}>{t.family}</span>
                  <span style={{ fontSize: 9, color: 'rgba(240,239,255,0.7)', fontWeight: 600 }}>{t.name}</span>
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>{t.chains} chains</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
              // chains
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {CHAINS.slice(0, chainRows).map((ch) => (
                <div key={ch.table + ch.name} style={{ display: 'grid', gridTemplateColumns: '40px 70px 1fr 44px 36px', alignItems: 'center', gap: 6, padding: '3px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2 }}>
                  <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>{ch.table}</span>
                  <span style={{ fontSize: 9, color: '#67e8f9' }}>{ch.name}</span>
                  <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)' }}>hook:{ch.hook}</span>
                  <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)' }}>prio {ch.prio}</span>
                  <span style={{ fontSize: 7, color: ch.policy === 'accept' ? '#4ade80' : '#f87171', fontWeight: 700, textAlign: 'right' }}>{ch.policy}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rules */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // ruleset (filter.input + nat.postrouting)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {RULES.slice(0, ruleRows).map((rule, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 56px 56px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: `${VERDICT_COLOR[rule.verdict] ?? '#fff'}06`, border: `1px solid ${VERDICT_COLOR[rule.verdict] ?? '#fff'}18`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.6)', fontSize: 9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rule.expr}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, textAlign: 'right' }}>{(rule.pkts / 1000).toFixed(0)}k pkt</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, textAlign: 'right' }}>{rule.bytes}</span>
              <span style={{ color: VERDICT_COLOR[rule.verdict] ?? '#fff', fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{rule.verdict.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          nftables v1.0.9 - netfilter - linux 6.8
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {pktsSec.toLocaleString()} pkt/s - {dropsSec} drops/s
        </span>
      </div>
    </div>
  );
}
