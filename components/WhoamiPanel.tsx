'use client';

import { useState, useEffect, useRef } from 'react';

interface Founder {
  uid: number;
  gid: number;
  login: string;
  displayName: string;
  groups: string[];
  shell: string;
  home: string;
  accent: string;
  lastSeen: string;
  publicKey: string;
}

const FOUNDERS: Founder[] = [
  {
    uid:         1001,
    gid:         1001,
    login:       'lewis.wilson',
    displayName: 'Lewis Wilson',
    groups:      ['construx', 'founders', 'engineering', 'product', 'ai-research', 'sudo'],
    shell:       '/bin/zsh',
    home:        '/home/lewis.wilson',
    accent:      '#F97316',
    lastSeen:    'today',
    publicKey:   'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJQ... lewis@construxgroup.io',
  },
  {
    uid:         1002,
    gid:         1001,
    login:       'dan',
    displayName: 'Dan',
    groups:      ['construx', 'founders', 'growth', 'strategy', 'operations', 'sudo'],
    shell:       '/bin/zsh',
    home:        '/home/dan',
    accent:      '#a78bfa',
    lastSeen:    'today',
    publicKey:   'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIN8... dan@construxgroup.io',
  },
];

function FounderCard({ founder, visible }: { founder: Founder; visible: boolean }) {
  const lines = [
    { prompt: true, cmd: `whoami` },
    { out: founder.login, color: founder.accent },
    { prompt: true, cmd: `id ${founder.login}` },
    {
      out: `uid=${founder.uid}(${founder.login}) gid=${founder.gid}(construx) groups=${founder.groups.map((g, i) => `${founder.gid + i}(${g})`).join(',')}`,
      color: 'rgba(240,239,255,0.5)',
      wrap: true,
    },
    { prompt: true, cmd: `finger ${founder.login}` },
    { out: `Login: ${founder.login.padEnd(16)} Name: ${founder.displayName}`, color: 'rgba(240,239,255,0.45)' },
    { out: `Directory: ${founder.home.padEnd(20)} Shell: ${founder.shell}`, color: 'rgba(240,239,255,0.45)' },
    { out: `Last login: ${founder.lastSeen} from construxgroup.io`, color: 'rgba(240,239,255,0.45)' },
    { prompt: true, cmd: `cat ~/.ssh/authorized_keys` },
    { out: founder.publicKey, color: 'rgba(125,211,252,0.45)', wrap: true },
  ];

  return (
    <div
      className="overflow-hidden font-mono text-[8px]"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.25s ease',
        background: 'rgba(0,0,6,0.5)',
        border: `1px solid ${founder.accent}20`,
        borderRadius: '2px',
      }}
    >
      {/* Sub title bar */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 select-none"
        style={{ borderBottom: `1px solid ${founder.accent}18`, background: `${founder.accent}06` }}
      >
        <span style={{ color: `${founder.accent}80`, fontWeight: 700 }}>
          {founder.login}@construx
        </span>
        <span style={{ color: 'rgba(255,255,255,0.15)' }}>—</span>
        <span style={{ color: 'rgba(255,255,255,0.25)' }}>bash</span>
        <span className="ml-auto" style={{ color: `${founder.accent}40` }}>
          uid={founder.uid}
        </span>
      </div>

      {/* Output lines */}
      <div className="px-3 py-2.5 space-y-0.5">
        {lines.map((line, i) => (
          <div
            key={i}
            className={line.wrap ? 'break-all leading-relaxed' : ''}
            style={{
              color: line.prompt
                ? 'rgba(255,255,255,0.22)'
                : line.color,
            }}
          >
            {line.prompt ? (
              <>
                <span style={{ color: `${founder.accent}60` }}>{founder.login}@sys:~$</span>
                {' '}
                <span style={{ color: 'rgba(240,239,255,0.35)' }}>{line.cmd}</span>
              </>
            ) : (
              line.out
            )}
          </div>
        ))}
      </div>

      {/* Capability chips */}
      <div
        className="px-3 py-2 flex flex-wrap gap-1"
        style={{ borderTop: `1px solid ${founder.accent}12` }}
      >
        {founder.groups.map((g) => (
          <span
            key={g}
            className="text-[7px] uppercase tracking-wider px-1.5 py-0.5"
            style={{
              background: `${founder.accent}10`,
              border: `1px solid ${founder.accent}18`,
              color: `${founder.accent}70`,
              borderRadius: '2px',
            }}
          >
            {g}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function WhoamiPanel() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="overflow-hidden font-mono"
      style={{
        background: 'rgba(1,1,10,0.97)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '3px',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.6)',
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
          construx@sys — founder.identity
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.5)' }}>
          {FOUNDERS.length} users
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          for u in $(getent group founders | cut -d: -f4 | tr , ' '); do whoami && id && finger $u; done
        </span>
      </div>

      {/* Founder cards */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {FOUNDERS.map((founder, i) => (
          <FounderCard
            key={founder.login}
            founder={founder}
            visible={visible}
          />
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          /etc/passwd · {FOUNDERS.length} founder accounts
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.4)' }}>
          both: sudo
        </span>
      </div>
    </div>
  );
}
