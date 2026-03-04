# The Koifman Brief — Design Document

## Overview

A full publication platform for Shahar Koifman covering Geopolitics, FinTech, CRE/Real Estate, and Macro analysis. The site serves as a professional asset — authoritative, Googleable, and impressive to recruiters and industry peers.

All content is public. The publication's brand: macro forces that create structural shifts, and what decision-makers should actually do about them.

## Architecture

```
thekoifmanbrief.com
├── Next.js 14 (App Router, TypeScript, Tailwind CSS)
│   ├── Public pages (SSG with ISR)
│   ├── Keystatic admin UI (/keystatic)
│   └── API routes (Buttondown subscribe)
├── Content: Markdown/MDX files in /content/posts/
├── Hosting: Firebase Hosting
├── Newsletter: Buttondown API
└── Cost: $0 (free tiers)
```

### Content Workflow

1. Open `/keystatic` on the live site
2. Write/edit in Keystatic's rich text editor
3. Save — Keystatic commits Markdown files to the GitHub repo
4. GitHub push triggers Firebase Hosting rebuild
5. New content is live within ~1 minute

### Key Technology Choices

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | Next.js 14 (App Router) | SSG + ISR, React, TypeScript, industry standard |
| CMS | Keystatic | Free, Git-based, nice editor, built for Next.js |
| Styling | Tailwind CSS | Utility-first, fast iteration, dark mode support |
| Hosting | Firebase Hosting | Free tier, global CDN, user's preferred platform |
| Newsletter | Buttondown | Free up to 100 subs, simple API, clean |
| Domain | thekoifmanbrief.com | Personal brand, memorable, Googleable |

## Visual Design

### Design Style

Clean editorial minimalism. Generous whitespace, clear typographic hierarchy, horizontal rules separating content. The content is the design — no decorative elements.

References: The Economist, Foreign Affairs, Stratfor.

### Typography

- **Headings**: EB Garamond (serif) — authority and tradition
- **Body**: Lato (sans-serif) — clean, highly readable
- **CSS Import**: `@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap');`
- **Body line-height**: 1.7
- **Max reading width**: 680px
- **Min body font size**: 16px (18px on desktop)

### Color Palette

#### Light Mode

| Role | Hex |
|------|-----|
| Background | `#FAFAF8` |
| Surface | `#FFFFFF` |
| Text | `#1A1A1A` |
| Muted text | `#6B6B6B` |
| Accent (navy) | `#1B2A4A` |
| Category tags | `#2A6F6F` |
| Borders/rules | `#E5E5E3` |
| Link hover | `#8B4513` |

#### Dark Mode

| Role | Hex |
|------|-----|
| Background | `#141414` |
| Surface | `#1E1E1E` |
| Text | `#E8E8E6` |
| Muted text | `#9A9A9A` |
| Accent (navy) | `#7B9ACC` |
| Category tags | `#5BB8B8` |
| Borders/rules | `#2A2A2A` |
| Link hover | `#D4875A` |

Dark mode toggle: sun/moon icon in header. Respects `prefers-color-scheme` on first visit, persists user preference in localStorage.

## Pages

### Homepage (`/`)

- **Header**: "The Koifman Brief" in EB Garamond, horizontal rule, nav: Home | About | Subscribe
- **Tagline**: One-line beneath title (e.g., "Macro forces. Structural shifts. What to do about them.")
- **Latest post**: Featured prominently — title, date, category tag, opening paragraph
- **Post list**: Reverse chronological. Each entry: title, date, category tag, 2-line excerpt. Separated by horizontal rules
- **Subscribe CTA**: Inline form between posts — email field + "Subscribe" button

### Article Page (`/posts/[slug]`)

- **Article head**: Category tag, title (large EB Garamond), date, estimated read time
- **Body**: Markdown-rendered at ~680px max-width. Pull quotes, subheadings, standard formatting
- **Article footer**: Author bio card (photo, 2-line bio), share links (LinkedIn, X), Next/Previous navigation
- **Subscribe CTA**: Bottom of article, before footer

### About Page (`/about`)

- Professional headshot (to be provided)
- Expanded bio — intelligence background, FinTech, CRE, geopolitics expertise
- What this publication covers — the three domains and analytical lens
- Contact: LinkedIn, email

## Not Building (YAGNI)

- Category filtering (add when 10+ posts)
- Search (add when 50+ posts)
- Comments (LinkedIn and X are discussion venues)
- Tags page (categories suffice)
- RSS (add later, trivial with Keystatic)
- Members/gating (all content public)

## Newsletter Integration

- Buttondown subscribe form on homepage and article pages
- Email-only input field, no friction
- API route at `/api/subscribe` proxies to Buttondown API
- Success/error states on the form

## Accessibility

- WCAG AA compliance (4.5:1 contrast ratios)
- Visible focus states on all interactive elements
- Semantic HTML (article, nav, header, footer, main)
- `prefers-reduced-motion` respected for any animations
- All images have alt text
- Keyboard-navigable

## Pre-Delivery Checklist

- [ ] No emojis as icons (SVG only: Lucide)
- [ ] cursor-pointer on all clickable elements
- [ ] Hover transitions 150-300ms
- [ ] Light + dark mode contrast verified
- [ ] Focus states visible
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on mobile

## Product Refinement

### User Flows

**Reader (primary persona: recruiter, industry peer, or LinkedIn follower)**
1. Clicks link from LinkedIn/X/Google → lands on homepage or article
2. Reads article (the wow moment — this is the product)
3. Subscribes via inline email form (1 field, 1 click)
- **Clicks to wow: 1** (land → read)
- **Clicks to subscribe: 2** (enter email → click subscribe)

**Author (Shahar)**
1. Navigate to `/keystatic` → GitHub login
2. Click "New Post" → write in editor → set category → save
3. Auto-deploys in ~1 minute
- **Clicks to publish: 3**

### Simplicity Cuts

| Cut | Reason |
|-----|--------|
| Category filter on homepage | Not useful with < 10 posts. Category tags still show on each post for context. Add filter when content volume warrants it. |
| Custom analytics | Firebase Analytics or nothing. Don't build dashboards. |
| Email template design | Use Buttondown defaults. Content matters, not email styling. |
| Automated social posting | Manual LinkedIn/X posts are better — you control the hook and framing. |
| Complex image pipeline | Next.js Image component handles optimization. No custom CDN needed. |

### Scope Boundaries

**Appetite**: 2 weeks to launch-ready.

**Must-have (launch)**:
- Homepage with post list, tagline, subscribe form
- Article page with reading experience, share links, next/prev nav
- About page with photo and bio
- Dark mode toggle
- Keystatic CMS integration
- Buttondown subscribe API route
- Firebase Hosting deployment
- Responsive design (mobile-first)
- Open Graph / social cards (critical — LinkedIn is primary amplifier)
- Reading time estimate (trivial, high perceived quality)

**Post-launch (delighters)**:
- Category filtering
- Search
- RSS feed
- Custom 404 page

**Rabbit holes to avoid**:
- Over-designing the CMS admin experience (Keystatic handles this)
- ~~SEO beyond meta/OG tags~~ — SEO is a must-have: structured data, sitemap, canonical URLs, semantic HTML
- Performance micro-optimization (SSG on Firebase CDN is already fast)
- Building a preview/draft system (Keystatic has local preview built in)
