# The Koifman Brief — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full publication platform for "The Koifman Brief" — an authoritative editorial site covering Geopolitics, FinTech, CRE, and Macro analysis.

**Architecture:** Next.js 14 (App Router) with Keystatic CMS for Git-based content management, deployed on Firebase App Hosting (Cloud Run). Buttondown for newsletter subscriptions. Dark mode support. SEO-ready with structured data, OG cards, and sitemap.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Keystatic CMS, Firebase App Hosting, Buttondown API, Markdoc, Lucide icons

**Design reference:** `docs/plans/2026-03-04-the-koifman-brief-design.md`

---

## File Structure

```
the-koifman-brief/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout (fonts, theme, metadata)
│   │   ├── page.tsx                      # Homepage
│   │   ├── posts/
│   │   │   └── [slug]/
│   │   │       └── page.tsx              # Article page
│   │   ├── about/
│   │   │   └── page.tsx                  # About page
│   │   ├── keystatic/
│   │   │   └── [[...params]]/
│   │   │       └── page.tsx              # Keystatic admin UI
│   │   └── api/
│   │       ├── keystatic/
│   │       │   └── [...params]/
│   │       │       └── route.ts          # Keystatic API handler
│   │       └── subscribe/
│   │           └── route.ts              # Buttondown subscribe endpoint
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── PostCard.tsx
│   │   ├── SubscribeForm.tsx
│   │   ├── AuthorCard.tsx
│   │   ├── ShareLinks.tsx
│   │   └── PostNavigation.tsx
│   └── lib/
│       ├── keystatic.ts                  # Keystatic reader instance
│       └── utils.ts                      # Reading time, date formatting
├── content/
│   └── posts/                            # Keystatic content directory
│       └── sample-post/
│           └── index.mdoc
├── public/
│   ├── images/
│   │   └── posts/                        # Post cover images
│   └── fonts/                            # Self-hosted fonts (optional)
├── keystatic.config.ts                   # Keystatic schema
├── next.config.mjs
├── tailwind.config.ts
├── apphosting.yaml                       # Firebase App Hosting config
├── firebase.json
├── .env.local                            # BUTTONDOWN_API_KEY
└── package.json
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `src/app/layout.tsx`, `src/app/page.tsx`

**Step 1: Initialize Next.js project**

```bash
cd /Users/kerbel/Projects/The-Koifman-Brief
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Accept defaults. This creates the full Next.js scaffolding.

**Step 2: Install dependencies**

```bash
npm install @keystatic/core @keystatic/next @markdoc/markdoc lucide-react next-themes next-sitemap
```

- `@keystatic/core` + `@keystatic/next`: CMS
- `@markdoc/markdoc`: Render Keystatic content
- `lucide-react`: SVG icons (no emojis)
- `next-themes`: Dark mode with system preference detection
- `next-sitemap`: Sitemap generation for SEO

**Step 3: Verify dev server starts**

```bash
npm run dev
```

Expected: Next.js dev server on http://localhost:3000

**Step 4: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js 14 project with dependencies"
```

---

### Task 2: Firebase Project + App Hosting Setup

**Files:**
- Create: `firebase.json`, `apphosting.yaml`, `.firebaserc`

**Step 1: Create new Firebase project**

```bash
firebase projects:create the-koifman-brief --display-name "The Koifman Brief"
```

If the ID is taken, try `the-koifman-brief-prod` or similar.

**Step 2: Set the project as active**

```bash
firebase use the-koifman-brief
```

**Step 3: Upgrade to Blaze plan**

Go to https://console.firebase.google.com/project/the-koifman-brief/usage/details and upgrade to Blaze (pay-as-you-go). This is required for App Hosting.

**Step 4: Initialize App Hosting**

```bash
firebase init apphosting
```

- Select the project created above
- Backend ID: `production`
- Root directory: `.`
- Connect GitHub repo when prompted (or skip and connect later)

This generates `apphosting.yaml` and updates `firebase.json`.

**Step 5: Configure apphosting.yaml**

```yaml
# apphosting.yaml
runConfig:
  concurrency: 80
  cpu: 1
  memoryMiB: 512
  minInstances: 0
  maxInstances: 4

