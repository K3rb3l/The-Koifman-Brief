# Remove Persian/FA Language Support

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all Persian (Farsi) language support — i18n system, RTL layout, FA translations, translate function, LanguageToggle component, FA hosting target, and translation scripts.

**Architecture:** Replace the `t()` / `postTitle()` / `postBody()` i18n indirection with direct English strings. Remove FA-specific CSS, fonts, components, Cloud Function, and Firebase hosting config.

**Tech Stack:** Next.js 16, Tailwind CSS v4, Firebase Functions, Firebase Hosting

---

## File Structure

### Delete
- `src/components/LanguageToggle.tsx` — language toggle component
- `src/lib/i18n.ts` — entire i18n system
- `scripts/translate-posts.ts` — one-time translation script
- `docs/plans/2026-03-09-persian-translation-design.md` — old spec
- `docs/plans/2026-03-09-persian-translation-plan.md` — old plan

### Modify
- `functions/src/index.ts` — remove `translateToFarsi` export and Anthropic imports
- `src/types/post.ts` — remove `title_fa`, `excerpt_fa`, `body_fa` fields
- `src/lib/posts-server.ts` — remove `title_fa`, `excerpt_fa` from PostMeta, remove locale filter
- `src/lib/utils.ts` — remove i18n imports, hardcode English
- `src/app/layout.tsx` — remove i18n imports, hardcode `lang="en"` `dir="ltr"`, remove Vazirmatn font
- `src/app/globals.css` — remove RTL CSS rules
- `src/app/posts/[slug]/page.tsx` — replace `postTitle`/`postExcerpt`/`siteUrl` with direct access
- `src/app/about/page.tsx` — replace `t()` calls with English strings
- `src/app/error.tsx` — replace `t()` calls with English strings
- `src/app/global-error.tsx` — replace `t()` calls with English strings
- `src/components/Header.tsx` — replace `t()` calls with English strings
- `src/components/Footer.tsx` — replace `t()` calls with English strings
- `src/components/HomeContent.tsx` — replace `t()` calls with English strings
- `src/components/PostContent.tsx` — replace `t()`/`postTitle`/`postBody` with direct access
- `src/components/PostCard.tsx` — replace `t()`/`postTitle`/`postExcerpt`/`isRTL` with direct access
- `src/components/PostNavigation.tsx` — replace `t()`/`postTitle`/`isRTL` with direct access
- `src/components/ArticlesContent.tsx` — replace `t()` with English strings
- `src/components/SubscribeForm.tsx` — replace `t()` with English strings
- `src/components/ShareLinks.tsx` — replace `t()`/`siteUrl` with direct values
- `src/components/AuthorCard.tsx` — replace `t()` with English strings
- `src/components/ThemeToggle.tsx` — replace `t()` with English strings
- `src/components/LoadingAnimation.tsx` — replace `t()` with English strings
- `src/components/CountUp.tsx` — remove `isRTL` import, simplify
- `src/components/ArticleEditor.tsx` — remove Persian translation section and auto-translate logic
- `firebase.json` — remove FA hosting target and `ignore: ["fa/**"]`

---

## Task 1: Remove translateToFarsi Cloud Function and translation script

**Files:**
- Modify: `functions/src/index.ts`
- Delete: `scripts/translate-posts.ts`

- [ ] **Step 1: Remove translateToFarsi from functions/src/index.ts**

Keep `admin.initializeApp()` and newsletter exports. Remove the Anthropic import, secret, and entire `translateToFarsi` export. The file should become:

```typescript
import * as admin from 'firebase-admin'
admin.initializeApp()

export { subscribe } from './newsletter/subscribe'
export { onPostPublished } from './newsletter/on-post-published'
export { sendNewsletter } from './newsletter/send-newsletter'
export { unsubscribe } from './newsletter/unsubscribe'
```

- [ ] **Step 2: Delete translate-posts.ts**

Run: `rm scripts/translate-posts.ts`

- [ ] **Step 3: Verify functions build**

Run: `cd functions && npm run build`
Expected: Compiles without errors

- [ ] **Step 4: Commit**

```bash
git rm scripts/translate-posts.ts
git add functions/src/index.ts
git commit -m "refactor: remove translateToFarsi function and translation script"
```

---

## Task 2: Remove i18n system and LanguageToggle

