# Persian Translation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add full Persian (Farsi) translation to The Koifman Brief, served from `fa.thekoifmanbrief.com`, with AI-powered auto-translation in the admin panel.

**Architecture:** Two separate static builds from the same codebase, controlled by `NEXT_PUBLIC_LOCALE` env var (`en` or `fa`). Components use a `t()` function for UI strings and read locale-appropriate post fields. A Firebase Cloud Function proxies Claude API for auto-translation on article save.

**Tech Stack:** Next.js 16 static export, Tailwind v4, Firestore, Firebase Hosting (two sites), Firebase Cloud Functions, Claude API (Anthropic SDK), Vazirmatn font.

---

### Task 1: Create branch and locale system

**Files:**
- Create: `src/lib/i18n.ts`

**Step 1: Create feature branch**

```bash
git checkout -b feat/persian-translation
```

**Step 2: Create the i18n module**

Create `src/lib/i18n.ts`:

```typescript
export type Locale = 'en' | 'fa'

export const locale: Locale =
  (process.env.NEXT_PUBLIC_LOCALE as Locale) ?? 'en'

export const isRTL = locale === 'fa'

export const siteUrl =
  locale === 'fa'
    ? 'https://fa.thekoifmanbrief.com'
    : 'https://thekoifmanbrief.com'

export const alternateSiteUrl =
  locale === 'fa'
    ? 'https://thekoifmanbrief.com'
    : 'https://fa.thekoifmanbrief.com'

const dict: Record<string, { en: string; fa: string }> = {
  // Brand
  'brand.name': { en: 'The Koifman Brief', fa: 'خلاصه کویفمن' },
  'brand.tagline': { en: 'Clarity in complexity', fa: 'وضوح در پیچیدگی' },

  // Nav
  'nav.home': { en: 'Home', fa: 'خانه' },
  'nav.about': { en: 'About', fa: 'درباره' },

  // Language toggle
  'lang.switch': { en: 'فارسی', fa: 'English' },

  // Home
  'home.byline': { en: 'by Shahar Koifman', fa: 'نوشته شاهار کویفمن' },
  'home.subtitle': {
    en: 'Geopolitics, FinTech, and real estate — tracing the macro forces that create structural shifts.',
    fa: 'ژئوپلیتیک، فین‌تک و املاک — ردیابی نیروهای کلان که تحولات ساختاری ایجاد می‌کنند.',
  },
  'home.prev': { en: 'Prev', fa: 'قبلی' },
  'home.next': { en: 'Next', fa: 'بعدی' },
  'home.empty': { en: 'No briefs yet. Check back soon.', fa: 'هنوز مطلبی منتشر نشده. به‌زودی بازگردید.' },

  // Post card
  'post.briefNo': { en: 'No.', fa: 'شماره' },
  'post.readBrief': { en: 'Read brief', fa: 'خواندن مطلب' },

  // Post content
  'post.notFound.title': { en: 'Brief not found', fa: 'مطلب یافت نشد' },
  'post.notFound.body': {
    en: "This brief doesn't exist or has been removed.",
    fa: 'این مطلب وجود ندارد یا حذف شده است.',
  },
  'post.byline': { en: 'By Shahar Koifman', fa: 'نوشته شاهار کویفمن' },

  // Post navigation
  'post.previous': { en: 'Previous', fa: 'قبلی' },
  'post.next': { en: 'Next', fa: 'بعدی' },

  // Articles page
  'articles.archive': { en: 'Archive', fa: 'آرشیو' },
  'articles.allBriefs': { en: 'All Briefs', fa: 'همه مطالب' },
  'articles.published': { en: 'published', fa: 'منتشر شده' },
  'articles.brief': { en: 'brief', fa: 'مطلب' },
  'articles.briefs': { en: 'briefs', fa: 'مطلب' },
  'articles.empty': { en: 'No briefs yet.', fa: 'هنوز مطلبی منتشر نشده.' },

  // About page
  'about.title': { en: 'About', fa: 'درباره' },
  'about.description': {
    en: 'About Shahar Koifman and The Koifman Brief.',
    fa: 'درباره شاهار کویفمن و خلاصه کویفمن.',
  },
  'about.name': { en: 'Shahar Koifman', fa: 'شاهار کویفمن' },
  'about.bio1': {
    en: 'Shahar Koifman spent over 20 years in Israeli Defense Intelligence, retiring as Lt. Col. from the Research & Analysis Division. He went on to lead investment research in the private sector, covering financial technology and commercial real estate.',
    fa: 'شاهار کویفمن بیش از ۲۰ سال در اطلاعات دفاعی اسرائیل خدمت کرد و با درجه سرهنگ‌دوم از بخش تحقیق و تحلیل بازنشسته شد. او سپس رهبری تحقیقات سرمایه‌گذاری در بخش خصوصی را بر عهده گرفت و حوزه‌های فناوری مالی و املاک تجاری را پوشش داد.',
  },
  'about.bio2': {
    en: 'The Koifman Brief draws on both worlds: the analytical rigor of intelligence work applied to the macro forces and structural shifts that shape geopolitics, markets, and capital flows.',
    fa: 'خلاصه کویفمن از هر دو دنیا بهره می‌برد: دقت تحلیلی کار اطلاعاتی در کنار نیروهای کلان و تحولات ساختاری که ژئوپلیتیک، بازارها و جریان سرمایه را شکل می‌دهند.',
  },
  'about.whatIWrite': { en: 'What I Write About', fa: 'درباره چه می‌نویسم' },
  'about.intro': {
    en: 'The Koifman Brief sits at the intersection of three domains that look disparate on the surface but share a common analytical thread.',
    fa: 'خلاصه کویفمن در تقاطع سه حوزه قرار دارد که در ظاهر متفاوت به نظر می‌رسند اما ریشه تحلیلی مشترکی دارند.',
  },
  'about.geo.label': { en: 'Geopolitics:', fa: 'ژئوپلیتیک:' },
  'about.geo.desc': {
    en: 'The operating environment that shapes everything else. Policy shifts, sanctions regimes, and regional dynamics that create structural risks and opportunities.',
    fa: 'محیط عملیاتی که همه چیز دیگر را شکل می‌دهد. تغییرات سیاستی، رژیم‌های تحریمی و پویایی‌های منطقه‌ای که ریسک‌ها و فرصت‌های ساختاری ایجاد می‌کنند.',
  },
  'about.fintech.label': { en: 'FinTech:', fa: 'فین‌تک:' },
  'about.fintech.desc': {
    en: 'Where regulatory frameworks meet technological disruption. Payments, digital assets, and the infrastructure that moves capital.',
    fa: 'جایی که چارچوب‌های نظارتی با اختلال فناوری روبرو می‌شوند. پرداخت‌ها، دارایی‌های دیجیتال و زیرساختی که سرمایه را جابجا می‌کند.',
  },
  'about.realestate.label': { en: 'Real Estate:', fa: 'املاک:' },
  'about.realestate.desc': {
    en: 'Where macro forces become tangible. Interest rates, demographic shifts, and policy changes manifest in physical assets and capital flows.',
    fa: 'جایی که نیروهای کلان ملموس می‌شوند. نرخ بهره، تغییرات جمعیتی و تغییرات سیاستی در دارایی‌های فیزیکی و جریان سرمایه تجلی می‌یابند.',
  },
  'about.conclusion': {
    en: 'Each piece traces implications beyond the obvious first-order effects. The goal is not prediction but clarity: understanding the forces at work well enough to make better decisions.',
    fa: 'هر مطلب پیامدها را فراتر از اثرات بدیهی مرتبه اول ردیابی می‌کند. هدف پیش‌بینی نیست بلکه وضوح است: درک نیروهای در کار به اندازه‌ای که تصمیم‌گیری بهتری ممکن شود.',
  },
  'about.connect': { en: 'Connect', fa: 'ارتباط' },
  'about.linkedin': { en: 'LinkedIn', fa: 'لینکدین' },
  'about.email': { en: 'Email', fa: 'ایمیل' },

  // Subscribe
  'subscribe.label': { en: 'Newsletter', fa: 'خبرنامه' },
  'subscribe.heading': { en: 'Get the next brief', fa: 'مطلب بعدی را دریافت کنید' },
  'subscribe.description': {
    en: 'Concise analysis on macro forces and structural shifts. No spam.',
    fa: 'تحلیل مختصر درباره نیروهای کلان و تحولات ساختاری. بدون هرزنامه.',
  },
  'subscribe.placeholder': { en: 'your@email.com', fa: 'ایمیل شما' },
  'subscribe.button': { en: 'Subscribe', fa: 'عضویت' },
  'subscribe.loading': { en: 'Subscribing', fa: 'در حال عضویت' },
  'subscribe.success': {
    en: "You're subscribed. Check your email to confirm.",
    fa: 'عضو شدید. ایمیل خود را برای تأیید بررسی کنید.',
  },
  'subscribe.error': {
    en: 'Something went wrong. Please try again.',
    fa: 'مشکلی پیش آمد. لطفاً دوباره تلاش کنید.',
  },

  // Share
  'share.label': { en: 'Share:', fa: 'اشتراک‌گذاری:' },
  'share.linkedin': { en: 'Share on LinkedIn', fa: 'اشتراک در لینکدین' },
  'share.x': { en: 'Share on X', fa: 'اشتراک در ایکس' },

  // Author card
  'author.name': { en: 'Shahar Koifman', fa: 'شاهار کویفمن' },
  'author.bio': {
    en: 'Intelligence background. FinTech, CRE, and geopolitics analyst.',
    fa: 'پیشینه اطلاعاتی. تحلیلگر فین‌تک، املاک تجاری و ژئوپلیتیک.',
  },

  // Footer
  'footer.copyright': { en: 'The Koifman Brief', fa: 'خلاصه کویفمن' },
  'footer.linkedin': { en: 'Follow on LinkedIn', fa: 'دنبال کردن در لینکدین' },
  'footer.x': { en: 'Follow on X', fa: 'دنبال کردن در ایکس' },

  // Errors
  'error.title': { en: 'Something went wrong', fa: 'مشکلی پیش آمد' },
  'error.message': { en: 'Please try refreshing the page.', fa: 'لطفاً صفحه را مجدداً بارگذاری کنید.' },
  'error.retry': { en: 'Try again', fa: 'تلاش مجدد' },

  // Loading
  'loading.title': { en: 'THE KOIFMAN BRIEF', fa: 'خلاصه کویفمن' },
  'loading.tagline': { en: 'Clarity in complexity', fa: 'وضوح در پیچیدگی' },

  // Theme toggle
  'theme.light': { en: 'Switch to light mode', fa: 'تغییر به حالت روشن' },
  'theme.dark': { en: 'Switch to dark mode', fa: 'تغییر به حالت تاریک' },

  // Categories
  'category.geopolitics': { en: 'Geopolitics', fa: 'ژئوپلیتیک' },
  'category.fintech': { en: 'FinTech', fa: 'فین‌تک' },
  'category.real-estate': { en: 'Real Estate', fa: 'املاک' },
  'category.macro': { en: 'Macro', fa: 'کلان' },

  // Metadata
  'meta.description': {
    en: 'Clarity in complexity. Geopolitics, FinTech, and real estate analysis by Shahar Koifman.',
    fa: 'وضوح در پیچیدگی. تحلیل ژئوپلیتیک، فین‌تک و املاک توسط شاهار کویفمن.',
  },
}

export function t(key: string): string {
  const entry = dict[key]
  if (!entry) return key
  return entry[locale]
}
```

