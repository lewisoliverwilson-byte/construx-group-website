'use client';

import { useState, useEffect, useRef } from 'react';

interface AuditLine {
  tag:   'good' | 'warn' | 'fail' | 'info' | 'header' | 'sep';
  text:  string;
}

const LINES: AuditLine[] = [
  { tag: 'header', text: '# target: construxgroup.io:22' },
  { tag: 'header', text: '# server software: OpenSSH_9.7p1 Debian-5+deb12u1' },
  { tag: 'sep',    text: '' },
  { tag: 'info',   text: '# key exchange algorithms' },
  { tag: 'good',   text: '[good] kex: curve25519-sha256 -- [info] available since OpenSSH 6.5' },
  { tag: 'good',   text: '[good] kex: curve25519-sha256@libssh.org' },
  { tag: 'good',   text: '[good] kex: diffie-hellman-group16-sha512' },
  { tag: 'good',   text: '[good] kex: diffie-hellman-group18-sha512' },
  { tag: 'sep',    text: '' },
  { tag: 'info',   text: '# host-key algorithms' },
  { tag: 'good',   text: '[good] key: ssh-ed25519 -- [info] 256-bit, available since OpenSSH 6.5' },
  { tag: 'good',   text: '[good] key: rsa-sha2-256 -- [info] 4096-bit RSA' },
  { tag: 'good',   text: '[good] key: rsa-sha2-512 -- [info] 4096-bit RSA' },
  { tag: 'sep',    text: '' },
  { tag: 'info',   text: '# encryption algorithms (ciphers)' },
  { tag: 'good',   text: '[good] enc: chacha20-poly1305@openssh.com' },
  { tag: 'good',   text: '[good] enc: aes128-gcm@openssh.com' },
  { tag: 'good',   text: '[good] enc: aes256-gcm@openssh.com' },
  { tag: 'good',   text: '[good] enc: aes128-ctr, aes192-ctr, aes256-ctr' },
  { tag: 'sep',    text: '' },
  { tag: 'info',   text: '# message authentication codes' },
  { tag: 'good',   text: '[good] mac: hmac-sha2-256-etm@openssh.com' },
  { tag: 'good',   text: '[good] mac: hmac-sha2-512-etm@openssh.com' },
  { tag: 'good',   text: '[good] mac: umac-128-etm@openssh.com' },
  { tag: 'sep',    text: '' },
  { tag: 'info',   text: '# hardening recommendations' },
  { tag: 'good',   text: '[good] PasswordAuthentication is disabled' },
  { tag: 'good',   text: '[good] PermitRootLogin is set to prohibit-password' },
  { tag: 'good',   text: '[good] PubkeyAuthentication is enabled' },
  { tag: 'good',   text: '[good] Protocol 2 only' },
  { tag: 'good',   text: '[good] X11Forwarding is disabled' },
  { tag: 'warn',   text: '[warn] MaxAuthTries is set to 6 (recommended: 3 or less)' },
  { tag: 'good',   text: '[good] ClientAliveInterval is set (idle timeout active)' },
  { tag: 'sep',    text: '' },
  { tag: 'good',   text: '[good] overall security rating: A' },
];

function tagColor(t: AuditLine['tag']): string {
  if (t === 'good')   return '#4ade80';
  if (t === 'warn')   return '#fbbf24';
  if (t === 'fail')   return '#f87171';
  if (t === 'info')   return '#67e8f9';
  if (t === 'header') return '#a78bfa';
  return 'transparent';
}

export default function SshAuditPanel() {
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
    if (revealed === 0 || revealed > LINES.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 75);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone  = revealed > LINES.length;
  const displayed = LINES.slice(0, allDone ? LINES.length : revealed);

  const warnCount = displayed.filter((l) => l.tag === 'warn').length;
  const failCount = displayed.filter((l) => l.tag === 'fail').length;
  const goodCount = displayed.filter((l) => l.tag === 'good').length;

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
          construx@sys — ssh-audit
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${goodCount} good · ${warnCount} warn` : 'scanning…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          ssh-audit construxgroup.io
        </span>
      </div>

      {/* Lines */}
      <div className="px-4 py-2 space-y-0.5">
        {displayed.map((l, i) => (
          l.tag === 'sep'
            ? <div key={i} className="h-1" />
            : (
              <div key={i} className="text-[8px] leading-snug" style={{ color: tagColor(l.tag) }}>
                {l.text}
              </div>
            )
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          ssh-audit 3.3 · openssh 9.7 · rating A · 0 failures
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● done' : 'auditing'}
        </span>
      </div>
    </div>
  );
}
