'use client';

import { useState, useEffect, useRef } from 'react';

interface Extension {
  id:          string;
  name:        string;
  version:     string;
  category:    string;
  accent:      string;
  description: string;
}

const CATEGORIES = [
  {
    label:   'AI / Copilot',
    accent:  '#a78bfa',
    extensions: [
      { id: 'GitHub.copilot',             name: 'github.copilot',            version: '1.218.0', description: 'AI pair programmer'           },
      { id: 'continue.continue',          name: 'continue',                  version: '0.9.245', description: 'open-source AI code assistant' },
      { id: 'anthropics.claude-vscode',   name: 'claude-vscode',             version: '2.1.0',   description: 'Claude in your editor'         },
    ],
  },
  {
    label:   'Languages / Syntax',
    accent:  '#7dd3fc',
    extensions: [
      { id: 'ms-vscode.vscode-typescript-next', name: 'typescript-next',    version: '5.5.20240516', description: 'latest TypeScript builds'  },
      { id: 'bradlc.vscode-tailwindcss',         name: 'tailwindcss',       version: '0.12.14',      description: 'Tailwind CSS IntelliSense' },
      { id: 'dbaeumer.vscode-eslint',            name: 'vscode-eslint',     version: '3.0.5',        description: 'ESLint integration'        },
      { id: 'esbenp.prettier-vscode',            name: 'prettier-vscode',   version: '10.4.0',       description: 'code formatter'            },
      { id: 'unifiedjs.vscode-mdx',              name: 'vscode-mdx',        version: '1.4.0',        description: 'MDX language support'      },
    ],
  },
  {
    label:   'Git',
    accent:  '#F97316',
    extensions: [
      { id: 'eamodio.gitlens',            name: 'gitlens',                   version: '15.5.0',  description: 'supercharged git'              },
      { id: 'mhutchie.git-graph',         name: 'git-graph',                 version: '1.30.0',  description: 'view git graph'                },
    ],
  },
  {
    label:   'Productivity',
    accent:  '#4ade80',
    extensions: [
      { id: 'usernamehw.errorlens',         name: 'errorlens',               version: '3.19.0',  description: 'inline error highlighting'     },
      { id: 'streetsidesoftware.code-spell-checker', name: 'code-spell-checker', version: '3.0.1', description: 'spell checking for code'   },
      { id: 'naumovs.color-highlight',      name: 'color-highlight',         version: '2.6.0',   description: 'highlight color values'        },
      { id: 'christian-kohler.path-intellisense', name: 'path-intellisense', version: '2.9.0',  description: 'path autocomplete'             },
      { id: 'formulahendry.auto-rename-tag', name: 'auto-rename-tag',        version: '0.1.10',  description: 'auto rename paired HTML tags'  },
    ],
  },
  {
    label:   'Theme',
    accent:  '#fbbf24',
    extensions: [
      { id: 'GitHub.github-vscode-theme',   name: 'github-vscode-theme',    version: '6.3.5',   description: 'GitHub Dark Default'           },
      { id: 'pkief.material-icon-theme',    name: 'material-icon-theme',    version: '5.1.0',   description: 'file icons'                    },
    ],
  },
];

// Flatten to a single list with category info for sequential reveal
const ALL_EXTENSIONS: (Extension & { categoryLabel: string; categoryAccent: string; isFirst: boolean })[] = [];
CATEGORIES.forEach((cat) => {
  cat.extensions.forEach((ext, idx) => {
    ALL_EXTENSIONS.push({
      ...ext,
      category:       cat.label,
      categoryLabel:  cat.label,
      categoryAccent: cat.accent,
      accent:         cat.accent,
      isFirst:        idx === 0,
    });
  });
});

export default function VscodeExtensionsPanel() {
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
    if (revealed === 0 || revealed > ALL_EXTENSIONS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 55);
    return () => clearTimeout(id);
  }, [revealed]);

  const visibleExtensions = ALL_EXTENSIONS.slice(0, revealed);
  const totalCount = ALL_EXTENSIONS.length;

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
          construx@sys — vscode extensions
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: 'rgba(240,239,255,0.2)' }}>
          {totalCount} installed
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          code --list-extensions --show-versions
        </span>
      </div>

      {/* Extensions list */}
      <div className="px-4 py-3">
        {(() => {
          const rows: React.ReactNode[] = [];
          let lastCategory = '';

          visibleExtensions.forEach((ext, i) => {
            if (ext.categoryLabel !== lastCategory) {
              lastCategory = ext.categoryLabel;
              rows.push(
                <div key={`cat-${i}`} className="mt-3 first:mt-0 mb-1">
                  <span
                    className="text-[7px] uppercase tracking-[0.2em] px-1.5 py-px"
                    style={{ color: ext.categoryAccent, background: `${ext.categoryAccent}18`, borderRadius: '2px' }}
                  >
                    {ext.categoryLabel}
                  </span>
                </div>,
              );
            }

            rows.push(
              <div key={ext.id} className="flex items-center gap-2 py-px pl-1">
                <span
                  className="text-[8px] flex-shrink-0"
                  style={{ color: ext.accent, minWidth: '180px', fontWeight: 500 }}
                >
                  {ext.name}
                </span>
                <span
                  className="text-[7px] tabular-nums flex-shrink-0"
                  style={{ color: 'rgba(255,255,255,0.2)', minWidth: '68px' }}
                >
                  v{ext.version}
                </span>
                <span className="text-[8px] truncate" style={{ color: 'rgba(240,239,255,0.3)' }}>
                  {ext.description}
                </span>
              </div>,
            );
          });

          return rows;
        })()}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          VS Code {'{'}Insiders{'}'} · {CATEGORIES.length} categories
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          darwin arm64
        </span>
      </div>
    </div>
  );
}
