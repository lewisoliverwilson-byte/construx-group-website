'use client';

import { useEffect, useRef, useState } from 'react';

const ROOMS = [
  { id: '!construx-ops:construxgroup.io', name: '#construx-ops', members: 8, events: 28400, type: 'private', encrypted: true, status: 'active' },
  { id: '!construx-alerts:construxgroup.io', name: '#construx-alerts', members: 6, events: 48400, type: 'private', encrypted: true, status: 'active' },
  { id: '!construx-dev:construxgroup.io', name: '#construx-dev', members: 12, events: 84000, type: 'private', encrypted: true, status: 'active' },
  { id: '!construx-general:construxgroup.io', name: '#construx-general', members: 14, events: 284000, type: 'private', encrypted: true, status: 'active' },
];

const FEDERATION = [
  { server: 'matrix.org', direction: 'both', lag: 0, edus: 284, pdus: 48, status: 'connected' },
  { server: 'element.io', direction: 'inbound', lag: 0, edus: 12, pdus: 4, status: 'connected' },
  { server: 'beeper.com', direction: 'both', lag: 2, edus: 8, pdus: 2, status: 'connected' },
  { server: 'vector.im', direction: 'both', lag: 0, edus: 48, pdus: 12, status: 'connected' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function SynapsePanel() {
  const [visible, setVisible] = useState(false);
  const [roomRows, setRoomRows] = useState(0);
  const [fedRows, setFedRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const eventsTotal = useCounter(444800, 480, 500);
  const usersTotal = useCounter(40, 1, 3600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setRoomRows((x) => Math.min(x + 1, ROOMS.length)), 160);
    const f = setInterval(() => setFedRows((x) => Math.min(x + 1, FEDERATION.length)), 140);
    return () => { clearInterval(r); clearInterval(f); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(74,222,128,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(74,222,128,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(74,222,128,0.08)', background: 'rgba(74,222,128,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(74,222,128,0.4)' }}>
          synapse -- matrix homeserver -- rooms / federation / e2ee
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {usersTotal} users
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>synapse@matrix</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>curl -s localhost:8008/_synapse/admin/v1/server_version && synapse-admin rooms list</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'events total', value: (eventsTotal / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'users', value: usersTotal.toString(), color: '#67e8f9' },
          { label: 'rooms', value: ROOMS.length.toString(), color: '#a78bfa' },
          { label: 'fed servers', value: FEDERATION.length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Rooms */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // rooms
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {ROOMS.slice(0, roomRows).map((room) => (
            <div key={room.id} style={{ display: 'grid', gridTemplateColumns: '1fr 24px 52px 28px 28px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.name}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{room.members}m</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{room.events.toLocaleString()}e</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{room.type}</span>
              <span style={{ color: room.encrypted ? '#4ade80' : 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>e2ee</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{room.status}</span>
            </div>
          ))}
        </div>

        {/* Federation */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // federation
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {FEDERATION.slice(0, fedRows).map((fed, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 48px 28px 36px 36px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fed.server}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{fed.direction}</span>
              <span className="tabular-nums" style={{ color: fed.lag > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{fed.lag}s</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{fed.edus}e</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{fed.pdus}p</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{fed.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          synapse v1.113 - apache-2.0 - matrix reference homeserver
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {(eventsTotal / 1000).toFixed(0)}k events - {usersTotal} users
        </span>
      </div>
    </div>
  );
}
