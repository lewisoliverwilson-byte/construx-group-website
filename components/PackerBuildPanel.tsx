'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind =
  | 'prompt'
  | 'init'
  | 'builder'
  | 'step-header'
  | 'step-output'
  | 'step-ok'
  | 'step-warn'
  | 'artifact'
  | 'ami-id'
  | 'summary'
  | 'blank';

interface PackerLine {
  kind: LineKind;
  text: string;
}

const LINES: PackerLine[] = [
  { kind: 'prompt',      text: 'packer build -var-file=prod.pkrvars.hcl construx-api.pkr.hcl' },
  { kind: 'init',        text: 'packer v1.11.2' },
  { kind: 'blank',       text: '' },
  { kind: 'builder',     text: '==> amazon-ebs.construx-api: Prevalidating any provided VPC information' },
  { kind: 'builder',     text: '==> amazon-ebs.construx-api: Prevalidating AMI Name: construx-api-2031-09-29T10:14:22Z' },
  { kind: 'builder',     text: '==> amazon-ebs.construx-api: Found Image ID: ami-0c55b159cbfafe1f0 (ubuntu 24.04 LTS)' },
  { kind: 'builder',     text: '==> amazon-ebs.construx-api: Creating temporary keypair: packer_66f2a1e4' },
  { kind: 'builder',     text: '==> amazon-ebs.construx-api: Creating temporary security group: packer_66f2a1e4' },
  { kind: 'builder',     text: '==> amazon-ebs.construx-api: Launching a source AWS instance: i-0f4b2c8d1e3a9f7b2' },
  { kind: 'builder',     text: '==> amazon-ebs.construx-api: Waiting for instance (i-0f4b2c8d1e3a9f7b2) to become ready' },
  { kind: 'blank',       text: '' },
  { kind: 'step-header', text: '==> amazon-ebs.construx-api: Provisioning with shell script: scripts/install.sh' },
  { kind: 'step-output', text: '    amazon-ebs.construx-api: Installing system packages...' },
  { kind: 'step-output', text: '    amazon-ebs.construx-api: curl bun unzip git jq awscli2' },
  { kind: 'step-ok',     text: '    amazon-ebs.construx-api: ✓ system packages installed' },
  { kind: 'step-output', text: '    amazon-ebs.construx-api: Installing bun 1.1.38...' },
  { kind: 'step-ok',     text: '    amazon-ebs.construx-api: ✓ bun 1.1.38 installed' },
  { kind: 'blank',       text: '' },
  { kind: 'step-header', text: '==> amazon-ebs.construx-api: Provisioning with shell script: scripts/configure.sh' },
  { kind: 'step-output', text: '    amazon-ebs.construx-api: Configuring systemd service...' },
  { kind: 'step-ok',     text: '    amazon-ebs.construx-api: ✓ construx-api.service installed' },
  { kind: 'step-output', text: '    amazon-ebs.construx-api: Configuring Caddy reverse proxy...' },
  { kind: 'step-ok',     text: '    amazon-ebs.construx-api: ✓ Caddyfile installed' },
  { kind: 'step-output', text: '    amazon-ebs.construx-api: Hardening SSH...' },
  { kind: 'step-ok',     text: '    amazon-ebs.construx-api: ✓ SSH: PasswordAuthentication=no, PermitRootLogin=no' },
  { kind: 'step-output', text: '    amazon-ebs.construx-api: Configuring UFW firewall...' },
  { kind: 'step-ok',     text: '    amazon-ebs.construx-api: ✓ UFW: allow 22,80,443 deny all' },
  { kind: 'blank',       text: '' },
  { kind: 'step-header', text: '==> amazon-ebs.construx-api: Provisioning with Ansible playbook: ansible/hardening.yml' },
  { kind: 'step-ok',     text: '    amazon-ebs.construx-api: PLAY [Harden Ubuntu 24.04] ******************' },
  { kind: 'step-ok',     text: '    amazon-ebs.construx-api: TASK [sysctl kernel hardening] ........... ok' },
  { kind: 'step-ok',     text: '    amazon-ebs.construx-api: TASK [disable unnecessary services] ...... ok' },
  { kind: 'step-ok',     text: '    amazon-ebs.construx-api: TASK [install fail2ban] .................. ok' },
  { kind: 'step-ok',     text: '    amazon-ebs.construx-api: RECAP: 0 failed, 3 changed, 0 unreachable' },
  { kind: 'blank',       text: '' },
  { kind: 'builder',     text: '==> amazon-ebs.construx-api: Stopping the source instance...' },
  { kind: 'builder',     text: '==> amazon-ebs.construx-api: Waiting for the instance to stop...' },
  { kind: 'builder',     text: '==> amazon-ebs.construx-api: Creating AMI: construx-api-2031-09-29T10:14:22Z' },
  { kind: 'builder',     text: '==> amazon-ebs.construx-api: AMI: ami-08f3d892de259504d' },
  { kind: 'builder',     text: '==> amazon-ebs.construx-api: Waiting for AMI to become ready...' },
  { kind: 'builder',     text: '==> amazon-ebs.construx-api: Terminating the source AWS instance...' },
  { kind: 'builder',     text: '==> amazon-ebs.construx-api: Cleaning up temporary keypairs and security groups...' },
  { kind: 'blank',       text: '' },
  { kind: 'summary',     text: '==> Wait completed after 4 minutes 32 seconds' },
  { kind: 'artifact',    text: '==> Builds finished. The artifacts of successful builds are:' },
  { kind: 'ami-id',      text: '--> amazon-ebs.construx-api: AMIs were created:' },
  { kind: 'ami-id',      text: '    eu-west-1: ami-08f3d892de259504d' },
  { kind: 'ami-id',      text: '    us-east-1: ami-0a4b5e2f1d3c7b8f9' },
];

