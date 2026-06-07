'use client';

import { useEffect, useRef, useState } from 'react';

const NODES = [
  { name: 'k3s-server-0', role: 'server', os: 'Ubuntu 24.04', arch: 'amd64', cpu: '4c', mem: '8 GB', status: 'Ready' },
  { name: 'k3s-agent-0', role: 'agent', os: 'Ubuntu 24.04', arch: 'amd64', cpu: '2c', mem: '4 GB', status: 'Ready' },
  { name: 'k3s-agent-1', role: 'agent', os: 'Ubuntu 24.04', arch: 'arm64', cpu: '4c', mem: '8 GB', status: 'Ready' },
];

const SYSTEM_PODS = [
  { name: 'coredns-6799fbcd5-xk2zq', ns: 'kube-system', status: 'Running', restarts: 0 },
  { name: 'local-path-provisioner', ns: 'kube-system', status: 'Running', restarts: 0 },
  { name: 'metrics-server-848968bdcd', ns: 'kube-system', status: 'Running', restarts: 1 },
  { name: 'traefik-7d95445d8c', ns: 'kube-system', status: 'Running', restarts: 0 },
  { name: 'svclb-traefik-0', ns: 'kube-system', status: 'Running', restarts: 0 },
];

const FEATURES = [
  { name: 'flannel', desc: 'CNI vxlan overlay', active: true },
  { name: 'traefik', desc: 'ingress controller', active: true },
  { name: 'local-path', desc: 'storage provisioner', active: true },
  { name: 'embedded-etcd', desc: 'HA datastore', active: false },
  { name: 'servicelb', desc: 'bare metal LB', active: true },
];

function useCounter(base: number, delta: number, ms = 1500) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta)), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function K3sPanel() {
  const [visible, setVisible] = useState(false);
  const [nodeRows, setNodeRows] = useState(0);
  const [podRows, setPodRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalPods = useCounter(48, 0, 5000);
  const uptime = useCounter(1240, 0, 60000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const n = setInterval(() => setNodeRows((x) => Math.min(x + 1, NODES.length)), 160);
    const p = setInterval(() => setPodRows((x) => Math.min(x + 1, SYSTEM_PODS.length)), 140);
    return () => { clearInterval(n); clearInterval(p); };
  }, [visible]);

  const readyNodes = NODES.filter((n) => n.status === 'Ready').length;

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
          k3s -- lightweight kubernetes -- rancher / suse
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {readyNodes}/{NODES.length} nodes
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>root@k3s</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>k3s kubectl get nodes -o wide && k3s kubectl get pods -A --field-selector=status.phase=Running</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'nodes ready', value: `${readyNodes}/${NODES.length}`, color: '#4ade80' },
          { label: 'total pods', value: totalPods.toString(), color: '#67e8f9' },
          { label: 'version', value: 'v1.29.4', color: '#a78bfa' },
          { label: 'uptime', value: uptime + 'h', color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Nodes */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // cluster nodes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {NODES.slice(0, nodeRows).map((node) => (
            <div key={node.name} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 80px 36px 28px 40px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.name}</span>
              <span style={{ color: node.role === 'server' ? '#67e8f9' : '#fbbf24', fontSize: 8, textAlign: 'center', padding: '1px 4px', background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>{node.role}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8 }}>{node.os.split(' ')[0]}</span>
              <span style={{ color: '#a78bfa', fontSize: 7 }}>{node.arch}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8 }}>{node.cpu}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8 }}>{node.mem}</span>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{node.status.toUpperCase()}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* System pods */}
          <div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
              // system pods
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {SYSTEM_PODS.slice(0, podRows).map((pod) => (
                <div key={pod.name} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.08)', borderRadius: 2 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ color: 'rgba(240,239,255,0.55)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{pod.name.split('-').slice(0, 2).join('-')}</span>
                  {pod.restarts > 0 && <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7 }}>{pod.restarts}r</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Built-in features */}
          <div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
              // built-in components
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {FEATURES.map((f) => (
                <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: f.active ? 'rgba(74,222,128,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${f.active ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)'}`, borderRadius: 2 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: f.active ? '#4ade80' : 'rgba(255,255,255,0.2)', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ color: f.active ? 'rgba(240,239,255,0.65)' : 'rgba(255,255,255,0.2)', fontSize: 8, flex: 1 }}>{f.name}</span>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{f.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          k3s v1.29.4+k3s1 - suse/rancher - cncf
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalPods} pods - {uptime}h uptime
        </span>
      </div>
    </div>
  );
}
