'use client';

import { useState, useEffect, useRef } from 'react';

interface RepoRow {
  name:        string;
  visibility:  'private' | 'public';
  lang:        string;
  stars:       number;
  updated:     string;
  description: string;
}

interface PrRow {
  num:    number;
  title:  string;
  author: string;
  branch: string;
  checks: 'passing' | 'failing' | 'pending';
  age:    string;
}

interface IssueRow {
  num:    number;
  title:  string;
  labels: string[];
  age:    string;
  state:  'open' | 'closed';
}

const REPOS: RepoRow[] = [
  { name: 'construx-group-website',  visibility: 'private', lang: 'TypeScript', stars: 0,  updated: '2h ago',  description: 'The Construx Group public site — solar system hero + journal' },
  { name: 'construx-workspace',       visibility: 'private', lang: 'TypeScript', stars: 0,  updated: '4h ago',  description: 'Project management SaaS built on Amplify + Next.js' },
  { name: 'construx-daily',           visibility: 'private', lang: 'TypeScript', stars: 0,  updated: '1d ago',  description: 'AI-powered tech newsletter with amber accent' },
  { name: 'construx-studio',          visibility: 'private', lang: 'TypeScript', stars: 0,  updated: '3d ago',  description: 'Web-build venture — public site + Lead Engine portal' },
  { name: 'the-marqet',               visibility: 'private', lang: 'TypeScript', stars: 0,  updated: '5d ago',  description: 'Dropshipping market research SaaS — 167 listings' },
  { name: 'construx-infra',           visibility: 'private', lang: 'HCL',        stars: 0,  updated: '7d ago',  description: 'Terraform + CDK infrastructure definitions' },
];

const PRS: PrRow[] = [
  { num: 84,  title: 'feat: add BpftracePanel + dispatches 734-736',             author: 'lewis', branch: 'master',  checks: 'passing', age: '2h' },
  { num: 83,  title: 'feat: TsharkPacketPanel + dispatches 737-739',             author: 'lewis', branch: 'master',  checks: 'passing', age: '4h' },
  { num: 82,  title: 'feat: GitBlamePanel on journal; dispatches 731-733',       author: 'lewis', branch: 'master',  checks: 'passing', age: '6h' },
  { num: 81,  title: 'feat: DockerBuildPanel on founders; dispatches 728-730',   author: 'lewis', branch: 'master',  checks: 'passing', age: '8h' },
  { num: 80,  title: 'chore: update Amplify build config for Node 22',           author: 'lewis', branch: 'infra',   checks: 'pending', age: '12h' },
];

const ISSUES: IssueRow[] = [
  { num: 142, title: 'Add RSS feed to journal page',           labels: ['enhancement', 'journal'],     age: '2d',  state: 'open' },
  { num: 139, title: 'Dark mode toggle inconsistent on mobile',labels: ['bug', 'ui'],                  age: '4d',  state: 'open' },
  { num: 137, title: 'Sitemap not updating after deploy',       labels: ['bug', 'seo'],                 age: '6d',  state: 'open' },
  { num: 134, title: 'Add /now page content',                   labels: ['enhancement', 'content'],     age: '1w',  state: 'closed' },
  { num: 131, title: 'Performance: LCP above 2.5s on mobile',  labels: ['performance', 'priority'],    age: '2w',  state: 'closed' },
];

function checksColor(c: PrRow['checks']): string {
  if (c === 'passing') return '#4ade80';
  if (c === 'failing') return '#f87171';
  return '#fbbf24';
}

function labelColor(label: string): string {
  if (label === 'bug')         return '#f87171';
  if (label === 'enhancement') return '#60a5fa';
  if (label === 'performance') return '#fbbf24';
  if (label === 'priority')    return '#f97316';
  return 'rgba(240,239,255,0.25)';
}

const TOTAL = REPOS.length + PRS.length + ISSUES.length;