**Step 3: Commit**

```bash
git add src/lib/i18n.ts
git commit -m "feat: add i18n locale system with EN/FA dictionary"
```

---

### Task 2: Update Post types and fetching

**Files:**
- Modify: `src/types/post.ts`
- Modify: `src/lib/posts-server.ts`
- Modify: `src/lib/posts.ts`

**Step 1: Add Persian fields to Post type**

In `src/types/post.ts`, add to `Post` type:

```typescript
  title_fa?: string
  excerpt_fa?: string
  body_fa?: string
```

Add to `PostFormData`:

```typescript
  title_fa: string
  excerpt_fa: string
  body_fa: string
```

**Step 2: Update PostMeta type**

In `src/types/post.ts` or wherever `PostMeta` is defined, add:

```typescript
  title_fa?: string
  excerpt_fa?: string
```

**Step 3: Update server-side post fetching**

In `src/lib/posts-server.ts`, update the `getPublishedPostsServer()` mapping to include `_fa` fields:

```typescript
title_fa: data.title_fa,
excerpt_fa: data.excerpt_fa,
```

Also add a filter: when `NEXT_PUBLIC_LOCALE === 'fa'`, only return posts that have `title_fa` set.

**Step 4: Update client-side post fetching**

In `src/lib/posts.ts`, update `getPublishedPosts()` and `getPost()` to include the `_fa` fields in the returned data.

