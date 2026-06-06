'use client';

import { useState, useEffect, useRef } from 'react';

interface CertField {
  label:     string;
  value:     string;
  highlight?: boolean;
  indent?:   number;
  comment?:  boolean;
  blank?:    boolean;
}

const CERT_FIELDS: CertField[] = [
  { label: '', value: '', blank: true },
  { label: 'Connection', value: 'construxgroup.io:443', highlight: true },
  { label: 'Protocol',   value: 'TLSv1.3',              highlight: true },
  { label: 'Cipher',     value: 'TLS_AES_256_GCM_SHA384' },
  { label: 'Server temp key', value: 'ECDH P-256, 256 bits' },
  { label: '', value: '', blank: true },
  { label: '--- Certificate ---', value: '', comment: true },
  { label: 'Version',    value: '3 (0x2)' },
  { label: 'Serial',     value: '04:e1:ae:93:f7:2b:3d:99:c1:80:72:6e:a1:d4:0c:f2:88:9a' },
  { label: 'Algorithm',  value: 'sha256WithRSAEncryption' },
  { label: '', value: '', blank: true },
  { label: '--- Issuer ---', value: '', comment: true },
  { label: 'Organization', value: "Let's Encrypt", indent: 1 },
  { label: 'Common Name', value: 'R10', indent: 1 },
  { label: 'Country',     value: 'US', indent: 1 },
  { label: '', value: '', blank: true },
  { label: '--- Subject ---', value: '', comment: true },
  { label: 'Common Name', value: 'construxgroup.io', indent: 1, highlight: true },
  { label: '', value: '', blank: true },
  { label: '--- Validity ---', value: '', comment: true },
  { label: 'Not Before', value: 'Nov 15 00:00:00 2028 GMT', indent: 1 },
  { label: 'Not After',  value: 'Feb 13 23:59:59 2029 GMT', indent: 1, highlight: true },
  { label: '', value: '', blank: true },
  { label: '--- Public Key ---', value: '', comment: true },
  { label: 'Algorithm', value: 'id-ecPublicKey (ECDSA)', indent: 1 },
  { label: 'Curve',     value: 'P-256 (secp256r1)', indent: 1 },
  { label: 'Key size',  value: '256 bits', indent: 1 },
  { label: '', value: '', blank: true },
  { label: '--- Extensions ---', value: '', comment: true },
  { label: 'SANs', value: 'DNS:construxgroup.io, DNS:www.construxgroup.io', indent: 1, highlight: true },
  { label: 'Key Usage', value: 'Digital Signature, Key Agreement', indent: 1 },
  { label: 'CA',        value: 'FALSE', indent: 1 },
  { label: 'OCSP',      value: 'http://r10.o.lencr.org', indent: 1 },
  { label: 'CA Issuers', value: 'http://r10.i.lencr.org', indent: 1 },
  { label: 'CT SCTs',   value: '2 embedded timestamps', indent: 1 },
  { label: '', value: '', blank: true },
  { label: '--- OCSP Status ---', value: '', comment: true },
  { label: 'Status',      value: 'good', indent: 1, highlight: true },
  { label: 'This update', value: 'Feb 10 06:00:00 2029 GMT', indent: 1 },
  { label: 'Next update', value: 'Feb 17 06:00:00 2029 GMT', indent: 1 },
  { label: '', value: '', blank: true },
];

export default function SslCertPanel() {
  const [revealed, setRevealed] = useState(0);
  const [done, setDone]         = useState(false);
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
    if (revealed === 0 || revealed > CERT_FIELDS.length) {
      if (revealed > CERT_FIELDS.length) setDone(true);
      return;
    }
    const field = CERT_FIELDS[revealed - 1];
    const delay = field.blank ? 25 : field.comment ? 50 : 65;
    const id = setTimeout(() => setRevealed((r) => r + 1), delay);
    return () => clearTimeout(id);
  }, [revealed]);

  const visibleFields = CERT_FIELDS.slice(0, revealed);

  return (
    <div
      ref={ref}
      className="overflow-hidden font-mono"
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
          construx@sys — ssl certificate
        </span>
        <span
          className="text-[8px] uppercase tracking-widest flex items-center gap-1.5"
          style={{ color: 'rgba(74,222,128,0.55)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: '#4ade80', boxShadow: '0 0 4px rgba(74,222,128,0.7)' }}
          />
          verified
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          openssl s_client -connect construxgroup.io:443 -showcerts &lt;/dev/null 2&gt;&amp;1
        </span>
      </div>

      {/* Fields */}
      <div className="px-4 py-3 space-y-0">
        {visibleFields.map((field, i) => {
          if (field.blank) {
            return <div key={i} className="h-2" />;
          }
          if (field.comment) {
            return (
              <div key={i} className="py-0.5">
                <span className="text-[8px]" style={{ color: 'rgba(240,239,255,0.18)' }}>
                  {field.label}
                </span>
              </div>
            );
          }
          const indent = field.indent ? field.indent * 16 : 0;
          return (
            <div
              key={i}
              className="flex items-baseline gap-2 py-px"
              style={{ paddingLeft: indent }}
            >
              <span
                className="text-[8px] uppercase tracking-wider flex-shrink-0"
                style={{
                  color:     'rgba(255,255,255,0.22)',
                  minWidth:  '88px',
                }}
              >
                {field.label}
              </span>
              <span
                className="text-[8px] tabular-nums"
                style={{
                  color:      field.highlight ? '#4ade80' : 'rgba(240,239,255,0.6)',
                  fontWeight: field.highlight ? 600 : 400,
                  wordBreak:  'break-all',
                }}
              >
                {field.value}
              </span>
            </div>
          );
        })}

        {/* Blinking cursor while revealing */}
        {!done && revealed > 0 && (
          <div className="py-px">
            <span className="text-[8px] animate-pulse" style={{ color: 'rgba(74,222,128,0.5)' }}>▋</span>
          </div>
        )}
      </div>

      {/* Verification badge */}
      {done && (
        <div
          className="px-4 py-2 flex items-center gap-2 select-none"
          style={{ borderTop: '1px solid rgba(74,222,128,0.12)', background: 'rgba(74,222,128,0.04)' }}
        >
          <span className="text-[8px]" style={{ color: '#4ade80' }}>●</span>
          <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.7)' }}>
            Certificate valid · TLSv1.3 · P-256 ECDSA · Let&apos;s Encrypt R10 · OCSP good
          </span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          openssl 3.2.1 · depth 2 · chain verified
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          NIST P-256
        </span>
      </div>
    </div>
  );
}
