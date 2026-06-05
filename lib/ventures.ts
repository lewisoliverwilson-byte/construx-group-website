export type VentureStatus = 'live' | 'coming-soon' | 'incubation';

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
  orbitRadius: number;
  planetSize: number;
  orbitSpeed: number;
  category: string;
  stats: VentureStat[];
  features: string[];
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
    orbitRadius: 3.5,
    planetSize: 0.38,
    orbitSpeed: 0.55,
    category: 'Resell Intelligence',
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
    orbitRadius: 5.5,
    planetSize: 0.48,
    orbitSpeed: 0.38,
    category: 'AI Marketplace',
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
    orbitRadius: 8.0,
    planetSize: 0.62,
    orbitSpeed: 0.22,
    category: 'AI Workspace',
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
  },
];

export function getVentureBySlug(slug: string): Venture | undefined {
  return ventures.find((v) => v.slug === slug);
}

export function statusLabel(status: VentureStatus): string {
  return { live: 'Live', 'coming-soon': 'Coming Soon', incubation: 'In Incubation' }[status];
}