**Files:**
- Delete: `src/lib/i18n.ts`
- Delete: `src/components/LanguageToggle.tsx`

- [ ] **Step 1: Delete i18n.ts and LanguageToggle.tsx**

Run:
```bash
rm src/lib/i18n.ts
rm src/components/LanguageToggle.tsx
```

- [ ] **Step 2: Commit**

```bash
git rm src/lib/i18n.ts src/components/LanguageToggle.tsx
git commit -m "refactor: remove i18n system and LanguageToggle component"
```

---

## Task 3: Remove FA fields from types and server

**Files:**
- Modify: `src/types/post.ts`
- Modify: `src/lib/posts-server.ts`

- [ ] **Step 1: Remove fa fields from Post type**

Remove `title_fa?`, `excerpt_fa?`, `body_fa?` from `Post`. Remove `title_fa`, `excerpt_fa`, `body_fa` from `PostFormData`.

- [ ] **Step 2: Remove fa fields from posts-server.ts**

Remove `title_fa` and `excerpt_fa` from `PostMeta` type. Remove those fields from the mapping. Remove the locale filter block at the bottom of `getPublishedPostsServer`.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Will fail — other files still import from i18n. That's expected at this stage.

- [ ] **Step 4: Commit**

```bash
git add src/types/post.ts src/lib/posts-server.ts
git commit -m "refactor: remove Persian fields from post types and server"
```

---

## Task 4: Simplify utils.ts — remove i18n dependency

**Files:**
- Modify: `src/lib/utils.ts`

- [ ] **Step 1: Replace with English-only versions**

```typescript
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

- [ ] **Step 2: Commit**

```bash
git add src/lib/utils.ts
git commit -m "refactor: simplify utils to English-only"
```

---

## Task 5: Update layout.tsx — remove RTL, Vazirmatn, i18n

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace i18n imports with hardcoded values**

Remove `import { locale, isRTL, t, siteUrl } from '@/lib/i18n'`. Hardcode all values:
- `lang="en"`, `dir="ltr"`
- Title: `'The Koifman Brief'`
- Description: `'Clarity in complexity. Geopolitics, FinTech, and real estate analysis by Shahar Koifman.'`
- `metadataBase: new URL('https://thekoifmanbrief.com')`
- `locale: 'en_US'`
- Remove the conditional Vazirmatn font `<link>`

- [ ] **Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "refactor: remove i18n from layout, hardcode English"
```

---

## Task 6: Remove RTL CSS from globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Remove all `[dir="rtl"]` rules**

