'use client';

import { useState, useEffect, useRef } from 'react';

interface JwtSection {
  label:  string;
  color:  string;
  fields: { key: string; val: string; note?: string }[];
}

const HEADER_FIELDS = [
  { key: 'alg', val: '"ES256"',      note: '// elliptic curve — smaller, faster than RS256' },
  { key: 'typ', val: '"JWT"' },
  { key: 'kid', val: '"key-2030-a"', note: '// key rotation id' },
];

const PAYLOAD_FIELDS = [
  { key: 'sub',   val: '"u_01J9KM3R8XH7QB42VPEWZN5GT"', note: '// user id' },
  { key: 'email', val: '"lewis@construxgroup.io"' },
  { key: 'name',  val: '"Lewis Wilson"' },
  { key: 'role',  val: '"admin"' },
  { key: 'plan',  val: '"pro"' },
  { key: 'iss',   val: '"https://construxgroup.io"', note: '// issuer' },
  { key: 'aud',   val: '"https://api.construxgroup.io"', note: '// audience' },
  { key: 'iat',   val: '1750492800', note: '// 2030-06-21T08:00:00Z' },
  { key: 'exp',   val: '1750579200', note: '// 2030-06-22T08:00:00Z · 24h' },
  { key: 'nbf',   val: '1750492800', note: '// not before' },
  { key: 'jti',   val: '"sess_abc123xyz"', note: '// session id (for revocation)' },
];

const SECTIONS: JwtSection[] = [
  { label: 'HEADER',    color: '#f97316', fields: HEADER_FIELDS },
  { label: 'PAYLOAD',   color: '#a78bfa', fields: PAYLOAD_FIELDS },
  { label: 'SIGNATURE', color: '#4ade80', fields: [
    { key: 'algo',   val: 'ECDSA-SHA256' },
    { key: 'valid',  val: 'true ✓', note: '// verified against public key key-2030-a' },
    { key: 'expiry', val: 'valid · expires in 23h 47m 12s' },
  ]},
];

const TOKEN = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleS0yMDMwLWEifQ.eyJzdWIiOiJ1XzAxSjlLTTNSOFhIN1FCNDJWUEVXWk41R1QiLCJlbWFpbCI6Imxld2lzQGNvbnN0cnV4Z3JvdXAuaW8iLCJuYW1lIjoiTGV3aXMgV2lsc29uIiwicm9sZSI6ImFkbWluIiwicGxhbiI6InBybyIsImlzcyI6Imh0dHBzOi8vY29uc3RydXhncm91cC5pbyIsImF1ZCI6Imh0dHBzOi8vYXBpLmNvbnN0cnV4Z3JvdXAuaW8iLCJpYXQiOjE3NTA0OTI4MDAsImV4cCI6MTc1MDU3OTIwMCwibmJmIjoxNzUwNDkyODAwLCJqdGkiOiJzZXNzX2FiYzEyM3h5eiJ9.SIG_REDACTED';

function valColor(val: string, key: string): string {
  if (val === 'true ✓')              return '#4ade80';
  if (val.startsWith('valid'))       return '#4ade80';
  if (val.startsWith('"admin"'))     return '#f97316';
  if (val.startsWith('"pro"'))       return '#a78bfa';
  if (val.startsWith('"ES256"'))     return '#67e8f9';
  if (/^\d+$/.test(val))             return '#fbbf24';
  if (val.startsWith('"http'))       return '#60a5fa';
  if (val.startsWith('"u_'))         return '#67e8f9';
  return 'rgba(240,239,255,0.6)';
}

const TOTAL = 3 + HEADER_FIELDS.length + PAYLOAD_FIELDS.length + 3 + 2;

export default function CurlJwtPanel() {
  const [revealed, setRevealed]    = useState(0);
  const [countdown, setCountdown]  = useState('23h 47m 12s');
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 68);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= TOTAL) return;
    let secs = 23 * 3600 + 47 * 60 + 12;
    const id = setInterval(() => {
      secs = Math.max(0, secs - 1);
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      setCountdown(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(id);
  }, [revealed]);

  const allDone = revealed > TOTAL;
  let step = revealed;

  function show(n: number): boolean {
    if (!allDone) {
      const res = step > 0;
      step--;
      return res;
    }
    return true;
  }

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
          construx@sys — jwt decode
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `valid · ${countdown}` : 'decoding…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          curl -s api.construxgroup.io/auth | jq -r .token | jwt decode -
        </span>
      </div>

      {/* Token string */}
      {show(1) && (
        <div className="px-4 pt-2 pb-1 text-[7.5px] break-all" style={{ color: 'rgba(240,239,255,0.15)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ color: 'rgba(249,115,22,0.5)' }}>{TOKEN.split('.')[0]}</span>
          <span style={{ color: 'rgba(255,255,255,0.08)' }}>.</span>
          <span style={{ color: 'rgba(167,139,250,0.5)' }}>{TOKEN.split('.')[1]}</span>
          <span style={{ color: 'rgba(255,255,255,0.08)' }}>.</span>
          <span style={{ color: 'rgba(74,222,128,0.35)' }}>[SIGNATURE]</span>
        </div>
      )}

      {/* Sections */}
      <div className="px-4 py-2 space-y-3">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            {show(1) && (
              <div className="text-[8px] mb-0.5" style={{ color: `${section.color}80` }}>
                ── {section.label} ──────────────────
              </div>
            )}
            <div className="space-y-0.5">
              {section.fields.map((field) => (
                show(1) ? (
                  <div key={field.key} className="flex items-start text-[8px] leading-[1.6]">
                    <span style={{ color: 'rgba(240,239,255,0.28)', minWidth: '60px', flexShrink: 0 }}>
                      {field.key}
                    </span>
                    <span style={{ color: 'rgba(240,239,255,0.18)', flexShrink: 0, marginRight: '6px' }}>:</span>
                    <span style={{ color: valColor(field.val.replace('{{COUNTDOWN}}', countdown), field.key), flexShrink: 0 }}>
                      {field.val === 'valid · expires in 23h 47m 12s'
                        ? `valid · expires in ${countdown}`
                        : field.val}
                    </span>
                    {field.note && (
                      <span style={{ color: 'rgba(240,239,255,0.15)', marginLeft: '10px', flexShrink: 0 }}>
                        {field.note}
                      </span>
                    )}
                  </div>
                ) : null
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          jwt-cli 6.1 · es256 · ecdsa-sha256 · p-256 curve
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● valid' : 'decoding'}
        </span>
      </div>
    </div>
  );
}