**Step 5: Create locale-aware field helpers**

Add to `src/lib/i18n.ts`:

```typescript
import type { Post } from '@/types/post'

export function postTitle(post: Pick<Post, 'title' | 'title_fa'>): string {
  return (locale === 'fa' ? post.title_fa : undefined) ?? post.title
}

export function postExcerpt(post: Pick<Post, 'excerpt' | 'excerpt_fa'>): string {
  return (locale === 'fa' ? post.excerpt_fa : undefined) ?? post.excerpt
}

export function postBody(post: Pick<Post, 'body' | 'body_fa'>): string {
  return (locale === 'fa' ? post.body_fa : undefined) ?? post.body
}
```

**Step 6: Commit**

```bash
git add src/types/post.ts src/lib/posts-server.ts src/lib/posts.ts src/lib/i18n.ts
git commit -m "feat: add Persian fields to post types and fetching"
```

---

### Task 3: RTL layout, Vazirmatn font, and CSS

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Step 1: Add Vazirmatn font and RTL to layout**

In `src/app/layout.tsx`:

```typescript
import { locale, isRTL, t, siteUrl } from '@/lib/i18n'

// In the <head>, conditionally add Vazirmatn:
{isRTL && (
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap"
  />
)}

// On <html> tag:
<html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} suppressHydrationWarning>

// Update metadata to use t() and siteUrl:
export const metadata: Metadata = {
  title: { default: t('brand.name'), template: `%s | ${t('brand.name')}` },
  description: t('meta.description'),
  metadataBase: new URL(siteUrl),
  // ...
}
```

