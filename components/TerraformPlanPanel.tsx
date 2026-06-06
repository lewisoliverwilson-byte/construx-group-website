'use client';

import { useState, useEffect, useRef } from 'react';

type ChangeType = 'create' | 'update' | 'destroy' | 'read' | 'comment' | 'summary' | 'blank';

interface PlanLine {
  type: ChangeType;
  text: string;
}

const PLAN_LINES: PlanLine[] = [
  { type: 'comment',  text: '# Terraform plan — construx.engage --init' },
  { type: 'blank',    text: '' },
  { type: 'comment',  text: 'Terraform will perform the following actions:' },
  { type: 'blank',    text: '' },
  { type: 'create',   text: '+ resource "aws_amplify_app" "client_venture" {' },
  { type: 'create',   text: '    name          = "venture-production"' },
  { type: 'create',   text: '    platform      = "WEB_COMPUTE"' },
  { type: 'create',   text: '    framework     = "Next.js - SSR"' },
  { type: 'create',   text: '    branch        = "master"' },
  { type: 'create',   text: '  }' },
  { type: 'blank',    text: '' },
  { type: 'create',   text: '+ resource "aws_rds_cluster" "postgres" {' },
  { type: 'create',   text: '    engine         = "aurora-postgresql"' },
  { type: 'create',   text: '    engine_version = "16.1"' },
  { type: 'create',   text: '    instance_class = "db.r8g.large"' },
  { type: 'create',   text: '    database_name  = "venture_production"' },
  { type: 'create',   text: '  }' },
  { type: 'blank',    text: '' },
  { type: 'create',   text: '+ resource "upstash_redis_database" "cache" {' },
  { type: 'create',   text: '    database_name = "venture-cache"' },
  { type: 'create',   text: '    region        = "eu-west-1"' },
  { type: 'create',   text: '    tls           = true' },
  { type: 'create',   text: '  }' },
  { type: 'blank',    text: '' },
  { type: 'create',   text: '+ resource "cloudflare_record" "www" {' },
  { type: 'create',   text: '    type  = "CNAME"' },
  { type: 'create',   text: '    name  = "www"' },
  { type: 'create',   text: '    value = aws_amplify_app.client_venture.default_domain' },
  { type: 'create',   text: '  }' },
  { type: 'blank',    text: '' },
  { type: 'update',   text: '~ resource "aws_ssm_parameter" "env" {' },
  { type: 'update',   text: '    name  = "/venture/production/DATABASE_URL"' },
  { type: 'update',   text: '  ~ value = (sensitive value)' },
  { type: 'update',   text: '  }' },
  { type: 'blank',    text: '' },
  { type: 'read',     text: 'data "aws_acm_certificate" "ssl" {' },
  { type: 'read',     text: '  domain = "construxgroup.io"' },
  { type: 'read',     text: '}' },
  { type: 'blank',    text: '' },
  { type: 'summary',  text: 'Plan: 4 to add, 1 to change, 0 to destroy.' },
];

function lineColor(type: ChangeType): string {
  switch (type) {
    case 'create':  return 'rgba(74,222,128,0.85)';
    case 'update':  return 'rgba(251,191,36,0.85)';
    case 'destroy': return 'rgba(248,113,113,0.85)';
    case 'read':    return 'rgba(125,211,252,0.85)';
    case 'summary': return 'rgba(240,239,255,0.85)';
    case 'comment': return 'rgba(240,239,255,0.3)';
    default:        return 'rgba(240,239,255,0.45)';
  }
}

function linePrefix(type: ChangeType): string {
  switch (type) {
    case 'create':  return '+';
    case 'update':  return '~';
    case 'destroy': return '-';
    case 'read':    return '≤';
    default:        return ' ';
  }
}

export default function TerraformPlanPanel() {
  const [revealed, setRevealed] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
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
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > PLAN_LINES.length) return;
    const delay = PLAN_LINES[revealed - 1]?.type === 'blank' ? 30 : 65;
    const id = setTimeout(() => setRevealed((r) => r + 1), delay);
    return () => clearTimeout(id);
  }, [revealed]);

  const creates  = PLAN_LINES.filter((l) => l.type === 'create').length;
  const updates  = PLAN_LINES.filter((l) => l.type === 'update').length;

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
          construx@sys — terraform plan
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.5)' }}>
          4 to add · 1 to change
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          terraform plan -out=engagement.tfplan
        </span>
      </div>

      {/* Plan output */}
      <div className="px-4 py-3 space-y-px text-[8px] leading-relaxed">
        {PLAN_LINES.slice(0, revealed).map((line, i) => (
          <div
            key={i}
            className="flex gap-3"
            style={{ color: lineColor(line.type) }}
          >
            {line.type !== 'blank' && line.type !== 'comment' && line.type !== 'summary' ? (
              <>
                <span
                  className="flex-shrink-0 w-3 text-center font-bold"
                  style={{ color: lineColor(line.type) }}
                >
                  {line.text.trimStart().startsWith('+') || line.text.trimStart().startsWith('~') || line.text.trimStart().startsWith('-')
                    ? ''
                    : linePrefix(line.type)}
                </span>
                <span className="font-mono" style={{ whiteSpace: 'pre' }}>{line.text}</span>
              </>
            ) : (
              <span className="font-mono w-full" style={{ whiteSpace: 'pre', paddingLeft: line.type === 'summary' ? '0' : undefined }}>
                {line.type === 'summary'
                  ? <span style={{ color: 'rgba(74,222,128,0.9)', fontWeight: 700 }}>{line.text}</span>
                  : line.text}
              </span>
            )}
          </div>
        ))}

        {/* Cursor blink while revealing */}
        {revealed <= PLAN_LINES.length && (
          <div className="flex gap-3">
            <span className="w-3" />
            <span style={{ color: 'rgba(74,222,128,0.6)' }}>▋</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          terraform v1.10.5 · aws · cloudflare · upstash
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.5)' }}>
          ready to apply
        </span>
      </div>
    </div>
  );
}
