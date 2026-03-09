# The Koifman Brief

## Design Context

### Users
- **Primary audience**: Broad — institutional investors, policy analysts, the informed public, and Iranian diaspora
- **Context**: Both quick mobile scans and deep desktop reads; the design must serve both modes
- **Job to be done**: Understand macro forces (geopolitics, fintech, real estate) with enough clarity to make better decisions — not prediction, but structural analysis

### Brand Personality
- **Three words**: Smart, Clarity, Deep
- **Emotional goals**: The reader should feel they're getting intelligence-grade analysis — rigorous but accessible, never dumbed down, never overwrought
- **Voice**: Measured, authoritative, no-nonsense — like a well-written intelligence brief

### Aesthetic Direction
- **Visual tone**: Editorial, warm, refined — inspired by quality print publications (NYT-style serif/sans pairing)
- **Typography**: Playfair Display (serif) for headings/editorial voice + Libre Franklin (sans) for body/UI — both loaded from Google Fonts
- **Color system**: Warm cream backgrounds (#F5F0E8 light / #0F0F0F dark), golden accent (#B8860B / #D4A843 dark) used sparingly for links, highlights, and decorative elements
- **Decorative vocabulary**: Diamond bullets, thin rules with centered diamonds, vignette borders on images, paper noise texture overlay, pencil-sketch SVG filter on images
- **Motion**: Purposeful and restrained — fade-in-up entrances (0.4s), staggered reveals, view transitions with shared element morphs. All motion respects `prefers-reduced-motion`
- **Theme**: Light and dark modes with smooth transitions; system preference by default
- **Anti-references**: Avoid generic blog templates, Medium-style sameness, overly colorful dashboards, or anything that feels casual/social-media-like

### Design Principles
1. **Clarity over decoration** — Every element should aid comprehension. If it doesn't help the reader understand, remove it.
2. **Editorial authority** — The design should feel like a respected publication, not a personal blog. Typography, spacing, and restraint convey credibility.
3. **Warmth without softness** — The palette and textures are warm (cream, gold, sepia sketches) but the content and layout are sharp and structured.
4. **Progressive disclosure** — Homepage cards give the headline and excerpt; the full analysis unfolds on click. Don't overwhelm upfront.
5. **Respect the reader's time** — Fast loads, clean typography, no visual clutter. The design gets out of the way of the writing.

### Persian / RTL Guidelines
- Persian version should feel like a **native Persian publication**, not a translated English site
- Use proper RTL layout (mirrored), appropriate Persian fonts, and culturally natural reading patterns
- Audience includes both Iranian diaspora and readers inside Iran
- Article translation should be AI-powered at publish time and stored, not translated on-the-fly