**Step 2: Add Vazirmatn to Tailwind theme and RTL adjustments**

In `src/app/globals.css`, update the `@theme inline` block:

```css
@theme inline {
  /* existing vars... */
  --font-sans-fa: 'Vazirmatn', system-ui, sans-serif;
}
```

Add RTL-specific styles:

```css
/* RTL body font */
[dir="rtl"] body {
  font-family: 'Vazirmatn', system-ui, sans-serif;
}

/* RTL drop cap */
[dir="rtl"] .drop-cap > p:first-of-type::first-letter {
  float: right;
  padding-right: 0;
  padding-left: 0.1em;
}

/* RTL link underline — slides from right */
[dir="rtl"] .link-underline::after {
  left: auto;
  right: 0;
}

/* RTL blockquote border */
[dir="rtl"] .prose blockquote {
  border-left: none !important;
  border-right: 2px solid var(--ac) !important;
  padding-left: 0;
  padding-right: 1.5rem;
}

/* RTL decorative rule — no change needed (symmetric) */
```

**Step 3: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: add Vazirmatn font, RTL layout support, and CSS adjustments"
```

---

### Task 4: Language toggle component

**Files:**
- Create: `src/components/LanguageToggle.tsx`
- Modify: `src/components/Header.tsx`

**Step 1: Create LanguageToggle component**

```typescript
'use client'

import { t, alternateSiteUrl } from '@/lib/i18n'
import { usePathname } from 'next/navigation'

export function LanguageToggle() {
  const pathname = usePathname()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const targetUrl = `${alternateSiteUrl}${pathname}`

    // Animate: fade out, then navigate
    document.documentElement.style.transition = 'opacity 0.3s ease-out'
    document.documentElement.style.opacity = '0'

    setTimeout(() => {
      window.location.href = targetUrl
    }, 300)
  }

  return (
    <a
      href={`${alternateSiteUrl}${pathname}`}
      onClick={handleClick}
      className="text-xs sm:text-sm font-sans text-muted hover:text-accent transition-colors duration-200 cursor-pointer"
      title={t('lang.switch')}
    >
      {t('lang.switch')}
    </a>
  )
}
```

**Step 2: Add LanguageToggle to Header**

In `src/components/Header.tsx`, add the toggle to the right side of the header, before `ThemeToggle`:

```typescript
import { LanguageToggle } from '@/components/LanguageToggle'

