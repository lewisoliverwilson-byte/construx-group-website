'use client';

import { useState, useEffect, useRef } from 'react';

interface CertField {
  label:  string;
  value:  string;
  color?: string;
}

interface CipherEntry {
  label: string;
  value: string;
}

const SUBJECT_FIELDS: CertField[] = [
  { label: 'CN',  value: 'construxgroup.io',   color: '#4ade80'              },
  { label: 'O',   value: 'Construx Group Ltd',  color: 'rgba(240,239,255,0.5)'},
  { label: 'L',   value: 'London',              color: 'rgba(240,239,255,0.3)'},
  { label: 'ST',  value: 'England',             color: 'rgba(240,239,255,0.3)'},
  { label: 'C',   value: 'GB',                  color: 'rgba(240,239,255,0.3)'},
];

const ISSUER_FIELDS: CertField[] = [
  { label: 'CN', value: "Let's Encrypt R11",   color: '#60a5fa'              },
  { label: 'O',  value: "Let's Encrypt",        color: 'rgba(240,239,255,0.3)'},
  { label: 'C',  value: 'US',                   color: 'rgba(240,239,255,0.3)'},
];

const SANS: string[] = [
  'construxgroup.io',
  'www.construxgroup.io',
  'api.construxgroup.io',
  'assets.construxgroup.io',
  'mail.construxgroup.io',
];

const VALIDITY: CertField[] = [
  { label: 'Not Before', value: 'Mar 12 00:00:00 2031 GMT', color: 'rgba(240,239,255,0.35)' },
  { label: 'Not After',  value: 'Jun 10 23:59:59 2031 GMT', color: '#4ade80'                 },
  { label: 'Days Left',  value: '97 days',                  color: '#fbbf24'                 },
];

const CIPHER: CipherEntry[] = [
  { label: 'Protocol',       value: 'TLSv1.3'                     },
  { label: 'Cipher',         value: 'TLS_AES_256_GCM_SHA384'      },
  { label: 'Key Exchange',   value: 'X25519 (ECDH)'               },
  { label: 'Signature Alg',  value: 'sha256WithRSAEncryption'      },
  { label: 'Public Key',     value: 'RSA 4096 bit'                 },
  { label: 'Serial',         value: '04:2f:9a:1b:e3:c6:7d:2a:f1'  },
  { label: 'Fingerprint',    value: 'SHA256:xK9m/2NqrP...'         },
];

const TOTAL = SUBJECT_FIELDS.length + ISSUER_FIELDS.length + SANS.length + VALIDITY.length + CIPHER.length;

export default function CertInfoPanel() {
  const [revealed, setRevealed] = useState(0);
  const [livePing, setLivePing] = useState(18);
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
    const id = setTimeout(() => setRevealed((r) => r + 1), 82);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => {
      setLivePing((v) => Math.max(12, Math.min(38, v + Math.round((Math.random() - 0.5) * 8))));
    }, 2300);
    return () => clearInterval(id);
  }, []);

  const allDone = revealed > TOTAL;

  const subjectOffset = 0;
  const issuerOffset  = SUBJECT_FIELDS.length;
  const sansOffset    = issuerOffset + ISSUER_FIELDS.length;
  const validOffset   = sansOffset + SANS.length;
  const cipherOffset  = validOffset + VALIDITY.length;

  const shownSubject = SUBJECT_FIELDS.slice(0, Math.max(0, Math.min(SUBJECT_FIELDS.length, revealed - subjectOffset)));
  const shownIssuer  = ISSUER_FIELDS.slice(0, Math.max(0, Math.min(ISSUER_FIELDS.length, revealed - issuerOffset)));
  const shownSans    = SANS.slice(0, Math.max(0, Math.min(SANS.length, revealed - sansOffset)));
  const shownValid   = VALIDITY.slice(0, Math.max(0, Math.min(VALIDITY.length, revealed - validOffset)));
  const shownCipher  = CIPHER.slice(0, Math.max(0, Math.min(CIPHER.length, revealed - cipherOffset)));

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
          construx@sys — openssl x509
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${livePing}ms` : 'handshaking…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          openssl s_client -connect construxgroup.io:443 -servername construxgroup.io 2&gt;/dev/null | openssl x509 -noout -text
        </span>
      </div>

      {/* Subject */}
      {shownSubject.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1 select-none" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — SUBJECT
          </div>
          <div className="space-y-0.5">
            {shownSubject.map((f, i) => (
              <div key={i} className="flex items-center text-[7.5px] leading-[1.7]" style={{ borderLeft: '2px solid rgba(74,222,128,0.2)', paddingLeft: '4px' }}>
                <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '24px', flexShrink: 0 }}>{f.label}</span>
                <span style={{ color: 'rgba(240,239,255,0.2)', marginRight: '6px' }}>=</span>
                <span style={{ color: f.color ?? 'rgba(240,239,255,0.4)' }}>{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issuer */}
      {shownIssuer.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1 select-none" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — ISSUER
          </div>
          <div className="space-y-0.5">
            {shownIssuer.map((f, i) => (
              <div key={i} className="flex items-center text-[7.5px] leading-[1.7]" style={{ borderLeft: '2px solid rgba(96,165,250,0.2)', paddingLeft: '4px' }}>
                <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '24px', flexShrink: 0 }}>{f.label}</span>
                <span style={{ color: 'rgba(240,239,255,0.2)', marginRight: '6px' }}>=</span>
                <span style={{ color: f.color ?? 'rgba(240,239,255,0.4)' }}>{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SANs */}
      {shownSans.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1 select-none" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — SUBJECT ALT NAMES ({SANS.length})
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5">
            {shownSans.map((s, i) => (
              <span key={i} className="text-[7.5px]" style={{ color: '#a78bfa' }}>
                DNS:{s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Validity */}
      {shownValid.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1 select-none" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — VALIDITY
          </div>
          <div className="space-y-0.5">
            {shownValid.map((f, i) => (
              <div key={i} className="flex items-center text-[7.5px] leading-[1.7]" style={{ borderLeft: '2px solid rgba(251,191,36,0.2)', paddingLeft: '4px' }}>
                <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '80px', flexShrink: 0 }}>{f.label}</span>
                <span style={{ color: f.color ?? 'rgba(240,239,255,0.4)' }}>{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cipher */}
      {shownCipher.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1 select-none" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — TLS SESSION
          </div>
          <div className="space-y-0.5">
            {shownCipher.map((e, i) => (
              <div key={i} className="flex items-center text-[7.5px] leading-[1.7]" style={{ borderLeft: '2px solid rgba(240,239,255,0.06)', paddingLeft: '4px' }}>
                <span style={{ color: 'rgba(240,239,255,0.28)', minWidth: '112px', flexShrink: 0 }}>{e.label}</span>
                <span style={{ color: 'rgba(240,239,255,0.5)' }}>{e.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>● valid</span>
          <span style={{ color: '#60a5fa' }}>TLSv1.3</span>
          <span style={{ color: '#a78bfa' }}>{SANS.length} SANs</span>
          <span>97 days remaining</span>
          <span className="ml-auto" style={{ color: '#fbbf24' }}>handshake {livePing}ms</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          openssl 3.3.2 · construxgroup.io:443 · letsencrypt r11
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● cert valid' : 'loading'}
        </span>
      </div>
    </div>
  );
}