env:
  - variable: BUTTONDOWN_API_KEY
    secret: buttondown-api-key
    availability:
      - RUNTIME
```

**Step 6: Commit**

```bash
git add firebase.json apphosting.yaml .firebaserc
git commit -m "chore: set up Firebase App Hosting"
```

---

### Task 3: Keystatic CMS Configuration

**Files:**
- Create: `keystatic.config.ts`, `src/app/keystatic/[[...params]]/page.tsx`, `src/app/api/keystatic/[...params]/route.ts`, `src/lib/keystatic.ts`, `content/posts/sample-post/index.mdoc`

**Step 1: Create Keystatic config**

```typescript
// keystatic.config.ts
import { config, fields, collection } from '@keystatic/core'

export default config({
  storage: { kind: 'local' },

  collections: {
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'content/posts/*/',
      format: { contentField: 'body' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({
          name: { label: 'Title' },
        }),
        date: fields.date({
          label: 'Published Date',
          validation: { isRequired: true },
        }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Geopolitics', value: 'geopolitics' },
            { label: 'FinTech', value: 'fintech' },
            { label: 'Real Estate', value: 'real-estate' },
            { label: 'Macro', value: 'macro' },
          ],
          defaultValue: 'geopolitics',
        }),
        excerpt: fields.text({
          label: 'Excerpt',
          description: 'Short summary for homepage cards and SEO meta description',
          multiline: true,
          validation: { isRequired: true },
        }),
        coverImage: fields.image({
          label: 'Cover Image',
          directory: 'public/images/posts',
          publicPath: '/images/posts',
        }),
        body: fields.markdoc({
          label: 'Body',
        }),
      },
    }),
  },
})
```

**Step 2: Create Keystatic admin UI route**

```typescript
// src/app/keystatic/[[...params]]/page.tsx
import { makePage } from '@keystatic/next/ui/app'
import config from '../../../../keystatic.config'

export default makePage(config)
```

**Step 3: Create Keystatic API route**

```typescript
// src/app/api/keystatic/[...params]/route.ts
import { makeRouteHandler } from '@keystatic/next/route-handler'
import config from '../../../../../keystatic.config'

export const { POST, GET } = makeRouteHandler({ config })
```

**Step 4: Create reader utility**

```typescript
// src/lib/keystatic.ts
import { createReader } from '@keystatic/core/reader'
import keystaticConfig from '../../keystatic.config'

export const reader = createReader(process.cwd(), keystaticConfig)
```

**Step 5: Create a sample post**

Create `content/posts/the-koifman-brief-launches/index.mdoc`:

```markdown
---
title: The Koifman Brief Launches
date: '2026-03-04'
category: macro
excerpt: >-
  Introducing The Koifman Brief — a publication covering the macro forces that
  create structural shifts, and what decision-makers should do about them.
---

Welcome to The Koifman Brief.

This publication sits at the intersection of geopolitics, financial technology, and commercial real estate — three domains that look disparate on the surface but share a common thread: macro forces that create structural shifts, and the second-order consequences that most analysis misses.

## What to expect

Each piece will focus on a specific development — a policy shift, a market signal, a regulatory change — and trace its implications beyond the obvious first-order effects. The goal is not prediction but clarity: understanding the forces at work well enough to make better decisions.

## Why these three domains?

Geopolitics shapes the operating environment for everything else. FinTech is where regulatory frameworks meet technological disruption. Commercial real estate is where macro forces become tangible — interest rates, demographic shifts, and policy changes all manifest in physical assets and capital flows.