// Inside the header's right-side div, before ThemeToggle:
<LanguageToggle />
```

Also update nav links to use `t()`:

```typescript
import { t } from '@/lib/i18n'

// Replace hardcoded strings:
<Link ...>{t('nav.home')}</Link>
<Link ...>{t('nav.about')}</Link>
```

And update the brand title:

```typescript
<h1 ...>{t('brand.name')}</h1>
```

**Step 3: Commit**

```bash
git add src/components/LanguageToggle.tsx src/components/Header.tsx
git commit -m "feat: add language toggle and translate header"
```

---

### Task 5: Translate all public components

**Files:**
- Modify: `src/components/HomeContent.tsx`
- Modify: `src/components/PostCard.tsx`
- Modify: `src/components/PostContent.tsx`
- Modify: `src/components/PostNavigation.tsx`
- Modify: `src/components/ArticlesContent.tsx`
- Modify: `src/components/SubscribeForm.tsx`
- Modify: `src/components/ShareLinks.tsx`
- Modify: `src/components/AuthorCard.tsx`
- Modify: `src/components/Footer.tsx`
- Modify: `src/components/LoadingAnimation.tsx`
- Modify: `src/components/ThemeToggle.tsx`

**Step 1: Update each component**

For every component, import `t` from `@/lib/i18n` and replace every hardcoded English string with the corresponding `t('key')` call. For post data, use `postTitle()`, `postExcerpt()`, `postBody()` helpers.

Key patterns:

```typescript
// Before:
<p>Clarity in complexity</p>
// After:
<p>{t('brand.tagline')}</p>

// Before:
<h1>{post.title}</h1>
// After:
<h1>{postTitle(post)}</h1>

// Before:
<ReactMarkdown>{post.body}</ReactMarkdown>
// After:
<ReactMarkdown>{postBody(post)}</ReactMarkdown>
```

For the count string in ArticlesContent:

```typescript
import { t, locale } from '@/lib/i18n'

