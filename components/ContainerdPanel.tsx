'use client';

import { useEffect, useRef, useState } from 'react';

const IMAGES = [
  { ref: 'registry.k8s.io/pause:3.9', size: '736 kB', snapshots: 1, platform: 'linux/amd64' },
  { ref: 'docker.io/library/redis:7.2-alpine', size: '29.3 MB', snapshots: 3, platform: 'linux/amd64' },
  { ref: 'ghcr.io/construx/api:sha-4b10d42', size: '84.1 MB', snapshots: 7, platform: 'linux/amd64' },
  { ref: 'docker.io/envoyproxy/envoy:v1.29.4', size: '156 MB', snapshots: 12, platform: 'linux/amd64' },
];

const CONTAINERS = [
  { id: 'c4f2a8b1', image: 'construx/api', runtime: 'io.containerd.runc.v2', pid: 14820, status: 'RUNNING' },
  { id: '7e9d3f0c', image: 'redis:7.2', runtime: 'io.containerd.runc.v2', pid: 9234, status: 'RUNNING' },
  { id: 'a1b5e2d7', image: 'envoy:v1.29', runtime: 'io.containerd.runc.v2', pid: 18492, status: 'RUNNING' },
  { id: '3c8f1a9e', image: 'pause:3.9', runtime: 'io.containerd.runc.v2', pid: 8801, status: 'RUNNING' },
];

const SNAPSHOTS = [
  { key: 'sha256:a3f1b2c8', kind: 'committed', usage: '83.6 MB', parent: 'sha256:0e9d...' },
  { key: 'sha256:7d4e1a2f', kind: 'active', usage: '4.2 MB', parent: 'sha256:a3f1...' },
  { key: 'sha256:c9b2e8a1', kind: 'committed', usage: '29.1 MB', parent: '<none>' },
];

function useCounter(base: number, delta: number, ms = 1200) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta)), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function ContainerdPanel() {
  const [visible, setVisible] = useState(false);
  const [imgRows, setImgRows] = useState(0);
  const [ctRows, setCtRows] = useState(0);
  const [snapRows, setSnapRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const pulls = useCounter(1847, 1, 2000);
  const snapTotal = useCounter(284, 0, 4000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const i = setInterval(() => setImgRows((x) => Math.min(x + 1, IMAGES.length)), 140);
    const c = setInterval(() => setCtRows((x) => Math.min(x + 1, CONTAINERS.length)), 160);
    const s = setInterval(() => setSnapRows((x) => Math.min(x + 1, SNAPSHOTS.length)), 180);
    return () => { clearInterval(i); clearInterval(c); clearInterval(s); };
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
          containerd -- cri runtime -- runc v2 shim
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {CONTAINERS.length} tasks
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>root@node</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>ctr --namespace k8s.io containers ls && ctr snapshot ls --snapshotter overlayfs</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'images', value: IMAGES.length.toString(), color: '#67e8f9' },
          { label: 'containers', value: CONTAINERS.length.toString(), color: '#4ade80' },
          { label: 'snapshots', value: snapTotal.toString(), color: '#fbbf24' },
          { label: 'image pulls', value: pulls.toLocaleString(), color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Images */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // image store (overlayfs snapshotter)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {IMAGES.slice(0, imgRows).map((img) => (
            <div key={img.ref} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 52px 76px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.ref}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 8, textAlign: 'right' }}>{img.size}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{img.snapshots} snaps</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{img.platform}</span>
            </div>
          ))}
        </div>

        {/* Containers */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // running tasks (runc v2 shim)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {CONTAINERS.slice(0, ctRows).map((ct) => (
            <div key={ct.id} style={{ display: 'grid', gridTemplateColumns: '64px 80px 1fr 52px 56px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, fontFamily: 'monospace' }}>{ct.id}</span>
              <span style={{ color: '#4ade80', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ct.image}</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ct.runtime}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8 }}>pid {ct.pid}</span>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{ct.status}</span>
            </div>
          ))}
        </div>

        {/* Snapshots */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // snapshot sample
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SNAPSHOTS.slice(0, snapRows).map((snap) => (
            <div key={snap.key} style={{ display: 'grid', gridTemplateColumns: '90px 64px 60px 1fr', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8 }}>{snap.key}</span>
              <span style={{ color: snap.kind === 'active' ? '#fbbf24' : 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: snap.kind === 'active' ? 700 : 400 }}>{snap.kind}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8 }}>{snap.usage}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>parent: {snap.parent}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          containerd v1.7.15 - cncf - overlayfs
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {snapTotal} snapshots - {pulls.toLocaleString()} pulls
        </span>
      </div>
    </div>
  );
}
