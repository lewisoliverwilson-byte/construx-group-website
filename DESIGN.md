# Design System — Construx Group

**"The Drawing Office"** — an engineer's technical drawing as a website. Quiet because engineers don't shout; the confidence is in the tolerances.

## Product Context
- **What this is:** The website of Construx Group, a UK-based AI development studio. The studio designs, engineers, and ships AI-native software.
- **Who it's for:** Prospective clients, collaborators, and the curious. People evaluating whether this team is serious.
- **Positioning:** AI development studio FIRST. The five live products are "current projects" — evidence, not the spine of the site.
- **Memorable impression:** "Serious engineering, AI-native." Quiet, premium, restrained.
- **Project type:** Studio / marketing site with journal.

## Aesthetic Direction
- **Direction:** The Drawing Office — technical-drawing precision, editorial calm. Registration marks, hairline rules, title-block layouts, mono annotations.
- **Decoration level:** Intentional — visible grid hairlines, orange crosshair registration marks at section intersections. Nothing else.
- **Mood:** An architect's office in daylight. A small intake of breath. Confidence through evidence, not volume.
- **Reference points:** Cognition's plate-rule layout, Anthropic's paper warmth — distinguished from both by the X-mark motif and rationed orange.

## Brand Assets (public/brand/)
- `construx-group-primary-light-@4x-1080px.png` — full lockup for paper ground (dark mark + wordmark on light)
- `construx-group-primary-dark-@4x-1080px.png` — full lockup for charcoal plates
- `construx-mark-512px.png` — X mark alone (favicons, avatars, compact nav)
- `construx-social-light/dark-1000px.png` — OG/social images
- The X mark: two crossing bars, one arm tipped orange. Echo it as a **registration-mark motif**: small orange crosshairs (✛) at grid intersections and section corners. Never stretch, recolour, or rotate the logo itself.

## Typography (all via Fontshare)
- **Display/Hero:** General Sans 600/700 — geometric grotesk that echoes the wordmark; tight tracking (-0.035em), set huge.
- **Body:** Erode 400/500 — a serif. The deliberate surprise: AI studios live in grotesk soup; serif body reads considered, human, editorial.
- **UI/Labels & Data:** JetBrains Mono 400/500 — the load-bearing details: nav, dates, project IDs, fact strips, footers. Small, letterspaced, uppercase.
- **Loading:** `https://api.fontshare.com/v2/css?f[]=general-sans@700,600,500,400&f[]=erode@400,500&f[]=jet-brains-mono@400,500&display=swap`
- **Scale:** hero clamp(3.2rem→7rem) / page clamp(2.6rem→4.4rem) / section clamp(1.8rem→2.8rem) / body 16-17px serif / meta 10-12px mono
- **BANNED:** Inter, Clash Display (removed from this project), Space Grotesk, Roboto, system-ui as primary.

## Color
- **Approach:** Restrained. Paper + ink + one rationed accent.
- **Paper (background):** `#F4F2ED` — warm off-white, paper not screen
- **Paper raised (cards/surfaces):** `#FBFAF7`
- **Hairlines/rules:** `#E2DFD7`
- **Ink (text primary):** `#16181A`
- **Ink muted:** `#6E6A63`
- **Ink faint (meta):** `#9B968C`
- **Charcoal plate (dark sections — projects band, footer):** bg `#111214`, text `#EDEAE4`, hairline `#26292E`, muted `#8A8D93`
- **Brand orange (accent):** `#F4731C` — **rationed brutally: max 3 appearances per viewport.** The logo X, one interactive/hover state, one annotation mark. NEVER headlines, NEVER backgrounds, NEVER gradients.
- **Status green (live/operational dots only):** `#2F6B4F` on paper, `#4A8467` on charcoal
- **Semantic:** success `#2F6B4F`, warning `#B07D2B`, error `#B3402E`, info `#3E5C74`
- **Dark mode:** none. The site is paper. Charcoal plates provide the dark moments.

## Spacing
- **Base unit:** 8px
- **Density:** Spacious — sections breathe, negative space is a material
- **Scale:** xs(8) sm(16) md(24) lg(40) xl(64) 2xl(96) 3xl(144)
- **Section padding:** py-24 → py-36 desktop

## Layout
- **Approach:** Grid-disciplined with drafting-plate character. 12-column grid with **visible hairline rules** on key pages. Hard left alignment; no centered-everything.
- **Hero pattern:** "Plate, not hero" — massive statement locked to a full-width title rule, mono fact strip beneath, numbered section index. No image, no button above the fold.
- **Page rhythm:** full-width sections separated by single hairlines, alternating dense (mono data rows) and sparse (one serif paragraph in space).
- **Projects:** numbered manifest table on the homepage (name / status / year / one line) — no screenshots on home. Detail pages may show one product frame.
- **Numbered sections:** 01/STUDIO 02/CAPABILITIES 03/PROJECTS 04/JOURNAL 05/CONTACT
- **Max content width:** 1280px (max-w-7xl), plates full-bleed
- **Border radius:** 0–2px. Drawing offices don't round corners. (Buttons/inputs: 2px.)

## Motion
- **Approach:** Minimal-functional. Fades, hairline draw-ins, nothing else.
- **Easing:** enter ease-out, exit ease-in
- **Duration:** micro 100ms / short 200ms / medium 350ms
- **No:** parallax, scroll-jacking, floating elements, glow pulses.

## The X Motif
- Small orange crosshair registration marks (13px, 1.5px stroke) at section corners / grid intersections — like print-alignment targets.
- Counts toward the orange ration.

## Writing & Voice
- Short declaratives. Studio-first. Zero hype vocabulary.
- Hero: "We build software with machines that build software."
- Identity line: "Construx Group is a UK engineering studio that designs and ships AI-native products — from research to production."
- Ventures are "current projects" / "the manifest" — listed as evidence, never sold.
- Mono annotations carry facts: `EST. 2025 / 5 PRODUCTS OPERATIONAL / UNITED KINGDOM`.

## What This Replaces
- Old system: `#000008` space theme, Clash Display + Inter, purple/cyan gradients, glassmorphism, 3D solar system hero, venture-first homepage. All retired.
- Per-venture accent colors survive ONLY inside project detail pages, muted, never on the homepage.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-12 | Initial design system created | /design-consultation: research (Cognition, Sierra, Anthropic, Vercel) + challenger subagent; user chose paper ground from 3 rendered variants |
| 2026-06-12 | Reposition: studio-first, projects de-emphasized | Founder decision |
| 2026-06-12 | Serif body (Erode) | Deliberate category departure — both design voices independently proposed serif body |
| 2026-06-12 | Orange rationed ≤3/viewport | Signature, not paint bucket |
