# Custom CSS Elements

This document lists elements that genuinely need custom CSS because Web Awesome
doesn't cover the need. Per our directive: **If WA provides a style or component
that covers the need, use WA with ZERO CSS customization.**

## Design Tokens Are OK

Using `var(--wa-color-brand-500)`, `var(--wa-spacing-medium)`, etc. is the
intended usage pattern. This is not "custom CSS" — it's using WA's design system.

## Elements Requiring Custom CSS

### 1. Rank Badges (`team-tile.ts`)
**Why**: Medal-style rank badges (gold/silver/bronze gradients) have no WA equivalent.
**CSS**: `.rank-badge`, `.rank-badge.rank-1/2/3/other` with gradient backgrounds and absolute positioning.

### 2. Zone Accent System (`zone-container.ts`)
**Why**: Zone-specific accent colors (--zone-accent) for planning/live/archive zones.
WA doesn't have a zone container component.
**CSS**: `.zone-container.zone-*` with `--zone-accent` CSS variables mapping to WA tokens.

### 3. Grid Layout (`variables.css`)
**Why**: `div.grid-300` auto-fit grid layout. WA doesn't provide grid utilities.
**CSS**: `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))`.

### 4. Team Image Fallback (`team-tile.ts`)
**Why**: Placeholder SVG with pulse animation for missing team logos.
**CSS**: `.team-image-fallback` with centered flex and animation.

### 5. Score Pop Animation (`live-match-card.ts`)
**Why**: Gesture feedback animation for scoring.
**CSS**: `@keyframes scorePop` — UX animation, not covered by WA.

### 6. Gesture Trail (`gesture-scoring.ts`)
**Why**: Visual feedback trail for gesture recognition.
**CSS**: `.gesture-trail` with radial-gradient and fade animation.

### 7. Scroll Navigation (`page-match.ts`)
**Why**: Fixed-position scroll dock with show/hide transitions.
**CSS**: `.scroll-nav` with position:fixed, opacity/transform transitions.

### 8. Match Tile Grid (`match-tile.ts`)
**Why**: 11-column grid for host/score/VS/score/visitor layout.
**CSS**: `.match-grid` with `grid-template-columns: repeat(11, 1fr)`.

### 9. Clickable Indicator (`variables.css`)
**Why**: `.can-be-clicked` dashed border hint for interactive elements.
**CSS**: Custom dashed border on hover — UX hint not covered by WA.

### 10. Overlay Animations (`command-palette.css`, `gesture-overlay.ts`)
**Why**: Fade-in and slide-up animations for modal overlays.
**CSS**: `@keyframes overlay-fade-in`, `@keyframes palette-slide-in`, etc.

### 11. Tournament Card Styling (`page-tournament-select.css`)
**Why**: Card hover effects and grid layout for tournament list.
**CSS**: `.tournament-card` with hover transform/box-shadow, `.tournament-grid` responsive columns.

### 12. Page Content Container (all page components)
**Why**: Pages need a centered container with max-width, padding, and subtle background.
WA's wa-card could work but pages need a consistent wrapper. Currently using Tailwind arbitrary values.
**CSS**: Tailwind classes replacing the former `.page-content` rule.

## Elements That NO LONGER Need Custom CSS

- ~~Block/text color utilities~~ → Use Tailwind with WA design tokens
- ~~Container margin utilities~~ → Use Tailwind spacing
- ~~Glassmorphism cards~~ → Use wa-card with appearances
- ~~Custom buttons~~ → Use wa-button with variants
- ~~Custom badges~~ → Use wa-tag or wa-badge
- ~~wa-breadcrumb overrides~~ → Use WA native styling
- ~~wa-menu/wa-menu-item overrides~~ → Use WA native styling
- ~~wa-carousel overrides~~ → Use WA native styling
- ~~wa-dialog overrides~~ → Use WA native styling
- ~~wa-card overrides~~ → Use WA native styling