The common thread is structural analysis applied to domains where most commentary stays surface-level.
```

**Step 6: Verify Keystatic admin loads**

```bash
npm run dev
```

Navigate to http://localhost:3000/keystatic — the admin UI should load showing the Posts collection with the sample post.

**Step 7: Commit**

```bash
git add keystatic.config.ts src/app/keystatic src/app/api/keystatic src/lib/keystatic.ts content/
git commit -m "feat: configure Keystatic CMS with post schema and sample content"
```

---

### Task 4: Design System — Tailwind Config, Fonts, Colors, Dark Mode

**Files:**
- Modify: `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`

**Step 1: Configure Tailwind with design tokens**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['EB Garamond', 'Georgia', 'serif'],
        sans: ['Lato', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        foreground: 'var(--color-foreground)',
        muted: 'var(--color-muted)',
        accent: 'var(--color-accent)',
        tag: 'var(--color-tag)',
        border: 'var(--color-border)',
        'link-hover': 'var(--color-link-hover)',
      },
      maxWidth: {
        article: '680px',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '680px',
            lineHeight: '1.7',
            color: 'var(--color-foreground)',
            a: {
              color: 'var(--color-accent)',
              '&:hover': {
                color: 'var(--color-link-hover)',
              },
            },
            h1: { fontFamily: 'EB Garamond, Georgia, serif' },
            h2: { fontFamily: 'EB Garamond, Georgia, serif' },
            h3: { fontFamily: 'EB Garamond, Georgia, serif' },
            h4: { fontFamily: 'EB Garamond, Georgia, serif' },
            blockquote: {
              borderLeftColor: 'var(--color-accent)',
              fontStyle: 'italic',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config
```

**Step 2: Install Tailwind typography plugin**

```bash
npm install @tailwindcss/typography
```

**Step 3: Set up CSS custom properties and fonts**

```css
/* src/app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Lato:wght@300;400;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-background: #FAFAF8;
    --color-surface: #FFFFFF;
    --color-foreground: #1A1A1A;
    --color-muted: #6B6B6B;
    --color-accent: #1B2A4A;
    --color-tag: #2A6F6F;
    --color-border: #E5E5E3;
    --color-link-hover: #8B4513;
  }

  .dark {
    --color-background: #141414;
    --color-surface: #1E1E1E;
    --color-foreground: #E8E8E6;
    --color-muted: #9A9A9A;
    --color-accent: #7B9ACC;
    --color-tag: #5BB8B8;
    --color-border: #2A2A2A;
    --color-link-hover: #D4875A;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
    font-size: 16px;
  }

  @media (min-width: 768px) {
    body {
      font-size: 18px;
    }
  }
}
```

**Step 4: Set up root layout with fonts and theme provider**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'The Koifman Brief',
    template: '%s | The Koifman Brief',
  },
  description: 'Macro forces. Structural shifts. What to do about them.',
  metadataBase: new URL('https://thekoifmanbrief.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'The Koifman Brief',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Step 5: Verify dark mode toggles correctly**

```bash
npm run dev
```

Check that the site renders with the correct light mode colors. Inspect the `<html>` element — `next-themes` should add/remove the `dark` class.

**Step 6: Commit**

```bash
git add tailwind.config.ts src/app/globals.css src/app/layout.tsx package.json package-lock.json
git commit -m "feat: design system with editorial typography, color palette, and dark mode"
```

---

### Task 5: Layout Components — Header, Footer, ThemeToggle

**Files:**
- Create: `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/components/ThemeToggle.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create ThemeToggle component**

```tsx
// src/components/ThemeToggle.tsx
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="w-9 h-9" /> // placeholder to prevent layout shift
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="cursor-pointer p-2 text-muted hover:text-foreground transition-colors duration-200"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
```

**Step 2: Create Header component**

```tsx
// src/components/Header.tsx
import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity duration-200">
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              The Koifman Brief
            </h1>
          </Link>
          <div className="flex items-center gap-6">
            <nav className="hidden sm:flex items-center gap-6 text-sm font-sans">
              <Link href="/" className="text-muted hover:text-foreground transition-colors duration-200 cursor-pointer">
                Home
              </Link>
              <Link href="/about" className="text-muted hover:text-foreground transition-colors duration-200 cursor-pointer">
                About
              </Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
        <p className="mt-2 text-sm text-muted font-sans">
          Macro forces. Structural shifts. What to do about them.
        </p>
      </div>
    </header>
  )
}
```

**Step 3: Create Footer component**

```tsx
// src/components/Footer.tsx
export function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <p className="text-sm text-muted font-sans">
          &copy; {new Date().getFullYear()} The Koifman Brief. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
