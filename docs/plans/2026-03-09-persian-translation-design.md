# Persian Translation Design

## Problem
The Koifman Brief needs to reach Persian-speaking readers — both Iranian diaspora and readers inside Iran. The Persian version should feel like a native Persian publication, not a translated English site.

## Architecture

### Subdomain Routing
- English: `thekoifmanbrief.com`
- Persian: `fa.thekoifmanbrief.com`
- Two Firebase Hosting sites in the same project
- Build generates both English and Persian static pages
- Persian pages live under `/fa/` in build output; the `fa` site deploys from `out/fa/`

### Translation Storage (Firestore)
Add Persian fields to each post document — no separate collection:
```
title_fa: string
excerpt_fa: string
body_fa: string
```

### AI Translation Flow (Admin Panel)
1. Author writes article in English, hits Save
2. On save, after the post is stored, call Claude API to translate title, excerpt, and body to Persian
3. Translated text saved to `_fa` fields
4. Editor shows a collapsible "Persian Translation" section below English fields — fully editable
5. Author can review/edit, save again to update Persian fields

### UI Chrome Translation
Dictionary object mapping ~60 UI strings to Persian equivalents. Simple `t(key, locale)` function — no i18n library.

### RTL & Typography
- `dir="rtl"` and `lang="fa"` on `<html>` for Persian pages
- CSS logical properties where needed; Tailwind utilities work with RTL via `dir`
- Persian font: Vazirmatn (sans-serif); Playfair Display stays for brand name
- Mirrored layout: navigation, reading direction, decorative elements

### Language Picker
Toggle in a top corner of the header linking to the equivalent page on the other subdomain. English site shows "فارسی", Persian site shows "English". No browser language autodetect. Animated transition on language switch.

### Scope
**Translated**: All public UI strings, article content, page metadata
**Not translated**: Admin panel, brand name "The Koifman Brief"
**Unchanged**: Design system, colors, decorative elements, animations

## Product Refinement

### Refined User Flow

**Persian reader (2 clicks to wow):**
1. Lands on English site → sees "فارسی" toggle in header corner
2. Clicks toggle → animated transition → full native Persian experience (RTL, Vazirmatn font, translated content)
3. Browses articles, reads — everything feels like a native Persian publication

**Author publishing (0 extra clicks for translation):**
1. Writes article in English, hits Save
2. AI translation happens automatically on save — no extra step
3. Collapsible "Persian Translation" section appears below English fields with pre-filled text
4. Reviews/edits if needed, saves again — done

### Cuts Made
- **Tabs → collapsible section**: Removed English/Persian tab switcher in admin editor. A collapsible disclosure section is simpler — author sees both languages without switching context
- **No autodetect**: Removed browser language detection. Just a visible corner toggle — simpler, no surprises
- **No i18n library**: Plain dictionary + `t()` function for ~60 strings. No dependency needed
- **Admin stays English-only**: No translation of admin panel — author is bilingual, no value in translating internal tools

### Scope Boundaries

**Appetite**: This is a significant feature but bounded — the site is small (~7 articles, ~60 UI strings, ~15 components with text).

**Must-haves:**
- Persian article translation (AI + editable)
- RTL layout + Vazirmatn font
- Language toggle in header corner
- UI chrome translation (~60 strings)
- Second Firebase Hosting site + deployment
- Persian SEO metadata
- Translate existing 7 articles

**Delighters:**
- Animated language switch transition

**Rabbit holes to avoid:**
- Perfectionist RTL layout — Tailwind handles most via `dir="rtl"`, don't hand-tune every pixel
- i18n library overhead — plain dictionary is enough
- Persian font fallback chains — Vazirmatn only
- Bilingual admin panel — keep English-only
