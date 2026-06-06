'use client';

import { useState, useEffect, useRef } from 'react';

interface SecretEntry {
  path:      string;
  version:   number;
  created:   string;
  ttl:       string;
  engine:    'kv' | 'database' | 'pki' | 'aws';
  status:    'active' | 'revoked' | 'expiring';
  fields:    string[];
}

const SECRETS: SecretEntry[] = [
  { path: 'construx/api',              version: 14, created: '2030-11-18 09:12:04', ttl: '∞',      engine: 'kv',       status: 'active',   fields: ['stripe_key', 'sendgrid_key', 'jwt_secret', 'webhook_secret'] },
  { path: 'construx/db-admin',         version:  3, created: '2030-11-01 00:00:00', ttl: '∞',      engine: 'kv',       status: 'active',   fields: ['username', 'password', 'host', 'port'] },
  { path: 'construx/cloudflare',       version:  7, created: '2030-10-15 14:33:21', ttl: '∞',      engine: 'kv',       status: 'active',   fields: ['api_token', 'zone_id', 'account_id'] },
  { path: 'construx/posthog',          version:  2, created: '2030-09-02 08:00:00', ttl: '∞',      engine: 'kv',       status: 'active',   fields: ['project_api_key', 'personal_api_key'] },
  { path: 'construx/amplify',          version:  5, created: '2030-08-11 11:44:18', ttl: '∞',      engine: 'kv',       status: 'active',   fields: ['access_key_id', 'secret_access_key', 'region'] },
  { path: 'database/creds/construx-api', version: 0, created: '2030-11-18 08:58:01', ttl: '58m12s', engine: 'database', status: 'active',   fields: ['username', 'password'] },
  { path: 'database/creds/construx-ro',  version: 0, created: '2030-11-18 06:00:03', ttl: '7m44s',  engine: 'database', status: 'expiring',  fields: ['username', 'password'] },
  { path: 'database/creds/construx-bg',  version: 0, created: '2030-11-17 22:00:00', ttl: 'revoked',engine: 'database', status: 'revoked',   fields: ['username', 'password'] },
  { path: 'pki/issue/construxgroup-io',  version: 0, created: '2030-11-01 00:00:00', ttl: '29d',    engine: 'pki',      status: 'active',   fields: ['certificate', 'private_key', 'ca_chain'] },
  { path: 'aws/creds/construx-deploy',   version: 0, created: '2030-11-18 09:00:00', ttl: '59m58s', engine: 'aws',      status: 'active',   fields: ['access_key', 'secret_key', 'security_token'] },
  { path: 'construx/railway',          version:  4, created: '2030-10-01 00:00:00', ttl: '∞',      engine: 'kv',       status: 'active',   fields: ['api_key', 'project_id', 'environment_id'] },
  { path: 'construx/resend',           version:  2, created: '2030-09-15 10:22:00', ttl: '∞',      engine: 'kv',       status: 'active',   fields: ['api_key', 'from_address', 'reply_to'] },
];

interface AuditRow {
  time:      string;
  op:        string;
  path:      string;
  client:    string;
  outcome:   'ok' | 'denied';
}

const AUDIT: AuditRow[] = [
  { time: '09:12:07', op: 'read',  path: 'construx/data/api',            client: 'k8s/construx-api-7d9f',  outcome: 'ok' },
  { time: '09:11:58', op: 'read',  path: 'database/creds/construx-api',  client: 'k8s/construx-api-7d9f',  outcome: 'ok' },
  { time: '09:11:44', op: 'read',  path: 'aws/creds/construx-deploy',    client: 'approle/ci-pipeline',    outcome: 'ok' },
  { time: '09:10:12', op: 'write', path: 'construx/data/api',            client: 'token/lewis',            outcome: 'ok' },
  { time: '09:08:33', op: 'read',  path: 'pki/issue/construxgroup-io',   client: 'certbot/renewal',        outcome: 'ok' },
  { time: '09:05:01', op: 'read',  path: 'construx/data/admin',          client: 'approle/unknown',        outcome: 'denied' },
];

function engineColor(e: SecretEntry['engine']): string {
  if (e === 'kv')       return '#60a5fa';
  if (e === 'database') return '#f97316';
  if (e === 'pki')      return '#4ade80';
  return '#fbbf24';
}

function statusColor(s: SecretEntry['status']): string {
  if (s === 'active')   return '#4ade80';
  if (s === 'expiring') return '#fbbf24';
  return '#f87171';
}