```

**Step 4: Wire layout components into root layout**

Update `src/app/layout.tsx` to include Header and Footer wrapping `{children}`:

```tsx
// src/app/layout.tsx — update the body content
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

// ... (keep existing metadata and imports)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="max-w-3xl mx-auto px-6 py-12">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Step 5: Verify layout renders correctly**

```bash
npm run dev
```

Check: header with title + tagline + nav + dark mode toggle, footer with copyright. Toggle dark mode — all colors should switch correctly.

**Step 6: Commit**

```bash
git add src/components/ src/app/layout.tsx
git commit -m "feat: header, footer, and dark mode toggle components"
```

---

### Task 6: Utility Functions

**Files:**
- Create: `src/lib/utils.ts`, `src/lib/__tests__/utils.test.ts`

**Step 1: Write tests for utility functions**

```typescript
// src/lib/__tests__/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatDate, estimateReadingTime, slugToTitle } from '../utils'

describe('formatDate', () => {
  it('formats ISO date to readable string', () => {
    expect(formatDate('2026-03-04')).toBe('March 4, 2026')
  })
})

describe('estimateReadingTime', () => {
  it('returns 1 min for short content', () => {
    expect(estimateReadingTime('Hello world')).toBe('1 min read')
  })

  it('calculates correctly for longer content', () => {
    const words = Array(500).fill('word').join(' ')
    expect(estimateReadingTime(words)).toBe('3 min read')
  })
})

describe('slugToTitle', () => {
  it('converts slug to title case', () => {
    expect(slugToTitle('geopolitics')).toBe('Geopolitics')
    expect(slugToTitle('real-estate')).toBe('Real Estate')
    expect(slugToTitle('fintech')).toBe('FinTech')
  })
})
```

**Step 2: Install vitest and run failing tests**

```bash
npm install -D vitest
npx vitest run src/lib/__tests__/utils.test.ts
```

Expected: FAIL — module not found.

**Step 3: Implement utility functions**

```typescript
// src/lib/utils.ts
export function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function estimateReadingTime(content: string): string {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute))
  return `${minutes} min read`
}

const CATEGORY_LABELS: Record<string, string> = {
  geopolitics: 'Geopolitics',
  fintech: 'FinTech',
  'real-estate': 'Real Estate',
  macro: 'Macro',
}

export function slugToTitle(slug: string): string {
  return CATEGORY_LABELS[slug] ?? slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
```

**Step 4: Run tests to verify they pass**

```bash
npx vitest run src/lib/__tests__/utils.test.ts
```

Expected: 4 tests PASS.

**Step 5: Commit**

```bash
git add src/lib/utils.ts src/lib/__tests__/ package.json package-lock.json
git commit -m "feat: utility functions for date formatting, reading time, and category labels"
```

---

### Task 7: Homepage

**Files:**
- Create: `src/components/PostCard.tsx`, `src/components/SubscribeForm.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Create PostCard component**

```tsx
// src/components/PostCard.tsx
import Link from 'next/link'
import { formatDate, slugToTitle } from '@/lib/utils'

type PostCardProps = {
  slug: string
  title: string
  date: string
  category: string
  excerpt: string
  featured?: boolean
}