Remove lines 422-443 (the RTL body font, RTL drop cap, RTL link underline, RTL blockquote border blocks).

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "refactor: remove RTL CSS rules"
```

---

## Task 7: Update all components — replace t() with English strings

**Files:** All components that import from `@/lib/i18n`

- [ ] **Step 1: Update Header.tsx**

Remove `import { t } from '@/lib/i18n'`. Replace:
- `t('brand.name')` → `'The Koifman Brief'`
- `t('nav.home')` → `'Home'`
- `t('nav.about')` → `'About'`

- [ ] **Step 2: Update Footer.tsx**

Remove i18n import. Replace all `t()` calls with English values from the dictionary.

- [ ] **Step 3: Update HomeContent.tsx**

Remove i18n import. Replace all `t()` calls with English values.

- [ ] **Step 4: Update PostContent.tsx**

Remove `import { t, postTitle, postBody } from '@/lib/i18n'`. Replace:
- `postTitle(post)` → `post.title`
- `postBody(post)` → `post.body`
- All `t()` calls with English strings

- [ ] **Step 5: Update PostCard.tsx**

Remove `import { t, postTitle as getPostTitle, postExcerpt as getPostExcerpt, isRTL } from '@/lib/i18n'`. Replace:
- `getPostTitle(post)` → `post.title`
- `getPostExcerpt(post)` → `post.excerpt`
- `isRTL` → remove (use LTR arrow always)
- All `t()` calls with English strings

- [ ] **Step 6: Update PostNavigation.tsx**

Remove `import { t, postTitle, isRTL } from '@/lib/i18n'`. Replace:
- `postTitle(post)` → `post.title`
- `isRTL` conditionals → keep only LTR arrows
- All `t()` calls with English strings

- [ ] **Step 7: Update ArticlesContent.tsx**

Remove i18n import. Replace all `t()` calls.

- [ ] **Step 8: Update SubscribeForm.tsx**

Remove i18n import. Replace all `t()` calls.

- [ ] **Step 9: Update ShareLinks.tsx**

Remove `import { t, siteUrl } from '@/lib/i18n'`. Replace `siteUrl` with `'https://thekoifmanbrief.com'`. Replace `t()` calls.

- [ ] **Step 10: Update AuthorCard.tsx**

Remove i18n import. Replace all `t()` calls.

- [ ] **Step 11: Update ThemeToggle.tsx**

Remove i18n import. Replace all `t()` calls.

- [ ] **Step 12: Update LoadingAnimation.tsx**

Remove i18n import. Replace all `t()` calls.

- [ ] **Step 13: Update CountUp.tsx**

Remove `import { isRTL } from '@/lib/i18n'`. Remove `isRTL` conditional — keep only English number formatting.

- [ ] **Step 14: Update error.tsx and global-error.tsx**

Remove i18n imports. Replace `t()` calls with English strings.

- [ ] **Step 15: Update posts/[slug]/page.tsx**

Remove `import { postTitle, postExcerpt, siteUrl } from '@/lib/i18n'`. Replace:
- `postTitle(post)` → `post.title`
- `postExcerpt(post)` → `post.excerpt`
- `siteUrl` → `'https://thekoifmanbrief.com'`

- [ ] **Step 16: Update about/page.tsx**

Remove i18n import. Replace all `t()` calls with English strings.

- [ ] **Step 17: Commit**

```bash
git add src/components/ src/app/
git commit -m "refactor: replace i18n t() calls with English strings across all components"
```

---

## Task 8: Remove Persian section from ArticleEditor

**Files:**
- Modify: `src/components/ArticleEditor.tsx`

- [ ] **Step 1: Remove auto-translate logic**

Remove the block that calls `translateToFarsi` (around lines 151-172). Remove the `httpsCallable` and `functions` imports if only used for translation.

- [ ] **Step 2: Remove Persian Translation collapsible section**

Remove the entire `<details>` block (lines 328-368) for Persian translation fields.

- [ ] **Step 3: Remove fa form fields from initial state**

Remove `title_fa`, `excerpt_fa`, `body_fa` from the form initial state and from the save payload.

- [ ] **Step 4: Commit**

```bash
git add src/components/ArticleEditor.tsx
git commit -m "refactor: remove Persian translation section from article editor"
```

---

## Task 9: Clean up firebase.json — remove FA hosting target

**Files:**
- Modify: `firebase.json`

- [ ] **Step 1: Remove FA hosting config and fa ignore**

Remove `"ignore": ["fa/**"]` from the main hosting config. Remove the entire second hosting object (`the-koifman-brief-fa`). Change `"hosting"` from an array to a single object.

Result:
```json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs22"
  },
  "hosting": {
    "site": "the-koifman-brief",
    "public": "out",
    "cleanUrls": true,
    "rewrites": [
      { "source": "/admin/**", "destination": "/admin.html" },
      { "source": "/posts/**", "destination": "/posts.html" },
      { "source": "/unsubscribe", "function": "unsubscribe" },
      { "source": "**", "destination": "/404.html" }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add firebase.json
git commit -m "refactor: remove FA hosting target from firebase.json"
```

---

## Task 10: Delete old Persian translation docs

**Files:**
- Delete: `docs/plans/2026-03-09-persian-translation-design.md`
- Delete: `docs/plans/2026-03-09-persian-translation-plan.md`

- [ ] **Step 1: Delete docs**

```bash
rm docs/plans/2026-03-09-persian-translation-design.md
rm docs/plans/2026-03-09-persian-translation-plan.md
```

- [ ] **Step 2: Commit**

```bash
git rm docs/plans/2026-03-09-persian-translation-design.md docs/plans/2026-03-09-persian-translation-plan.md
git commit -m "chore: remove Persian translation design docs"
```

---

## Task 11: Verify build and test

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: Builds successfully with no i18n import errors

- [ ] **Step 2: Verify no remaining i18n references**

Run: `grep -r "from '@/lib/i18n'" src/`
Expected: No matches

Run: `grep -r "isRTL\|title_fa\|body_fa\|excerpt_fa" src/`
Expected: No matches