// Replace: `${posts.length} brief${posts.length !== 1 ? 's' : ''} published`
// With:
`${posts.length} ${posts.length !== 1 ? t('articles.briefs') : t('articles.brief')} ${t('articles.published')}`
```

**Step 2: Update error pages**

Modify `src/app/error.tsx` and `src/app/global-error.tsx` to use `t('error.title')`, `t('error.message')`, `t('error.retry')`.

**Step 3: Commit**

```bash
git add src/components/*.tsx src/app/error.tsx src/app/global-error.tsx
git commit -m "feat: translate all public components to use i18n dictionary"
```

---

### Task 6: Translate About page

**Files:**
- Modify: `src/app/about/page.tsx`

**Step 1: Replace all hardcoded strings with t() calls**

Import `t` and replace every string. The about page has the most content — bio paragraphs, section headings, bullet descriptions. All keys are already defined in the dictionary (Task 1).

```typescript
import { t } from '@/lib/i18n'

// Metadata:
export const metadata: Metadata = {
  title: t('about.title'),
  description: t('about.description'),
}

// Heading:
<h1 ...>{t('about.name')}</h1>

// Bio paragraphs:
<p ...>{t('about.bio1')}</p>
<p ...>{t('about.bio2')}</p>

// Section headings and bullets:
<h2 ...>{t('about.whatIWrite')}</h2>
// etc.
```

**Step 2: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "feat: translate about page to use i18n dictionary"
```

---

### Task 7: Update post SSG for locale filtering

**Files:**
- Modify: `src/app/posts/[slug]/page.tsx`
- Modify: `src/lib/posts-server.ts`

**Step 1: Filter posts by locale at build time**

In `src/lib/posts-server.ts`, update `getPublishedPostsServer()`:

```typescript
const locale = process.env.NEXT_PUBLIC_LOCALE ?? 'en'

// After fetching posts, filter:
if (locale === 'fa') {
  return posts.filter((p) => p.title_fa)
}
return posts
```

This ensures the Persian build only generates pages for translated posts.

**Step 2: Update post page metadata**

In `src/app/posts/[slug]/page.tsx`, update `generateMetadata()` to use locale-aware fields:

```typescript
import { postTitle, postExcerpt, siteUrl } from '@/lib/i18n'

// In generateMetadata:
title: postTitle(post)
description: postExcerpt(post)
metadataBase: new URL(siteUrl)
```

**Step 3: Commit**

```bash
git add src/app/posts/[slug]/page.tsx src/lib/posts-server.ts
git commit -m "feat: filter posts by locale at build time and update metadata"
```

---

### Task 8: Admin — Persian collapsible section in editor

**Files:**
- Modify: `src/components/ArticleEditor.tsx`

**Step 1: Add Persian fields to form state**

Update the initial form state to include `title_fa`, `excerpt_fa`, `body_fa`:

```typescript
const [form, setForm] = useState<PostFormData>({
  // ... existing fields
  title_fa: existingPost?.title_fa ?? '',
  excerpt_fa: existingPost?.excerpt_fa ?? '',
  body_fa: existingPost?.body_fa ?? '',
})
```

**Step 2: Add collapsible Persian section after the cover animation section**

```tsx
{/* Persian Translation */}
<details className="border border-border rounded">
  <summary className="px-4 py-3 text-sm font-sans text-muted cursor-pointer hover:text-accent transition-colors select-none">
    Persian Translation {form.title_fa ? '✓' : ''}
  </summary>
  <div className="px-4 pb-4 space-y-4">
    <div>
      <label className="block text-xs text-muted font-sans mb-1">Title (Persian)</label>
      <input
        type="text"
        value={form.title_fa}
        onChange={(e) => updateField('title_fa', e.target.value)}
        placeholder="عنوان فارسی"
        dir="rtl"
        className="w-full px-4 py-3 rounded border border-border bg-surface text-foreground font-sans text-xl input-glow focus:outline-none focus:border-accent"
      />
    </div>
    <div>
      <label className="block text-xs text-muted font-sans mb-1">Excerpt (Persian)</label>
      <textarea
        value={form.excerpt_fa}
        onChange={(e) => updateField('excerpt_fa', e.target.value)}
        placeholder="خلاصه فارسی"
        dir="rtl"
        rows={2}
        className="w-full px-4 py-3 rounded border border-border bg-surface text-foreground font-sans input-glow focus:outline-none focus:border-accent resize-none"
      />
    </div>
    <div>
      <label className="block text-xs text-muted font-sans mb-1">Body (Persian)</label>
      <div data-color-mode="auto" dir="rtl">
        <MDEditor
          value={form.body_fa}
          onChange={(val) => updateField('body_fa', val ?? '')}
          height={400}
          preview="live"
        />
      </div>
    </div>
  </div>
</details>
```

**Step 3: Update handleSave to include Persian fields**

In the `savePost()` call, add:

```typescript
title_fa: form.title_fa || undefined,
excerpt_fa: form.excerpt_fa || undefined,
body_fa: form.body_fa || undefined,
```

**Step 4: Commit**

```bash
git add src/components/ArticleEditor.tsx
git commit -m "feat: add collapsible Persian translation section to article editor"
```

---

### Task 9: Firebase Cloud Function for AI translation

**Files:**
- Create: `functions/package.json`
- Create: `functions/tsconfig.json`
- Create: `functions/src/index.ts`
- Modify: `firebase.json`

**Step 1: Initialize functions directory**

```bash
mkdir -p functions/src
```

**Step 2: Create `functions/package.json`**

```json
{
  "name": "the-koifman-brief-functions",
  "main": "lib/index.js",
  "scripts": {
    "build": "tsc",
    "deploy": "firebase deploy --only functions"
  },
  "engines": { "node": "22" },
  "dependencies": {
    "firebase-admin": "^13.0.0",
    "firebase-functions": "^6.3.0",
    "@anthropic-ai/sdk": "^0.52.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0"
  }
}
```

**Step 3: Create `functions/tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es2022",
    "outDir": "lib",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

**Step 4: Create `functions/src/index.ts`**

