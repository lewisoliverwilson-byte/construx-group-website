'use client';

import { useState, useEffect, useRef } from 'react';

interface SshHost {
  host:         string;
  hostname:     string;
  user:         string;
  port:         number;
  identityFile: string;
  forwardAgent: boolean;
  extra?:       string;
  accent:       string;
}

const HOSTS: SshHost[] = [
  { host: 'github.com',     hostname: 'github.com',              user: 'git',      port: 22,   identityFile: '~/.ssh/id_ed25519_github',  forwardAgent: false, accent: '#F97316' },
  { host: 'construx-prod',  hostname: '185.12.44.201',           user: 'deploy',   port: 22,   identityFile: '~/.ssh/id_ed25519_construx', forwardAgent: true,  accent: '#67e8f9' },
  { host: 'construx-stage', hostname: '185.12.44.202',           user: 'deploy',   port: 22,   identityFile: '~/.ssh/id_ed25519_construx', forwardAgent: false, accent: '#67e8f9', extra: 'StrictHostKeyChecking no' },
  { host: 'scoutr-worker',  hostname: '10.0.1.42',               user: 'ubuntu',   port: 22,   identityFile: '~/.ssh/id_ed25519_scoutr',   forwardAgent: false, accent: '#a78bfa' },
  { host: 'hyve-ctx',       hostname: '10.0.2.18',               user: 'ubuntu',   port: 2222, identityFile: '~/.ssh/id_ed25519_hyve',     forwardAgent: true,  accent: '#4ade80' },
  { host: 'db-primary',     hostname: '10.0.3.5',                user: 'postgres', port: 5432, identityFile: '~/.ssh/id_ed25519_infra',    forwardAgent: false, accent: '#fbbf24', extra: 'LocalForward 15432 localhost:5432' },
  { host: 'bastion',        hostname: '185.12.44.100',           user: 'lewis',    port: 22,   identityFile: '~/.ssh/id_ed25519_construx', forwardAgent: true,  extra: 'ControlMaster auto', accent: '#f87171' },
  { host: 'marqet-cdn',     hostname: 'edge.themarqet.io',       user: 'deploy',   port: 22,   identityFile: '~/.ssh/id_ed25519_marqet',   forwardAgent: false, accent: '#67e8f9' },
  { host: 'infra-monitor',  hostname: '10.0.4.9',                user: 'ubuntu',   port: 22,   identityFile: '~/.ssh/id_ed25519_infra',    forwardAgent: false, accent: '#a78bfa' },
];

export default function SshConfigPanel() {
  const [revealed, setRevealed] = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > HOSTS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 95);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone = revealed > HOSTS.length;

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
          construx@sys — ssh config
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(103,232,249,0.6)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${HOSTS.length} hosts` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          cat ~/.ssh/config
        </span>
      </div>

      {/* Host entries */}
      <div className="px-4 py-3 space-y-3">
        {HOSTS.slice(0, revealed).map((h, i) => (
          <div key={i} className="text-[8px]">
            {/* Host line */}
            <div className="flex items-center gap-2 mb-0.5">
              <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '68px', flexShrink: 0 }}>Host</span>
              <span style={{ color: h.accent, fontWeight: 700 }}>{h.host}</span>
            </div>
            {/* HostName */}
            <div className="flex items-center gap-2 mb-0.5 pl-2">
              <span style={{ color: 'rgba(240,239,255,0.18)', minWidth: '66px', flexShrink: 0 }}>HostName</span>
              <span style={{ color: 'rgba(240,239,255,0.45)' }}>{h.hostname}</span>
            </div>
            {/* User */}
            <div className="flex items-center gap-2 mb-0.5 pl-2">
              <span style={{ color: 'rgba(240,239,255,0.18)', minWidth: '66px', flexShrink: 0 }}>User</span>
              <span style={{ color: '#4ade80' }}>{h.user}</span>
            </div>
            {/* Port */}
            {h.port !== 22 && (
              <div className="flex items-center gap-2 mb-0.5 pl-2">
                <span style={{ color: 'rgba(240,239,255,0.18)', minWidth: '66px', flexShrink: 0 }}>Port</span>
                <span style={{ color: '#fbbf24' }}>{h.port}</span>
              </div>
            )}
            {/* IdentityFile */}
            <div className="flex items-center gap-2 mb-0.5 pl-2">
              <span style={{ color: 'rgba(240,239,255,0.18)', minWidth: '66px', flexShrink: 0 }}>IdentityFile</span>
              <span style={{ color: '#a78bfa' }}>{h.identityFile}</span>
            </div>
            {/* ForwardAgent */}
            {h.forwardAgent && (
              <div className="flex items-center gap-2 mb-0.5 pl-2">
                <span style={{ color: 'rgba(240,239,255,0.18)', minWidth: '66px', flexShrink: 0 }}>ForwardAgent</span>
                <span style={{ color: '#67e8f9' }}>yes</span>
              </div>
            )}
            {/* Extra */}
            {h.extra && (
              <div className="flex items-center gap-2 mb-0.5 pl-2">
                <span style={{ color: 'rgba(240,239,255,0.18)', minWidth: '66px', flexShrink: 0 }}>{h.extra.split(' ')[0]}</span>
                <span style={{ color: 'rgba(240,239,255,0.3)' }}>{h.extra.split(' ').slice(1).join(' ')}</span>
              </div>
            )}
            {/* Separator */}
            {i < HOSTS.length - 1 && (
              <div className="mt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }} />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          {HOSTS.length} hosts · id_ed25519 · openssh 9.7
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          ~/.ssh/config
        </span>
      </div>
    </div>
  );
}
