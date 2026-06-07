'use client';

import { useEffect, useRef, useState } from 'react';

const VMS = [
  { name: 'windows-dev-01', namespace: 'dev', cpu: 4, memGB: 16, disk: '120Gi', node: 'k8s-worker-01', status: 'Running' },
  { name: 'ubuntu-build-01', namespace: 'ci', cpu: 8, memGB: 32, disk: '80Gi', node: 'k8s-worker-02', status: 'Running' },
  { name: 'macos-runner-01', namespace: 'ci', cpu: 6, memGB: 24, disk: '200Gi', node: 'k8s-worker-03', status: 'Running' },
  { name: 'legacy-app-vm', namespace: 'prod', cpu: 2, memGB: 8, disk: '40Gi', node: 'k8s-worker-01', status: 'Paused' },
];

const SNAPSHOTS = [
  { name: 'windows-dev-01-snap-20260607', vm: 'windows-dev-01', phase: 'Succeeded', size: '8.4GB', createdAt: '2h ago', ready: true },
  { name: 'ubuntu-build-01-snap-20260606', vm: 'ubuntu-build-01', phase: 'Succeeded', size: '4.2GB', createdAt: '18h ago', ready: true },
  { name: 'macos-runner-01-snap-20260605', vm: 'macos-runner-01', phase: 'Succeeded', size: '12.8GB', createdAt: '2d ago', ready: true },
  { name: 'legacy-app-vm-snap-20260604', vm: 'legacy-app-vm', phase: 'Succeeded', size: '2.1GB', createdAt: '3d ago', ready: true },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function KubeVirtPanel() {
  const [visible, setVisible] = useState(false);
  const [vmRows, setVmRows] = useState(0);
  const [snapRows, setSnapRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const vmMigrationsTotal = useCounter(284, 1, 1200);
  const vCPUHoursTotal = useCounter(28400, 12, 700);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const v = setInterval(() => setVmRows((x) => Math.min(x + 1, VMS.length)), 160);
    const s = setInterval(() => setSnapRows((x) => Math.min(x + 1, SNAPSHOTS.length)), 140);
    return () => { clearInterval(v); clearInterval(s); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(249,115,22,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(249,115,22,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(249,115,22,0.08)', background: 'rgba(249,115,22,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(249,115,22,0.4)' }}>
          kubevirt -- vms on kubernetes -- virtual machines / snapshots / migrations
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {VMS.filter(v => v.status === 'Running').length} running
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>virtctl@cluster</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>kubectl get vmi --all-namespaces && virtctl list snapshots --all-namespaces</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'vcpu hours', value: vCPUHoursTotal.toLocaleString(), color: '#f97316' },
          { label: 'migrations', value: vmMigrationsTotal.toLocaleString(), color: '#4ade80' },
          { label: 'vms', value: VMS.length.toString(), color: '#67e8f9' },
          { label: 'running', value: VMS.filter(v => v.status === 'Running').length.toString(), color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Virtual Machines */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // virtual machines
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {VMS.slice(0, vmRows).map((vm) => (
            <div key={vm.name} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 20px 28px 36px 72px 48px', alignItems: 'center', gap: 8, padding: '5px 8px', background: vm.status === 'Running' ? 'rgba(249,115,22,0.05)' : 'rgba(249,115,22,0.03)', border: `1px solid ${vm.status === 'Running' ? 'rgba(249,115,22,0.15)' : 'rgba(249,115,22,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vm.name}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vm.namespace}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{vm.cpu}c</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{vm.memGB}G</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{vm.disk}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vm.node}</span>
              <span style={{ color: vm.status === 'Running' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{vm.status}</span>
            </div>
          ))}
        </div>

        {/* Snapshots */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // vm snapshots
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SNAPSHOTS.slice(0, snapRows).map((snap) => (
            <div key={snap.name} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 44px 40px 24px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{snap.name}</span>
              <span style={{ color: '#f97316', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{snap.vm}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{snap.size}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{snap.createdAt}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{snap.ready ? 'ok' : 'err'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          kubevirt v1.3 - apache-2.0 - virtual machines on kubernetes
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {vCPUHoursTotal.toLocaleString()} vcpu-hrs - {vmMigrationsTotal.toLocaleString()} migrations
        </span>
      </div>
    </div>
  );
}