```typescript
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import Anthropic from '@anthropic-ai/sdk'

const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY')

export const translateToFarsi = onCall(
  { secrets: [anthropicApiKey], maxInstances: 5 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated')
    }

    const { title, excerpt, body } = request.data as {
      title: string
      excerpt: string
      body: string
    }

    if (!title || !body) {
      throw new HttpsError('invalid-argument', 'Title and body are required')
    }

    const client = new Anthropic({ apiKey: anthropicApiKey.value() })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: `Translate the following article from English to Persian (Farsi). Return ONLY valid JSON with keys "title", "excerpt", and "body". Preserve all Markdown formatting in the body. The translation should read naturally as a native Persian publication — not a literal translation. Maintain the analytical tone and precision of the original.

Title: ${title}

Excerpt: ${excerpt}

Body:
${body}`,
        },
      ],
    })

    const text =
      response.content[0].type === 'text' ? response.content[0].text : ''

    try {
      // Strip markdown code fence if present
      const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
      return JSON.parse(cleaned)
    } catch {
      throw new HttpsError('internal', 'Failed to parse translation response')
    }
  },
)
```

**Step 5: Set the Anthropic API key as a Firebase secret**

```bash
firebase functions:secrets:set ANTHROPIC_API_KEY
# Paste the API key when prompted
```

**Step 6: Update firebase.json to include functions**

Add to `firebase.json`:

```json
"functions": {
  "source": "functions",
  "runtime": "nodejs22"
}
```

**Step 7: Install dependencies and deploy**

```bash
cd functions && npm install && npm run build && cd ..
firebase deploy --only functions
```

**Step 8: Commit**

```bash
git add functions/ firebase.json
git commit -m "feat: add Cloud Function for AI translation via Claude API"
```

---

### Task 10: Wire auto-translation to admin save flow

**Files:**
- Modify: `src/components/ArticleEditor.tsx`

**Step 1: Import Firebase callable function**

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '@/lib/firebase'
```

**Step 2: Add translation logic after save**

After the existing `handleSave` stores the post, trigger translation if Persian fields are empty:

```typescript
const handleSave = async () => {
  // ... existing save logic ...

  // After successful save, auto-translate if no Persian content yet
  if (!form.title_fa && !form.body_fa) {
    try {
      setVideoProgress('Translating to Persian...')
      const functions = getFunctions(app)
      const translate = httpsCallable(functions, 'translateToFarsi')
      const result = await translate({
        title: form.title,
        excerpt: form.excerpt,
        body: form.body,
      })
      const translated = result.data as { title: string; excerpt: string; body: string }

      // Save translated fields
      await savePost(slug, {
        title_fa: translated.title,
        excerpt_fa: translated.excerpt,
        body_fa: translated.body,
      })

      // Update local form
      updateField('title_fa', translated.title)
      updateField('excerpt_fa', translated.excerpt)
      updateField('body_fa', translated.body)
    } catch (err) {
      console.error('Translation failed:', err)
      // Non-blocking — post is saved, translation just didn't work
    } finally {
      setVideoProgress('')
    }
  }
}
```

Note: `savePost` must support partial updates (merge). Check that it uses `setDoc` with `{ merge: true }` or `updateDoc`.

**Step 3: Commit**

```bash
git add src/components/ArticleEditor.tsx
git commit -m "feat: auto-translate articles to Persian on save"
```

---

### Task 11: Translate existing articles (one-time script)

**Files:**
- Create: `scripts/translate-posts.ts`

**Step 1: Create translation script**

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const app = initializeApp()
const db = getFirestore(app)
const client = new Anthropic()

async function translatePost(slug: string) {
  const doc = await db.collection('posts').doc(slug).get()
  const data = doc.data()
  if (!data || data.title_fa) {
    console.log(`Skipping ${slug} (already translated or missing)`)
    return
  }

  console.log(`Translating: ${slug}...`)

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: `Translate the following article from English to Persian (Farsi). Return ONLY valid JSON with keys "title", "excerpt", and "body". Preserve all Markdown formatting in the body. The translation should read naturally as a native Persian publication — not a literal translation. Maintain the analytical tone and precision of the original.

Title: ${data.title}

Excerpt: ${data.excerpt}