export default function GhCliPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [liveStars, setLiveStars] = useState(0);
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
    const id = setTimeout(() => setRevealed((r) => r + 1), 76);
    return () => clearTimeout(id);
  }, [revealed]);

  void liveStars;
  void setLiveStars;

  const allDone = revealed > TOTAL;

  const shownRepos  = REPOS.slice(0, Math.max(0, Math.min(REPOS.length, revealed)));
  const shownPrs    = PRS.slice(0, Math.max(0, Math.min(PRS.length, revealed - REPOS.length)));
  const shownIssues = ISSUES.slice(0, Math.max(0, Math.min(ISSUES.length, revealed - REPOS.length - PRS.length)));

  const openIssues  = ISSUES.filter((i) => i.state === 'open').length;
  const passingPrs  = PRS.filter((p) => p.checks === 'passing').length;

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
          construx@sys — gh repo list lewisoliverwilson-byte
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${REPOS.length} repos` : 'fetching…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>gh repo list --limit 10 --json name,visibility,primaryLanguage</span>
      </div>

      {/* Repos */}
      {shownRepos.length > 0 && (
        <div className="px-4 py-1.5 space-y-0.5">
          {shownRepos.map((r, i) => (
            <div key={i} className="flex items-start text-[8px] leading-[1.65] gap-2">
              <span style={{ color: r.visibility === 'private' ? '#fbbf24' : '#4ade80', minWidth: '52px', flexShrink: 0 }}>
                {r.visibility}
              </span>
              <span style={{ color: '#f97316', minWidth: '224px', flexShrink: 0, fontWeight: 600 }}>
                {r.name}
              </span>
              <span style={{ color: '#60a5fa', minWidth: '80px', flexShrink: 0 }}>
                {r.lang}
              </span>
              <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '48px', flexShrink: 0 }}>
                {r.updated}
              </span>
              <span style={{ color: 'rgba(240,239,255,0.3)' }}>
                {r.description}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* PRs */}
      {shownPrs.length > 0 && (
        <div className="px-4 py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div
            className="text-[9px] mb-0.5 select-none"
            style={{ color: 'rgba(74,222,128,0.45)' }}
          >
            construx@sys:~$ <span style={{ color: 'rgba(240,239,255,0.22)' }}>gh pr list --repo construx-group-website --limit 5</span>
          </div>
          {shownPrs.map((pr, i) => (
            <div key={i} className="flex items-center text-[8px] leading-[1.65] gap-2">
              <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '28px', flexShrink: 0 }}>#{pr.num}</span>
              <span style={{ color: checksColor(pr.checks), minWidth: '12px', flexShrink: 0 }}>
                {pr.checks === 'passing' ? '✓' : pr.checks === 'failing' ? '✗' : '○'}
              </span>
              <span style={{ color: 'rgba(240,239,255,0.5)', minWidth: '348px', flexShrink: 0 }}>{pr.title}</span>
              <span style={{ color: 'rgba(240,239,255,0.2)' }}>{pr.age} ago</span>
            </div>
          ))}
        </div>
      )}

      {/* Issues */}
      {shownIssues.length > 0 && (
        <div className="px-4 py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div
            className="text-[9px] mb-0.5 select-none"
            style={{ color: 'rgba(74,222,128,0.45)' }}
          >
            construx@sys:~$ <span style={{ color: 'rgba(240,239,255,0.22)' }}>gh issue list --limit 5 --state all</span>
          </div>
          {shownIssues.map((issue, i) => (
            <div key={i} className="flex items-start text-[8px] leading-[1.65] gap-2">
              <span style={{ color: issue.state === 'open' ? '#4ade80' : 'rgba(240,239,255,0.2)', minWidth: '28px', flexShrink: 0 }}>
                #{issue.num}
              </span>
              <span style={{ color: issue.state === 'open' ? 'rgba(240,239,255,0.5)' : 'rgba(240,239,255,0.2)', minWidth: '260px', flexShrink: 0 }}>
                {issue.title}
              </span>
              <span className="flex gap-1 flex-wrap">
                {issue.labels.map((l) => (
                  <span
                    key={l}
                    className="px-1 py-px text-[6px] uppercase tracking-widest"
                    style={{ color: labelColor(l), background: `${labelColor(l)}18`, borderRadius: '2px' }}
                  >
                    {l}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Cursor */}
      {allDone && (
        <div className="px-4 text-[8px]" style={{ color: 'rgba(74,222,128,0.3)' }}>▌</div>
      )}

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-4 px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#f97316' }}>{REPOS.length} repos</span>
          <span style={{ color: '#4ade80' }}>{passingPrs}/{PRS.length} PRs passing</span>
          <span style={{ color: '#60a5fa' }}>{openIssues} open issues</span>
          <span className="ml-auto">github.com/lewisoliverwilson-byte</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          gh 2.62.0 · github.com · api.github.com
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● authenticated' : 'loading'}
        </span>
      </div>
    </div>
  );
}
