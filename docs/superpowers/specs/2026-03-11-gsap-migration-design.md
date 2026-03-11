# GSAP Animation Migration

## Overview

Replace all CSS `@keyframes` animations and IntersectionObserver-based scroll triggers with GSAP + ScrollTrigger. Add scroll-linked effects (scrub parallax, pin+zoom, batch staggers). Deploy to Firebase preview channel on a new branch.

## Stack Changes

- **Add**: `gsap`, `@gsap/react`
- **Remove**: No packages removed (no animation libraries currently)
- **CSS**: Remove replaced `@keyframes` from `globals.css`; keep hover transitions and View Transition rules

## Architecture

### GSAP Setup (`src/lib/gsap.ts`)

Central registration and defaults:

- Register `ScrollTrigger` plugin
- Guard with `typeof window !== 'undefined'`
- Export shared defaults: `{ duration: 0.4, ease: 'power3.out' }` (matches current cubic-bezier)
- Export `isReducedMotion` check — when true, set `gsap.globalTimeline.timeScale(Infinity)` and disable ScrollTrigger

### Component Migration

Each component replaces `useEffect` + IntersectionObserver / `useState` phase logic with `useGSAP` hook from `@gsap/react`. The hook handles cleanup automatically.

| Component | Current Mechanism | GSAP Replacement |
|---|---|---|
| **ScrollReveal** | IntersectionObserver + CSS `.animate-fade-in-up` class | `gsap.from(el, { y: 24, opacity: 0, scrollTrigger })` |
| **CountUp** | IntersectionObserver + rAF counter | `gsap.to(ref, { innerText: target, snap: { innerText: 1 }, scrollTrigger })` or `gsap.to` with `onUpdate` |
| **DecorativeRule** | IntersectionObserver + CSS classes | ScrollTrigger timeline: rule scaleX → diamond spinIn |
| **StaggeredBullet** | IntersectionObserver + nth-child CSS delays | `gsap.from(items, { y: 16, opacity: 0, stagger: 0.08, scrollTrigger })` |
| **PencilSketchImage** | `reveal` prop + CSS `clip-path` class | `gsap.fromTo(el, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0)', scrollTrigger })` |
| **BackgroundAnimation** | rAF loop + mousemove/scroll listeners | `gsap.quickTo` for cursor tracking, ScrollTrigger for mobile parallax |
| **LoadingAnimation** | useState phases + CSS keyframes | GSAP timeline: diamond scale → particles float → curtain split → fade out |
| **BrandMark** | setTimeout chains + CSS keyframes | GSAP timeline: stroke draw (strokeDashoffset) → loop breathe animation |
| **AnimatedPortrait** | Video onCanPlay + opacity transition | `gsap.to(video, { opacity: 1, duration: 0.8 })` on canplay |
| **PostCard** | CSS transitions + View Transition | Keep CSS hover transitions. Keep View Transition. No GSAP needed. |
| **PostNavigation** | View Transition API | Keep as-is. Browser-native. |

### ScrollTrigger Enhancements (New)

1. **Homepage hero parallax**: Scrub-linked y-translate on hero text/image as user scrolls past
2. **Article cover zoom-out**: Subtle `scale: 1.05 → 1` with scrub on article page cover image
3. **Post card batch reveal**: `ScrollTrigger.batch` on homepage card grid for coordinated stagger entrance

### CSS Changes (`globals.css`)

**Remove** (replaced by GSAP):
- `@keyframes fadeInUp`, `drawLine`, `diamondSpinIn`, `ruleDrawIn`, `sketchReveal`, `expandFromCenter`
- `@keyframes drawStroke`, `undrawStroke`, `fadeOut`
- `@keyframes loadingGlow`, `particleFloat`
- `@keyframes geometricDrift`, `ringPulse`
- `@keyframes bmEdgeA/B/C/D`, `bmOverdraw`, `bmCrossV/H`, `bmDot`
- `@keyframes skeletonShimmer`, `skeletonFadeIn`
- Utility classes: `.animate-fade-in-up`, `.animate-draw-line`, `.stagger-children`, `.geometric-drift`

**Keep**:
- `@keyframes shimmer` (tag effect — CSS-only, no scroll trigger)
- `@keyframes subtlePulse` (button hover — CSS-only)
- `@keyframes vtFadeOut/vtFadeIn` and all `::view-transition-*` rules
- `.card-lift`, `.link-underline` (hover transitions)
- `prefers-reduced-motion` media query (update to also set GSAP vars)

## Accessibility

- `prefers-reduced-motion: reduce` → GSAP timelines complete instantly, ScrollTrigger disabled
- Same behavior as current implementation, enforced centrally in `gsap.ts`

## Performance

- GSAP core + ScrollTrigger: ~27KB gzip
- `will-change` managed by GSAP automatically
- `useGSAP` ensures proper cleanup (no memory leaks)
- BackgroundAnimation: `gsap.ticker` replaces manual rAF (same 60fps sync)

## Deployment

- New branch: `feat/gsap-migration`
- Firebase preview channel deployment: `firebase hosting:channel:deploy gsap-preview`

## Out of Scope

- View Transitions API (browser-native, stays as-is)
- CSS hover transitions (appropriate in CSS)
- Adding entirely new page sections or content
- Persian/RTL animation differences (follow existing RTL logic)
