'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind =
  | 'step-label'
  | 'prompt'
  | 'comment'
  | 'redirect-url'
  | 'json-brace'
  | 'json-key'
  | 'json-str'
  | 'json-num'
  | 'header'
  | 'response-status'
  | 'response-body'
  | 'blank';

interface OAuthLine {
  kind: LineKind;
  text: string;
}

const LINES: OAuthLine[] = [
  { kind: 'step-label',     text: '── Step 1: Authorization request (redirect user) ──────────────────' },
  { kind: 'redirect-url',   text: 'https://accounts.google.com/o/oauth2/v2/auth' },
  { kind: 'redirect-url',   text: '  ?client_id=123456789-abc.apps.googleusercontent.com' },
  { kind: 'redirect-url',   text: '  &redirect_uri=https://construxgroup.io/auth/callback' },
  { kind: 'redirect-url',   text: '  &response_type=code' },
  { kind: 'redirect-url',   text: '  &scope=openid%20email%20profile' },
  { kind: 'redirect-url',   text: '  &state=random-csrf-token-9f3a2b' },
  { kind: 'redirect-url',   text: '  &code_challenge=S256&code_challenge_method=SHA-256' },
  { kind: 'blank',          text: '' },
  { kind: 'step-label',     text: '── Step 2: Exchange authorization code for tokens ────────────────' },
  { kind: 'comment',        text: '# code=4/0AfJohXm... returned in redirect' },
  { kind: 'prompt',         text: 'curl -s -X POST https://oauth2.googleapis.com/token \\' },
  { kind: 'prompt',         text: '  -d "code=4/0AfJohXmL9KiRzQm..." \\' },
  { kind: 'prompt',         text: '  -d "client_id=123456789-abc.apps.googleusercontent.com" \\' },
  { kind: 'prompt',         text: '  -d "client_secret=$GOOGLE_CLIENT_SECRET" \\' },
  { kind: 'prompt',         text: '  -d "redirect_uri=https://construxgroup.io/auth/callback" \\' },
  { kind: 'prompt',         text: '  -d "grant_type=authorization_code" \\' },
  { kind: 'prompt',         text: '  -d "code_verifier=$PKCE_VERIFIER" | jq' },
  { kind: 'blank',          text: '' },
  { kind: 'json-brace',     text: '{' },
  { kind: 'json-key',       text: '  "access_token":  ' },
  { kind: 'json-str',       text: '    "ya29.a0AfJohXmL9KiRzQm7F3tYbP...",   // opaque' },
  { kind: 'json-key',       text: '  "id_token":' },
  { kind: 'json-str',       text: '    "eyJhbGciOiJSUzI1NiIsImtpZ...",       // JWT, contains user' },
  { kind: 'json-key',       text: '  "refresh_token":' },
  { kind: 'json-str',       text: '    "1//0AfJohXm9K2sRCgYIARAAGBASNwF...",  // long-lived' },
  { kind: 'json-num',       text: '  "expires_in": 3599,' },
  { kind: 'json-str',       text: '  "token_type": "Bearer",' },
  { kind: 'json-str',       text: '  "scope":      "openid email profile"' },
  { kind: 'json-brace',     text: '}' },
  { kind: 'blank',          text: '' },
  { kind: 'step-label',     text: '── Step 3: Call API with access token ───────────────────────────' },
  { kind: 'prompt',         text: 'curl -s https://www.googleapis.com/oauth2/v3/userinfo \\' },
  { kind: 'header',         text: '  -H "Authorization: Bearer $ACCESS_TOKEN" | jq' },
  { kind: 'blank',          text: '' },
  { kind: 'json-brace',     text: '{' },
  { kind: 'json-str',       text: '  "sub":            "110169484474386276334",' },
  { kind: 'json-str',       text: '  "name":           "Lewis Wilson",' },
  { kind: 'json-str',       text: '  "email":          "lewis@construxgroup.io",' },
  { kind: 'json-str',       text: '  "email_verified": true,' },
  { kind: 'json-str',       text: '  "picture":        "https://lh3.googleusercontent.com/a/..."' },
  { kind: 'json-brace',     text: '}' },
  { kind: 'blank',          text: '' },
  { kind: 'step-label',     text: '── Step 4: Refresh access token (no user interaction) ───────────' },
  { kind: 'prompt',         text: 'curl -s -X POST https://oauth2.googleapis.com/token \\' },
  { kind: 'prompt',         text: '  -d "grant_type=refresh_token" \\' },
  { kind: 'prompt',         text: '  -d "refresh_token=$REFRESH_TOKEN" \\' },
  { kind: 'prompt',         text: '  -d "client_id=123456789-abc.apps.googleusercontent.com" \\' },
  { kind: 'prompt',         text: '  -d "client_secret=$GOOGLE_CLIENT_SECRET" | jq .expires_in' },
  { kind: 'response-status', text: '3599' },
];

const TOTAL = LINES.length;

function lineColor(kind: LineKind): string {
  switch (kind) {
    case 'step-label':     return 'rgba(167,139,250,0.55)';
    case 'prompt':         return 'rgba(240,239,255,0.45)';
    case 'comment':        return 'rgba(240,239,255,0.22)';
    case 'redirect-url':   return 'rgba(96,165,250,0.65)';
    case 'json-brace':     return 'rgba(240,239,255,0.45)';
    case 'json-key':       return 'rgba(240,239,255,0.38)';
    case 'json-str':       return 'rgba(74,222,128,0.55)';
    case 'json-num':       return 'rgba(251,191,36,0.7)';
    case 'header':         return 'rgba(240,239,255,0.45)';
    case 'response-status':return '#4ade80';
    case 'response-body':  return 'rgba(240,239,255,0.5)';
    case 'blank':          return 'transparent';
    default:               return 'rgba(240,239,255,0.35)';
  }
}

export default function OAuthFlowPanel() {
  const [revealed, setRevealed] = useState(0);
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
    const line  = LINES[revealed - 1];
    const delay = line.kind === 'blank' ? 30 : 78;
    const id = setTimeout(() => setRevealed((r) => r + 1), delay);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone    = revealed > TOTAL;
  const shownLines = LINES.slice(0, Math.min(LINES.length, revealed));

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
          construx@dev-macbook — oauth2 flow
        </span>
        <span className="text-[8px]" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? '● authorised' : 'authorising…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@dev-macbook:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          # OAuth 2.0 + PKCE flow (Authorization Code)
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
                <span className="shrink-0 text-[7.5px]" style={{ color: 'rgba(74,222,128,0.5)', marginTop: '1px' }}>$</span>
              )}
              {!isPrompt && (
                <span className="shrink-0 text-[7.5px]" style={{ color: 'rgba(255,255,255,0.08)', marginTop: '1px' }}>›</span>
              )}
              <span style={{ color: lineColor(line.kind), whiteSpace: 'pre' }}>{line.text}</span>
            </div>
          );
        })}
        {!allDone && revealed > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[7.5px]" style={{ color: 'rgba(74,222,128,0.4)', animation: 'pulse 1s infinite' }}>▋</span>
          </div>
        )}
      </div>

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>4 steps complete</span>
          <span>OAuth 2.0 + PKCE</span>
          <span>Google provider · openid email profile</span>
          <span>access_token exp: 3599s · refresh_token: long-lived</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          oauth2 · pkce rfc-7636 · openid connect · jwt rs256
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● complete' : 'loading'}
        </span>
      </div>
    </div>
  );
}
