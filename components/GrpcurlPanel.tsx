'use client';

import { useEffect, useRef, useState } from 'react';

const SERVICES = [
  { name: 'construx.api.ListingService', methods: 8, proto: 'listing/v1/service.proto', state: 'healthy' },
  { name: 'construx.api.SearchService', methods: 5, proto: 'search/v1/service.proto', state: 'healthy' },
  { name: 'construx.api.UserService', methods: 6, proto: 'user/v1/service.proto', state: 'healthy' },
  { name: 'construx.api.NotifyService', methods: 3, proto: 'notify/v1/service.proto', state: 'degraded' },
];

const CALLS = [
  { method: 'ListingService/GetListing', status: 'OK', latency: '4ms', size: '2.4 KB', stream: false },
  { method: 'SearchService/SemanticSearch', status: 'OK', latency: '28ms', size: '18 KB', stream: false },
  { method: 'ListingService/WatchListings', status: 'OK', latency: '—', size: '—', stream: true },
  { method: 'NotifyService/SendAlert', status: 'UNAVAILABLE', latency: '5001ms', size: '—', stream: false },
];

const STATUS_COLOR: Record<string, string> = {
  OK: '#4ade80',
  UNAVAILABLE: '#f87171',
  UNIMPLEMENTED: '#fbbf24',
  INVALID_ARGUMENT: '#f87171',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function GrpcurlPanel() {
  const [visible, setVisible] = useState(false);
  const [sRows, setSRows] = useState(0);
  const [cRows, setCRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const rpcCalls = useCounter(28400, 84, 450);
  const p99Latency = useCounter(28, 0, 1000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setSRows((x) => Math.min(x + 1, SERVICES.length)), 160);
    const c = setInterval(() => setCRows((x) => Math.min(x + 1, CALLS.length)), 140);
    return () => { clearInterval(s); clearInterval(c); };
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
          grpcurl -- grpc reflection -- service discovery / call testing / streaming
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {rpcCalls.toLocaleString()} rpc/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>grpcurl@api</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>grpcurl -plaintext localhost:9090 list && grpcurl -d {`'{"id":"listing_1"}'`} localhost:9090 construx.api.ListingService/GetListing</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'rpc/s', value: rpcCalls.toLocaleString(), color: '#67e8f9' },
          { label: 'p99 latency', value: p99Latency + 'ms', color: '#4ade80' },
          { label: 'services', value: SERVICES.length.toString(), color: '#a78bfa' },
          { label: 'errors', value: CALLS.filter(c => c.status !== 'OK').length.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Services */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // reflected services
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {SERVICES.slice(0, sRows).map((svc) => (
            <div key={svc.name} style={{ display: 'grid', gridTemplateColumns: '1fr 28px 1fr 48px', alignItems: 'center', gap: 8, padding: '5px 8px', background: svc.state === 'degraded' ? 'rgba(248,113,113,0.04)' : 'rgba(103,232,249,0.04)', border: `1px solid ${svc.state === 'degraded' ? 'rgba(248,113,113,0.1)' : 'rgba(103,232,249,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{svc.name}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{svc.methods}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{svc.proto}</span>
              <span style={{ color: svc.state === 'healthy' ? '#4ade80' : '#f87171', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{svc.state}</span>
            </div>
          ))}
        </div>

        {/* RPC calls */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // rpc calls
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {CALLS.slice(0, cRows).map((call) => (
            <div key={call.method} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 40px 32px 40px', alignItems: 'center', gap: 8, padding: '4px 8px', background: call.status !== 'OK' ? 'rgba(248,113,113,0.04)' : 'rgba(103,232,249,0.04)', border: `1px solid ${call.status !== 'OK' ? 'rgba(248,113,113,0.1)' : 'rgba(103,232,249,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{call.method}</span>
              <span style={{ color: STATUS_COLOR[call.status] ?? '#fbbf24', fontSize: 7, fontWeight: 700 }}>{call.status}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{call.latency}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{call.size}</span>
              <span style={{ color: call.stream ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'right' }}>{call.stream ? 'stream' : 'unary'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          grpcurl v1.9 - bsd-3 - grpc reflection & testing
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {SERVICES.length} services - {rpcCalls.toLocaleString()} rpc/s
        </span>
      </div>
    </div>
  );
}