const TOTAL = LINES.length;

function lineColor(kind: LineKind): string {
  switch (kind) {
    case 'prompt':      return 'rgba(240,239,255,0.55)';
    case 'init':        return 'rgba(240,239,255,0.28)';
    case 'builder':     return 'rgba(96,165,250,0.6)';
    case 'step-header': return 'rgba(167,139,250,0.65)';
    case 'step-output': return 'rgba(240,239,255,0.38)';
    case 'step-ok':     return '#4ade80';
    case 'step-warn':   return '#fbbf24';
    case 'artifact':    return 'rgba(74,222,128,0.7)';
    case 'ami-id':      return '#fbbf24';
    case 'summary':     return 'rgba(240,239,255,0.45)';
    default:            return 'rgba(240,239,255,0.3)';
  }
}

export default function PackerBuildPanel() {
  const [revealed, setRevealed] = useState(0);
  const [elapsed, setElapsed]   = useState(0);
  const ref      = useRef<HTMLDivElement>(null);
  const started  = useRef(false);
  const startTs  = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          startTs.current = Date.now();
          setRevealed(1);
          timerRef.current = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTs.current) / 1000));
          }, 1000);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) {
      if (revealed > TOTAL && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setElapsed(272);
      }
      return;
    }
    const line  = LINES[revealed - 1];
    const delay = line.kind === 'blank' ? 30 : 81;
    const id = setTimeout(() => setRevealed((r) => r + 1), delay);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const allDone    = revealed > TOTAL;
  const shownLines = LINES.slice(0, Math.min(LINES.length, revealed));

  function fmtElapsed(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
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
          construx@ci-runner — packer build
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `● ${fmtElapsed(elapsed)}` : `${fmtElapsed(elapsed)}…`}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@ci-runner:~/infra$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          packer build construx-api.pkr.hcl
        </span>
      </div>

      {/* Lines */}
      <div className="px-4 py-2 space-y-px">
        {shownLines.map((line, i) => {
          if (line.kind === 'blank') return <div key={i} className="h-1.5" />;
          const isPrompt = line.kind === 'prompt';
          return (
            <div key={i} className="flex items-start gap-2 text-[7.5px] leading-[1.8]">
              {isPrompt && (
                <span className="shrink-0" style={{ color: 'rgba(74,222,128,0.5)', marginTop: '1px' }}>$</span>
              )}
              <span style={{ color: lineColor(line.kind), whiteSpace: 'pre-wrap' }}>
                {isPrompt ? line.text : line.text}
              </span>
            </div>
          );
        })}
        {!allDone && revealed > 0 && (
          <div className="flex items-center gap-1 text-[7.5px]" style={{ color: 'rgba(96,165,250,0.4)' }}>
            <span style={{ animation: 'pulse 1s infinite' }}>▋</span>
          </div>
        )}
      </div>

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>2 AMIs created</span>
          <span>eu-west-1 · us-east-1</span>
          <span>ubuntu 24.04 LTS base</span>
          <span style={{ color: '#4ade80' }}>4m 32s</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          packer 1.11.2 · amazon-ebs builder · ansible provisioner
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● builds finished' : 'building'}
        </span>
      </div>
    </div>
  );
}