function outcomeColor(o: AuditRow['outcome']): string {
  return o === 'ok' ? 'rgba(74,222,128,0.5)' : '#f87171';
}

const TOTAL = SECRETS.length + AUDIT.length;

export default function VaultSecretsPanel() {
  const [revealed, setRevealed] = useState(0);
  const [liveTtl,  setLiveTtl]  = useState('58m12s');
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
    const id = setTimeout(() => setRevealed((r) => r + 1), 80);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= TOTAL) return;
    const id = setInterval(() => {
      const mins = Math.floor(Math.random() * 59);
      const secs = Math.floor(Math.random() * 60);
      setLiveTtl(`${mins}m${secs < 10 ? '0' : ''}${secs}s`);
    }, 2500);
    return () => clearInterval(id);
  }, [revealed]);

  const allDone = revealed > TOTAL;

  const shownSecrets = SECRETS.slice(0, Math.max(0, Math.min(SECRETS.length, revealed)));
  const shownAudit   = AUDIT.slice(0, Math.max(0, Math.min(AUDIT.length, revealed - SECRETS.length)));

  const active   = SECRETS.filter((s) => s.status === 'active').length;
  const expiring = SECRETS.filter((s) => s.status === 'expiring').length;
  const revoked  = SECRETS.filter((s) => s.status === 'revoked').length;

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
          construx@vault — vault kv list construx/
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${active} active` : 'reading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@vault:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>vault secrets list --detailed</span>
      </div>

      {/* Column headers */}
      {shownSecrets.length > 0 && (
        <div
          className="flex items-center px-4 py-1 text-[7px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.16)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ minWidth: '228px', flexShrink: 0 }}>Path</span>
          <span style={{ minWidth: '60px',  flexShrink: 0 }}>Engine</span>
          <span style={{ minWidth: '76px',  flexShrink: 0 }}>TTL / Lease</span>
          <span style={{ minWidth: '64px',  flexShrink: 0 }}>Status</span>
          <span>Fields</span>
        </div>
      )}

      {/* Secret rows */}
      <div className="px-4 py-1.5 space-y-0.5">
        {shownSecrets.map((s, i) => (
          <div key={i} className="flex items-start text-[8px] leading-[1.65]">
            <span style={{ color: 'rgba(240,239,255,0.55)', minWidth: '228px', flexShrink: 0, fontWeight: 500 }}>
              {s.path}
            </span>
            <span style={{ color: engineColor(s.engine), minWidth: '60px', flexShrink: 0 }}>
              {s.engine}
            </span>
            <span style={{ color: s.status === 'expiring' ? '#fbbf24' : 'rgba(240,239,255,0.25)', minWidth: '76px', flexShrink: 0 }}>
              {s.path.includes('construx-api') && s.engine === 'database' ? liveTtl : s.ttl}
            </span>
            <span style={{ color: statusColor(s.status), minWidth: '64px', flexShrink: 0, fontWeight: 600 }}>
              {s.status}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.2)' }}>
              {s.fields.join(', ')}
            </span>
          </div>
        ))}
        {allDone && (
          <div className="text-[8px] mt-0.5" style={{ color: 'rgba(74,222,128,0.3)' }}>▌</div>
        )}
      </div>

      {/* Audit log */}
      {shownAudit.length > 0 && (
        <div className="px-4 py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — audit log · last 6 events
          </div>
          {shownAudit.map((a, i) => (
            <div key={i} className="flex items-center text-[8px] leading-[1.65] gap-2">
              <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '52px', flexShrink: 0 }}>{a.time}</span>
              <span style={{ color: a.op === 'write' ? '#fbbf24' : '#60a5fa', minWidth: '40px', flexShrink: 0 }}>{a.op}</span>
              <span style={{ color: 'rgba(240,239,255,0.4)', minWidth: '220px', flexShrink: 0 }}>{a.path}</span>
              <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '168px', flexShrink: 0 }}>{a.client}</span>
              <span style={{ color: outcomeColor(a.outcome), fontWeight: 600 }}>
                {a.outcome === 'ok' ? '✓ ok' : '✗ denied'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-4 px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>{active} active</span>
          {expiring > 0 && <span style={{ color: '#fbbf24' }}>{expiring} expiring</span>}
          {revoked  > 0 && <span style={{ color: '#f87171' }}>{revoked} revoked</span>}
          <span className="ml-auto">{SECRETS.length} leases total</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          vault 1.17.2 · construx.vault.svc · unsealed
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● sealed: false' : 'loading'}
        </span>
      </div>
    </div>
  );
}
