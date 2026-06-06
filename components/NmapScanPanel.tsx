'use client';

import { useState, useEffect, useRef } from 'react';

interface PortEntry {
  port:     string;
  state:    'open' | 'filtered' | 'closed';
  service:  string;
  version:  string;
  accent:   string;
}

const PORTS: PortEntry[] = [
  { port: '22/tcp',   state: 'open',     service: 'ssh',     version: 'OpenSSH 9.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)', accent: '#4ade80' },
  { port: '80/tcp',   state: 'open',     service: 'http',    version: 'nginx 1.25.4 (redirects to https)', accent: '#F97316' },
  { port: '443/tcp',  state: 'open',     service: 'https',   version: 'nginx 1.25.4 | TLSv1.3 | P-256 ECDSA', accent: '#F97316' },
  { port: '3000/tcp', state: 'filtered', service: 'ppp',     version: '', accent: 'rgba(240,239,255,0.2)' },
  { port: '5432/tcp', state: 'filtered', service: 'postgresql', version: '', accent: 'rgba(240,239,255,0.2)' },
  { port: '6379/tcp', state: 'filtered', service: 'redis',   version: '', accent: 'rgba(240,239,255,0.2)' },
  { port: '8080/tcp', state: 'filtered', service: 'http-alt', version: '', accent: 'rgba(240,239,255,0.2)' },
  { port: '9090/tcp', state: 'filtered', service: 'zeus-admin', version: '', accent: 'rgba(240,239,255,0.2)' },
];

const LINES_BEFORE_PORTS = [
  { text: 'Starting Nmap 7.95 ( https://nmap.org )',    color: 'rgba(240,239,255,0.4)'  },
  { text: 'Nmap scan report for construxgroup.io (188.245.54.12)', color: '#F97316'    },
  { text: 'Host is up (0.0082s latency).',              color: '#4ade80'               },
  { text: 'rDNS record: static.12.54.245.188.clients.construxgroup.io', color: 'rgba(240,239,255,0.25)' },
  { text: 'Not shown: 992 closed tcp ports (reset)',    color: 'rgba(240,239,255,0.2)' },
];

const LINES_AFTER_PORTS = [
  { text: 'Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel', color: 'rgba(240,239,255,0.25)' },
  { text: '',                                                         color: ''                       },
  { text: 'OS detection performed. Please report any incorrect results at https://nmap.org/submit/', color: 'rgba(240,239,255,0.15)' },
  { text: 'Nmap done: 1 IP address (1 host up) scanned in 12.84 seconds', color: '#4ade80'            },
];

function stateColor(state: PortEntry['state']): string {
  if (state === 'open')     return '#4ade80';
  if (state === 'filtered') return '#fbbf24';
  return 'rgba(240,239,255,0.2)';
}

export default function NmapScanPanel() {
  const [step, setStep] = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const totalSteps = LINES_BEFORE_PORTS.length + PORTS.length + LINES_AFTER_PORTS.length + 1;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setStep(1);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (step === 0 || step > totalSteps) return;
    const delay = step <= LINES_BEFORE_PORTS.length ? 60
                : step <= LINES_BEFORE_PORTS.length + PORTS.length ? 80
                : 55;
    const id = setTimeout(() => setStep((s) => s + 1), delay);
    return () => clearTimeout(id);
  }, [step, totalSteps]);

  const openPorts = PORTS.filter((p) => p.state === 'open').length;

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
          construx@sys — port scan
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.2)' }}>
          {openPorts} open · {PORTS.length - openPorts} filtered
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          nmap -sV -O --open -T4 construxgroup.io
        </span>
      </div>

      {/* Scan output */}
      <div className="px-4 py-2.5 space-y-0.5">
        {/* Header lines */}
        {LINES_BEFORE_PORTS.map((line, i) =>
          step > i ? (
            <div key={i} className="text-[8px]" style={{ color: line.color }}>{line.text}</div>
          ) : null
        )}

        {/* Port table header */}
        {step > LINES_BEFORE_PORTS.length && (
          <div className="flex items-center gap-2 text-[7px] uppercase tracking-wider mt-1 mb-0.5"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            <span style={{ minWidth: '80px' }}>PORT</span>
            <span style={{ minWidth: '68px' }}>STATE</span>
            <span style={{ minWidth: '100px' }}>SERVICE</span>
            <span>VERSION</span>
          </div>
        )}

        {/* Port rows */}
        {PORTS.map((p, i) => {
          const rowStep = LINES_BEFORE_PORTS.length + 1 + i;
          return step > rowStep ? (
            <div key={p.port} className="flex items-start gap-2 text-[8px]">
              <span style={{ color: p.accent, minWidth: '80px', flexShrink: 0 }}>{p.port}</span>
              <span style={{ color: stateColor(p.state), minWidth: '68px', flexShrink: 0 }}>{p.state}</span>
              <span style={{ color: 'rgba(240,239,255,0.4)', minWidth: '100px', flexShrink: 0 }}>{p.service}</span>
              <span style={{ color: 'rgba(240,239,255,0.25)', fontSize: '7px' }}>{p.version}</span>
            </div>
          ) : null;
        })}

        {/* Footer lines */}
        {LINES_AFTER_PORTS.map((line, i) => {
          const lineStep = LINES_BEFORE_PORTS.length + PORTS.length + 1 + i;
          return step > lineStep && line.text ? (
            <div key={i} className="text-[8px] mt-1" style={{ color: line.color }}>{line.text}</div>
          ) : null;
        })}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          nmap 7.95 · stealth syn scan · version detection
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          188.245.54.12 · hetzner eu-west
        </span>
      </div>
    </div>
  );
}
