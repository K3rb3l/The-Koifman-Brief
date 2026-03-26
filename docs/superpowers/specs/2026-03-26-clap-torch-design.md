# Clap Torch — Design Spec

## Summary

A torch-shaped clap button that floats on the left side of articles. Readers click to "light" it — each click grows the flame (up to 50 per device). Clap counts are stored on the post document in Firestore, incremented via a Cloud Function.

## Data Model

- Add `claps: number` field to existing `posts/{slug}` documents (default 0)
- No new collections — keeps things simple
- Client-side rate limiting via localStorage (`tkb_claps_{slug}` stores device's clap count, 0-50)

## Cloud Function: `clapPost`

- **Type**: Callable, unauthenticated (same as `subscribe`)
- **Input**: `{ slug: string, count: number }`
- **Validation**: slug must exist, count must be 1-50
- **Action**: `FieldValue.increment(count)` on `posts/{slug}.claps`
- **Returns**: `{ totalClaps: number }`
- **Firestore rules**: no client write access to `claps` field — only the function can increment

## UI Component: `TorchClap`

### Placement
- **Desktop**: Fixed-position on the left side of the article, vertically centered while scrolling
- **Mobile**: Bottom-right corner, smaller floating button (torch icon + count)
- Hidden when article is loading or not found

### Visual States

1. **Unlit** — torch SVG outline in muted color, total clap count below (or nothing if 0)
2. **Lit (small)** — small flickering flame, 1-15 claps from this device
3. **Lit (medium)** — taller flame, more motion, 16-35 claps
4. **Lit (roaring)** — large flame, intense flicker, 36-50 claps

### Torch Design
- Clean line-art SVG, editorial style matching the site aesthetic
- Simple torch shape — let the animation carry the personality
- Works in both light and dark themes

### Interactions
- **Click/tap**: increments clap, triggers spark/ember particle burst, flame grows
- **Hold not supported** — keep it simple, click-per-clap like Medium
- **Debounced sync**: batch claps into a single Cloud Function call after 500ms of inactivity
- **Optimistic UI**: flame and count update immediately on click, sync in background
- **At limit (50)**: torch stays in roaring state, clicks disabled, subtle indication that max is reached

### Animation (GSAP)
- **Flame flicker**: GSAP timeline loop with randomized y/scale/opacity on layered flame shapes
- **Ignition**: first click triggers a flame-appear animation (scale from 0, slight overshoot)
- **Growth**: smooth GSAP tween of flame scale when moving between tiers
- **Sparks/embers**: particle burst on each click — small glowing dots that rise and fade out
- **Count transition**: number animates when updating (CountUp-style)
- **`prefers-reduced-motion`**: disable particle effects and continuous flicker, use simple opacity transitions

### Responsive
- Desktop: left sidebar, vertically centered, fixed position
- Mobile (< 768px): bottom-right floating button, compact torch + count

## User Flow

1. Reader opens article → torch appears on left, unlit, showing total count (if any)
2. Reader clicks torch → flame ignites with spark burst, count increments
3. Reader clicks more → flame grows through tiers, sparks on each click
4. After 500ms pause → batched clap count sent to Cloud Function
5. Cloud Function increments Firestore, returns new total
6. Reader returns later → localStorage remembers their contribution, torch shows their flame state + current total

## Product Refinement

### Refined user flow
- 1 click to wow moment (flame ignition + sparks)
- No login, no friction — just click and enjoy
- Visual feedback is immediate (optimistic), sync is background

### Cuts made
- No per-reader count display — global total only (simpler, less UI clutter)
- No homepage torch — article page only (keeps homepage clean)
- No hold-to-clap — click only (simpler interaction model)
- No server-side device tracking — localStorage is sufficient for rate limiting

### Scope boundaries
- **Rabbit hole to avoid**: over-designing the torch SVG — keep it simple line art, let GSAP do the work
- **Must-have**: flame ignition, growth tiers, spark particles, debounced sync, mobile layout
- **Delighter**: the spark/ember burst on each click