export function PostCard({ slug, title, date, category, excerpt, featured }: PostCardProps) {
  return (
    <article className={featured ? 'mb-12' : ''}>
      <Link href={`/posts/${slug}`} className="group cursor-pointer block">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-sans font-medium uppercase tracking-wider text-tag">
            {slugToTitle(category)}
          </span>
          <span className="text-xs text-muted font-sans">
            {formatDate(date)}
          </span>
        </div>
        <h2 className={`font-serif font-semibold text-foreground group-hover:text-link-hover transition-colors duration-200 ${featured ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>
          {title}
        </h2>
        <p className="mt-2 text-muted font-sans leading-relaxed line-clamp-2">
          {excerpt}
        </p>
      </Link>
    </article>
  )
}
```

**Step 2: Create SubscribeForm component**

```tsx
// src/components/SubscribeForm.tsx
'use client'

import { useState, type FormEvent } from 'react'

export function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) throw new Error()
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="border-y border-border py-8 my-12">
        <p className="text-center font-sans text-foreground">
          You're subscribed. Check your email to confirm.
        </p>
      </div>
    )
  }

  return (
    <div className="border-y border-border py-8 my-12">
      <p className="font-serif text-lg text-foreground mb-1">
        Get the next brief in your inbox
      </p>
      <p className="text-sm text-muted font-sans mb-4">
        Concise analysis on macro forces and structural shifts. No spam.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 px-4 py-2 border border-border bg-surface text-foreground font-sans text-sm rounded-none focus:outline-none focus:border-accent transition-colors duration-200"
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-6 py-2 bg-accent text-white font-sans text-sm cursor-pointer hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {status === 'error' && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-sans">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  )
}
```

**Step 3: Build the homepage**

```tsx
// src/app/page.tsx
import { reader } from '@/lib/keystatic'
import { PostCard } from '@/components/PostCard'
import { SubscribeForm } from '@/components/SubscribeForm'

export default async function HomePage() {
  const posts = await reader.collections.posts.all()

  const sortedPosts = posts
    .filter((post) => post.entry.date)
    .sort((a, b) => {
      const dateA = new Date(a.entry.date!).getTime()
      const dateB = new Date(b.entry.date!).getTime()
      return dateB - dateA
    })

  const [featured, ...rest] = sortedPosts

  return (
    <div>
      {featured && (
        <PostCard
          slug={featured.slug}
          title={featured.entry.title}
          date={featured.entry.date!}
          category={featured.entry.category}
          excerpt={featured.entry.excerpt}
          featured
        />
      )}

      <SubscribeForm />

      {rest.length > 0 && (
        <div className="space-y-8">
          {rest.map((post) => (
            <div key={post.slug} className="border-b border-border pb-8 last:border-b-0">
              <PostCard
                slug={post.slug}
                title={post.entry.title}
                date={post.entry.date!}
                category={post.entry.category}
                excerpt={post.entry.excerpt}
              />
            </div>
          ))}
        </div>
      )}

      {sortedPosts.length === 0 && (
        <p className="text-muted font-sans">No posts yet. Check back soon.</p>
      )}
    </div>
  )
}
```

**Step 4: Verify homepage renders with sample post**

```bash
npm run dev
```

Expected: Homepage shows the sample post as featured, with subscribe form below it.

**Step 5: Commit**

```bash
git add src/app/page.tsx src/components/PostCard.tsx src/components/SubscribeForm.tsx
git commit -m "feat: homepage with post list and subscribe form"
```

---

### Task 8: Article Page

**Files:**
- Create: `src/app/posts/[slug]/page.tsx`, `src/components/AuthorCard.tsx`, `src/components/ShareLinks.tsx`, `src/components/PostNavigation.tsx`

**Step 1: Create AuthorCard component**

```tsx
// src/components/AuthorCard.tsx
import Image from 'next/image'

export function AuthorCard() {
  return (
    <div className="flex items-center gap-4 py-6 border-t border-border mt-12">
      <Image
        src="/images/shahar-koifman.jpg"
        alt="Shahar Koifman"
        width={56}
        height={56}
        className="rounded-full"
      />
      <div>
        <p className="font-serif font-semibold text-foreground">Shahar Koifman</p>
        <p className="text-sm text-muted font-sans">
          Intelligence background. FinTech, CRE, and geopolitics analyst.
        </p>
      </div>
    </div>
  )
}
```

**Step 2: Create ShareLinks component**

```tsx
// src/components/ShareLinks.tsx
'use client'

import { Linkedin, Twitter } from 'lucide-react'

type ShareLinksProps = {
  title: string
  slug: string
}

export function ShareLinks({ title, slug }: ShareLinksProps) {
  const url = `https://thekoifmanbrief.com/posts/${slug}`
  const encodedTitle = encodeURIComponent(title)
  const encodedUrl = encodeURIComponent(url)

  return (
    <div className="flex items-center gap-4 mt-6">
      <span className="text-sm text-muted font-sans">Share:</span>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted hover:text-foreground transition-colors duration-200 cursor-pointer"
        aria-label="Share on LinkedIn"
      >
        <Linkedin size={18} />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted hover:text-foreground transition-colors duration-200 cursor-pointer"
        aria-label="Share on X"
      >
        <Twitter size={18} />
      </a>
    </div>
  )
}
```

**Step 3: Create PostNavigation component**

```tsx
// src/components/PostNavigation.tsx
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type PostNavigationProps = {
  previous: { slug: string; title: string } | null
  next: { slug: string; title: string } | null
}

export function PostNavigation({ previous, next }: PostNavigationProps) {
  if (!previous && !next) return null

  return (
    <nav className="flex justify-between items-start gap-8 border-t border-border pt-8 mt-8">
      {previous ? (
        <Link
          href={`/posts/${previous.slug}`}
          className="group flex items-start gap-2 cursor-pointer max-w-[45%]"
        >
          <ChevronLeft size={16} className="mt-1 text-muted group-hover:text-foreground transition-colors duration-200 shrink-0" />
          <div>
            <span className="text-xs text-muted font-sans uppercase tracking-wider">Previous</span>
            <p className="font-serif text-sm text-foreground group-hover:text-link-hover transition-colors duration-200">
              {previous.title}
            </p>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/posts/${next.slug}`}
          className="group flex items-start gap-2 cursor-pointer text-right max-w-[45%]"
        >
          <div>
            <span className="text-xs text-muted font-sans uppercase tracking-wider">Next</span>
            <p className="font-serif text-sm text-foreground group-hover:text-link-hover transition-colors duration-200">
              {next.title}
            </p>
          </div>
          <ChevronRight size={16} className="mt-1 text-muted group-hover:text-foreground transition-colors duration-200 shrink-0" />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  )
}
```

**Step 4: Build the article page**

```tsx
// src/app/posts/[slug]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Markdoc from '@markdoc/markdoc'
import React from 'react'
import { reader } from '@/lib/keystatic'
import { formatDate, estimateReadingTime, slugToTitle } from '@/lib/utils'
import { AuthorCard } from '@/components/AuthorCard'
import { ShareLinks } from '@/components/ShareLinks'
import { PostNavigation } from '@/components/PostNavigation'
import { SubscribeForm } from '@/components/SubscribeForm'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await reader.collections.posts.list()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await reader.collections.posts.read(slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date ?? undefined,
      authors: ['Shahar Koifman'],
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await reader.collections.posts.read(slug)
  if (!post) notFound()

  const { node } = await post.body()
  const renderable = Markdoc.transform(node)
  const content = Markdoc.renderers.react(renderable, React)

  // Get raw text for reading time
  const textContent = Markdoc.renderers.html(renderable) ?? ''
  const plainText = textContent.replace(/<[^>]*>/g, '')
  const readingTime = estimateReadingTime(plainText)

  // Get all posts sorted by date for navigation
  const allPosts = await reader.collections.posts.all()
  const sorted = allPosts
    .filter((p) => p.entry.date)
    .sort((a, b) => new Date(b.entry.date!).getTime() - new Date(a.entry.date!).getTime())

  const currentIndex = sorted.findIndex((p) => p.slug === slug)
  const previous = currentIndex < sorted.length - 1
    ? { slug: sorted[currentIndex + 1].slug, title: sorted[currentIndex + 1].entry.title }
    : null
  const next = currentIndex > 0
    ? { slug: sorted[currentIndex - 1].slug, title: sorted[currentIndex - 1].entry.title }
    : null

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: 'Shahar Koifman',
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Koifman Brief',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-sans font-medium uppercase tracking-wider text-tag">
              {slugToTitle(post.category)}
            </span>
            <span className="text-xs text-muted font-sans">
              {formatDate(post.date!)}
            </span>
            <span className="text-xs text-muted font-sans">
              {readingTime}
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
            {post.title}
          </h1>
        </header>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          {content}
        </div>

        <ShareLinks title={post.title} slug={slug} />
        <AuthorCard />
        <PostNavigation previous={previous} next={next} />
      </article>

      <SubscribeForm />
    </>
  )
}
```

**Step 5: Verify article page renders**

```bash
npm run dev
```

Navigate to http://localhost:3000/posts/the-koifman-brief-launches — should show full article with reading time, author card, share links, and subscribe form.

**Step 6: Commit**

```bash
git add src/app/posts/ src/components/AuthorCard.tsx src/components/ShareLinks.tsx src/components/PostNavigation.tsx
git commit -m "feat: article page with reading time, author card, sharing, and post navigation"
```

---

### Task 9: About Page

**Files:**
- Create: `src/app/about/page.tsx`

**Step 1: Build the about page**

```tsx
// src/app/about/page.tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import { SubscribeForm } from '@/components/SubscribeForm'

export const metadata: Metadata = {
  title: 'About',
  description: 'About Shahar Koifman and The Koifman Brief.',
}

export default function AboutPage() {
  return (
    <div className="max-w-article">
      <div className="flex flex-col sm:flex-row items-start gap-8 mb-12">
        <Image
          src="/images/shahar-koifman.jpg"
          alt="Shahar Koifman"
          width={160}
          height={160}
          className="rounded-md"
          priority
        />
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
            Shahar Koifman
          </h1>
          <p className="text-muted font-sans leading-relaxed">
            {/* Bio to be provided by the user */}
            Intelligence background with expertise spanning geopolitics, financial technology, and commercial real estate. Focused on the macro forces that create structural shifts — and the second-order consequences that most analysis misses.
          </p>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
          What This Publication Covers
        </h2>
        <div className="space-y-4 text-foreground font-sans leading-relaxed">
          <p>
            The Koifman Brief sits at the intersection of three domains that look disparate on the surface but share a common analytical thread.
          </p>
          <ul className="list-none space-y-4 pl-0">
            <li>
              <strong className="text-accent">Geopolitics</strong> — The operating environment that shapes everything else. Policy shifts, sanctions regimes, and regional dynamics that create structural risks and opportunities.
            </li>
            <li>
              <strong className="text-accent">FinTech</strong> — Where regulatory frameworks meet technological disruption. Payments, digital assets, and the infrastructure that moves capital.
            </li>
            <li>
              <strong className="text-accent">Real Estate</strong> — Where macro forces become tangible. Interest rates, demographic shifts, and policy changes manifest in physical assets and capital flows.
            </li>
          </ul>
          <p>
            Each piece traces implications beyond the obvious first-order effects. The goal is not prediction but clarity — understanding the forces at work well enough to make better decisions.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
          Connect
        </h2>
        <div className="flex gap-6 font-sans text-sm">
          <a
            href="https://linkedin.com/in/shaharkoifman"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-link-hover transition-colors duration-200 cursor-pointer"
          >
            LinkedIn
          </a>
          <a
            href="mailto:shahar@koifmanbrief.com"
            className="text-accent hover:text-link-hover transition-colors duration-200 cursor-pointer"
          >
            Email
          </a>
        </div>
      </section>

      <SubscribeForm />
    </div>
  )
}
```

Note: The photo `/images/shahar-koifman.jpg` needs to be provided and placed in `public/images/`. Use a placeholder until then.

**Step 2: Verify about page renders**

```bash
npm run dev
```

Navigate to http://localhost:3000/about.

**Step 3: Commit**

```bash
git add src/app/about/
git commit -m "feat: about page with bio and publication description"
```

---

### Task 10: Buttondown Subscribe API Route

**Files:**
- Create: `src/app/api/subscribe/route.ts`, `.env.local`

**Step 1: Create .env.local**

```bash
echo "BUTTONDOWN_API_KEY=your-api-key-here" > .env.local
```

Get the real API key from https://buttondown.com/settings/api.

Make sure `.env.local` is in `.gitignore` (Next.js adds it by default).

**Step 2: Write the API route**

```typescript
// src/app/api/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json(
      { error: 'Email is required' },
      { status: 400 },
    )
  }

  const res = await fetch('https://api.buttondown.com/v1/subscribers', {
    method: 'POST',
    headers: {
      Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email_address: email }),
  })

  if (!res.ok) {
    const error = await res.json()
    // Buttondown returns 400 for duplicate emails
    if (res.status === 400) {
      return NextResponse.json(
        { error: 'This email is already subscribed.' },
        { status: 400 },
      )
    }
    return NextResponse.json(
      { error: 'Subscription failed' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
```

**Step 3: Test the subscribe flow**

```bash
npm run dev
```

Use the subscribe form on the homepage. With the placeholder API key, it will fail — but verify the form submits and shows the error state correctly. Once a real Buttondown key is set, test the full flow.

**Step 4: Commit**

```bash
git add src/app/api/subscribe/
git commit -m "feat: Buttondown newsletter subscribe API route"
```

---

### Task 11: SEO — Sitemap, Robots, Canonical URLs

**Files:**
- Create: `next-sitemap.config.js`
- Modify: `package.json` (postbuild script)

**Step 1: Configure next-sitemap**

```javascript
// next-sitemap.config.js
/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://thekoifmanbrief.com',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
    ],
  },
}

module.exports = config
```

**Step 2: Add postbuild script to package.json**

Add to the `"scripts"` section:

```json
"postbuild": "next-sitemap"
```

**Step 3: Verify sitemap generates on build**

```bash
npm run build
```

Check that `public/sitemap.xml` and `public/robots.txt` are generated.

**Step 4: Commit**

```bash
git add next-sitemap.config.js package.json
git commit -m "feat: sitemap and robots.txt generation for SEO"
```

---

### Task 12: Final Polish & Deployment

**Files:**
- Modify: various for final checks

**Step 1: Add a placeholder author image**

Until the real photo is provided, create a placeholder:

```bash
# Use a simple 1x1 pixel placeholder or skip — the Image component will error without a file
# For now, create a minimal placeholder
convert -size 160x160 xc:gray public/images/shahar-koifman.jpg 2>/dev/null || echo "Add author photo to public/images/shahar-koifman.jpg"
```

**Step 2: Run the production build locally**

```bash
npm run build && npm start
```

Check all pages:
- [ ] Homepage renders with post list and subscribe form
- [ ] Article page renders with full content, share links, author card, navigation
- [ ] About page renders with photo placeholder and bio
- [ ] Dark mode toggle works across all pages
- [ ] Mobile responsive at 375px width
- [ ] No horizontal scroll

**Step 3: Deploy to Firebase App Hosting**

```bash
firebase deploy
```

Or if GitHub is connected, push to main and it auto-deploys.

**Step 4: Verify live site**

Check the deployed URL provided by Firebase. Verify all pages work in production.

**Step 5: Final commit**

```bash
git add .
git commit -m "chore: production-ready build verified"
```

---

## Post-Launch Improvements (Not In Scope)

- Category filtering on homepage
- RSS feed
- Search functionality
- Custom 404 page
- Keystatic GitHub mode (write from production URL)
- Custom domain setup (thekoifmanbrief.com)
- Firebase Analytics integration
