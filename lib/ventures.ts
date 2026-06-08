export type VentureStatus = 'live' | 'dev';

export interface VentureStat {
  label: string;
  value: string;
}

export interface Venture {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  pitch: string;
  what: string;
  accent: string;
  status: VentureStatus;
  url: string | null;
  category: string;
  stats: VentureStat[];
  features: string[];
  journalSlugs?: string[];
  techStack: string[];
  geometryIndex: number;
  /** @deprecated solar system fields kept for backward compat */
  orbitRadius?: number;
  planetSize?: number;
  orbitSpeed?: number;
  latencyBars?: string;
}

export const ventures: Venture[] = [
  {
    id: 'scoutr',
    slug: 'scoutr',
    name: 'Scoutr',
    tagline: 'Find what others miss.',
    pitch:
      'Resell intelligence for arbitrage traders who are bottlenecked on sourcing speed. Paste a URL, Scoutr scans the page, identifies every product worth flipping, and ranks them by projected profit on Amazon and eBay after all fees and shipping — in seconds.',
    what:
      'An AI-powered research platform that turns any product page into an arbitrage opportunity report. Built for side-hustlers and professional resellers who already know the margins work but need to find the next product faster than their competition.',
    accent: '#C8F50C',
    status: 'live',
    url: 'https://main.dh20jci5d0961.amplifyapp.com',
    category: 'Resell Intelligence',
    geometryIndex: 0,
    stats: [
      { label: 'Time to scan', value: '<5s' },
      { label: 'Platforms', value: 'AMZ+eBay' },
      { label: 'Model', value: 'Claude' },
      { label: 'Pricing', value: 'All-in fees' },
    ],
    features: [
      'Paste any URL — Scoutr finds every resellable product',
      'Real-time profit estimates after all Amazon & eBay fees',
      'Shipping cost estimation built in',
      'Ranked by projected margin, highest first',
      'Claude-powered product classification',
      'Works across retail, wholesale, and clearance pages',
    ],
    journalSlugs: ['building-scoutr', 'scoutr-real-time-design', 'scoutr-fee-calculator', 'scoutr-first-30-days', 'pricing-ai-products'],
    techStack: ['Next.js 15', 'Claude API', 'Postgres', 'AWS Amplify', 'TypeScript', 'Tailwind'],
  },
  {
    id: 'the-marqet',
    slug: 'the-marqet',
    name: 'The Marqet',
    tagline: 'The App Store for Claude AI.',
    pitch:
      'A curated marketplace for professional Claude AI extensions — system prompts, prompt packs, MCP servers, and workflow templates. Buy a pack, paste the system prompt into a Claude Project, and Claude immediately behaves like a trained specialist in your field. No configuration. No hours of prompt engineering.',
    what:
      "Think App Store, but for Claude's brain. Every listing is a pre-built professional configuration for a specific job — HR, recruiting, real estate, finance, engineering, and more. Currently live with 167+ listings across four categories.",
    accent: '#3B82F6',
    status: 'live',
    url: 'https://dv4ftwlkwnu99.amplifyapp.com',
    category: 'AI Marketplace',
    geometryIndex: 1,
    stats: [
      { label: 'Listings', value: '167+' },
      { label: 'Categories', value: '4' },
      { label: 'Setup time', value: '<60s' },
      { label: 'Platform', value: 'Claude Projects' },
    ],
    features: [
      '167+ professional Claude configurations for real jobs',
      'System prompts, prompt packs, MCP servers, workflow templates',
      'Paste and go — no technical setup required',
      'Specialist domains: HR, finance, real estate, engineering',
      'New listings added weekly',
      'Built exclusively for Claude Projects',
    ],
    journalSlugs: ['the-marqet-167-listings', 'the-marqet-content-pipeline', 'the-marqet-ux'],
    techStack: ['Next.js 15', 'pgvector', 'Claude Embeddings', 'Stripe', 'AWS Amplify', 'TypeScript'],
  },
  {
    id: 'the-hyve',
    slug: 'the-hyve',
    name: 'The Hyve',
    tagline: 'Where AI teams actually work.',
    pitch:
      'The all-in-one workspace built natively for AI-first teams. Real-time channels, kanban boards, docs, decision engine, and a first-class AI team member that reads everything, remembers your project history, and ships work — all in a single URL. No integrations required.',
    what:
      'Replaces the fragmented Slack + Notion + GitHub + Discord stack that kills focus for builder teams. The AI agent is a genuine first-class team member with vector memory of every decision ever made in your project.',
    accent: '#8B5CF6',
    status: 'live',
    url: 'https://main.dv4ftwlkwnu99.amplifyapp.com',
    category: 'AI Workspace',
    geometryIndex: 2,
    stats: [
      { label: 'Replaces', value: '4 tools' },
      { label: 'AI memory', value: 'Vector' },
      { label: 'Setup', value: 'Single URL' },
      { label: 'Built for', value: 'Builder teams' },
    ],
    features: [
      'Real-time channels with full project context',
      'Kanban boards with AI-assisted task breakdown',
      'Docs that the AI agent actually reads and remembers',
      'Decision engine that surfaces past choices before you repeat them',
      'First-class AI team member — not a chatbot, a colleague',
      'Replaces Slack, Notion, GitHub discussions, and Discord in one tab',
    ],
    journalSlugs: ['building-the-hyve', 'hyve-ai-team-member', 'the-hyve-decision-engine', 'the-hyve-architecture'],
    techStack: ['Next.js 15', 'Claude API', 'Supabase', 'pgvector', 'AWS Amplify', 'WebSockets'],
  },
  {
    id: 'construx-daily',
    slug: 'construx-daily',
    name: 'Construx Daily',
    tagline: 'AI intelligence, delivered daily.',
    pitch:
      'The only newsletter built entirely by AI agents. Every morning, our system scans the frontier of AI research, open source releases, product launches, and industry shifts — then writes, edits, and publishes a briefing optimised for people building with AI.',
    what:
      'Not curated by a human. Not summarised by a chatbot. Built by a multi-agent pipeline that reads everything, selects what matters, and writes with a specific voice — concise, precise, and never padded. If it happened in AI today and it matters, Construx Daily has it.',
    accent: '#F59E0B',
    status: 'dev',
    url: null,
    category: 'AI Newsletter',
    geometryIndex: 3,
    stats: [
      { label: 'Cadence', value: 'Daily' },
      { label: 'Pipeline', value: 'Multi-agent' },
      { label: 'Model', value: 'Claude' },
      { label: 'Status', value: 'In dev' },
    ],
    features: [
      'Fully AI-generated — no human editorial bottleneck',
      'Multi-agent pipeline reads and ranks the full AI news surface',
      'Voice-consistent writing, never generic AI-speak',
      'Covers research, open source, product launches, and funding',
      'Optimised for builders, not observers',
      'One email. Everything that matters. Nothing that doesn\'t.',
    ],
    techStack: ['Claude API', 'Next.js 15', 'Resend', 'AWS Amplify', 'TypeScript'],
  },
  {
    id: 'construx-studio',
    slug: 'construx-studio',
    name: 'Construx Studio',
    tagline: 'Beautiful software, built fast.',
    pitch:
      'A boutique web development studio built for the AI era. We design and build production-grade web applications for founders and operators who know exactly what they want — and want it done properly, without the agency overhead.',
    what:
      'Construx Studio is the commercial arm of the group. We take on a small number of design and engineering engagements each quarter, building the same quality of product we ship internally. If you\'re building something real and want a team that treats your project like it\'s theirs, this is where you start.',
    accent: '#06B6D4',
    status: 'dev',
    url: null,
    category: 'Web Studio',
    geometryIndex: 4,
    stats: [
      { label: 'Engagements', value: 'Limited' },
      { label: 'Stack', value: 'Next.js + AI' },
      { label: 'Timeline', value: '2–8 wks' },
      { label: 'Status', value: 'In dev' },
    ],
    features: [
      'Full-stack design + engineering, no handoff required',
      'Same quality standards as our internal products',
      'AI-native development — not bolted on',
      'Fixed-scope engagements with clear deliverables',
      'Production-ready from day one',
      'Small number of clients per quarter — we stay focused',
    ],
    techStack: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'AWS Amplify', 'Claude API'],
  },
];

export function getVentureBySlug(slug: string): Venture | undefined {
  return ventures.find((v) => v.slug === slug);
}

export function statusLabel(status: VentureStatus): string {
  return { live: 'Live', dev: 'In Development' }[status];
}