Body:
${data.body}`,
      },
    ],
  })

  const text =
    response.content[0].type === 'text' ? response.content[0].text : ''
  const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
  const translated = JSON.parse(cleaned)

  await db.collection('posts').doc(slug).update({
    title_fa: translated.title,
    excerpt_fa: translated.excerpt,
    body_fa: translated.body,
  })

  console.log(`Done: ${slug}`)
}

async function main() {
  const snapshot = await db
    .collection('posts')
    .where('published', '==', true)
    .get()

  for (const doc of snapshot.docs) {
    await translatePost(doc.id)
  }

  console.log('All posts translated.')
}

main().catch(console.error)
```

**Step 2: Run the script**

```bash
ANTHROPIC_API_KEY=<key> npx tsx scripts/translate-posts.ts
```

**Step 3: Commit**

```bash
git add scripts/translate-posts.ts
git commit -m "feat: add one-time script to translate existing posts to Persian"
```

---

### Task 12: Build scripts and Firebase Hosting setup

**Files:**
- Modify: `package.json`
- Modify: `firebase.json`
- Modify: `next-sitemap.config.js`

**Step 1: Add build scripts**

In `package.json`, add:

```json
"build:en": "NEXT_PUBLIC_LOCALE=en next build",
"build:fa": "NEXT_PUBLIC_LOCALE=fa next build",
"build:all": "npm run build:en && mv out out-en && npm run build:fa && mv out out-fa && mkdir out && cp -r out-en/* out/ && cp -r out-fa/* out/fa/ && rm -rf out-en out-fa",
"deploy:all": "npm run build:all && firebase deploy --only hosting:the-koifman-brief,hosting:the-koifman-brief-fa"
```

Note: `build:all` produces `out/` for English and `out/fa/` for Persian.

**Step 2: Create second Firebase Hosting site**

```bash
firebase hosting:sites:create the-koifman-brief-fa
```

**Step 3: Update firebase.json for multi-site hosting**

```json
"hosting": [
  {
    "site": "the-koifman-brief",
    "public": "out",
    "cleanUrls": true,
    "ignore": ["fa/**"],
    "rewrites": [
      { "source": "/admin/**", "destination": "/admin.html" },
      { "source": "/posts/**", "destination": "/posts.html" },
      { "source": "**", "destination": "/404.html" }
    ]
  },
  {
    "site": "the-koifman-brief-fa",
    "public": "out/fa",
    "cleanUrls": true,
    "rewrites": [
      { "source": "/posts/**", "destination": "/posts.html" },
      { "source": "**", "destination": "/404.html" }
    ]
  }
]
```

**Step 4: Update sitemap config**

In `next-sitemap.config.js`, use `siteUrl` from locale:

```javascript
const locale = process.env.NEXT_PUBLIC_LOCALE ?? 'en'
const siteUrl = locale === 'fa' ? 'https://fa.thekoifmanbrief.com' : 'https://thekoifmanbrief.com'

module.exports = {
  siteUrl,
  // ... rest of config
}
```

**Step 5: Connect custom domain**

```bash
firebase hosting:sites:update the-koifman-brief-fa --site the-koifman-brief-fa
# Then configure DNS: fa.thekoifmanbrief.com → Firebase Hosting
```

**Step 6: Commit**

```bash
git add package.json firebase.json next-sitemap.config.js
git commit -m "feat: add multi-site Firebase Hosting and dual-locale build scripts"
```

---

### Task 13: Test and deploy

**Step 1: Test English build locally**

```bash
NEXT_PUBLIC_LOCALE=en npm run build
npx serve out
# Verify: English content, language toggle visible, links work
```

**Step 2: Test Persian build locally**

```bash
NEXT_PUBLIC_LOCALE=fa npm run build
npx serve out
# Verify: Persian content, RTL layout, Vazirmatn font, links work
```

**Step 3: Run the translation script for existing posts**

```bash
ANTHROPIC_API_KEY=<key> npx tsx scripts/translate-posts.ts
```

**Step 4: Full build and deploy**

```bash
npm run deploy:all
```

**Step 5: Verify live sites**

- `https://thekoifmanbrief.com` — English, toggle says "فارسی"
- `https://fa.thekoifmanbrief.com` — Persian, RTL, toggle says "English"
- Language toggle navigates between sites with fade animation
- All 7 articles appear on both sites in correct language

**Step 6: Final commit**

```bash
git add .
git commit -m "feat: complete Persian translation — dual-site deployment"
```
