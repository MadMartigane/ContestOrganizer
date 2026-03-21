# CYBERPUNK UI Integration Guide

> **Purpose:** This document provides complete instructions for an AI coding agent to integrate CYBERCORE CSS into the ContestOrganizer application, specifically targeting the `page-match` component as a proof-of-concept.

---

## Overview

We want to test CYBERCORE CSS (a pure CSS cyberpunk design framework) on the existing `page-match` component. This is a **visual styling experiment** — we're keeping Shoelace components but applying CYBERCORE's futuristic aesthetic.

### What is CYBERCORE CSS?

- **Pure CSS framework** — Zero JavaScript dependencies
- **Cyberpunk aesthetic** — Inspired by Cyberpunk 2077, Blade Runner
- **Dark theme native** — Designed for dark interfaces
- **Modular** — Import only what you need
- **153 cyberpunk icons** — SVG icon system
- **Effects** — Glitch, neon borders, scanlines, datastream

---

## Resources

### Official Documentation
- **GitHub:** https://github.com/sebyx07/cybercore-css
- **Live Demo:** https://sebyx07.github.io/cybercore-css
- **Docs:** https://sebyx07.github.io/cybercore-css/#/docs
- **npm:** `cybercore-css`

### LLM-Specific Documentation
CYBERCORE CSS includes a `CLAUDE.md` file for AI agents:
- https://raw.githubusercontent.com/sebyx07/cybercore-css/main/CLAUDE.md

Key points from CLAUDE.md:
- Uses CSS `@layer` for cascade control
- All classes use `cyber-` prefix with BEM-style modifiers
- Color palette: Cyan (#00f0ff), Magenta (#ff2a6d), Yellow (#fcee0a), Green (#05ffa1), Void (#0a0a0f)
- Components: `.cyber-btn`, `.cyber-card`, `.cyber-input`, `.cyber-terminal`, etc.
- Effects: `.cyber-glitch`, `.cyber-neon-border`, `.cyber-scanlines`, `.cyber-datastream`

---

## Installation Steps

### 1. Install the Package

```bash
pnpm add cybercore-css
```

### 2. Import CSS

**Option A — Full import in global CSS** (`src/global/shoelace.css` or new file):

```css
/* Add at the top of your global CSS */
@import "cybercore-css/dist/cybercore.min.css";
```

**Option B — SCSS import** (if using SCSS):

```scss
@use 'cybercore-css';
```

**Option C — CDN for testing** (in `index.html`):

```html
<link rel="stylesheet" href="https://unpkg.com/cybercore-css@latest/dist/cybercore.min.css" />
```

---

## Target Component: page-match

### File Location
- **TypeScript:** `src/components/page-match/page-match.ts`
- **Current UI Kit:** Shoelace (`sl-button`, `sl-tag`, `sl-icon`, `sl-spinner`, `sl-breadcrumb`, etc.)

### Shoelace Components Used (need CYBERCORE styling)

| Shoelace Component | Current Usage | CYBERCORE Equivalent/Styling |
|--------------------|---------------|------------------------------|
| `sl-button` | Action buttons (play, stop, delete) | Add `.cyber-btn` classes |
| `sl-tag` | Match status badges | Add `.cyber-badge` or custom neon styling |
| `sl-icon` | Icons throughout | Use CYBERCORE icons OR keep Shoelace icons |
| `sl-spinner` | Loading indicator | Use `.cyber-spinner` or neon glow effect |
| `sl-breadcrumb` | Navigation | Style with `.cyber-neon-border` |
| `sl-card` (implied) | Container | Use `.cyber-card` styling |

### Key Render Methods to Modify

From `page-match.ts`:

```typescript
// Lines 708-734: renderActionButtonsContent()
// Uses: sl-button, sl-icon

// Lines 751-780: renderMatchStatus()
// Uses: sl-tag, sl-icon, sl-spinner

// Lines 897-899: renderMatchItem()
// Uses: div.match-item with border classes

// Lines 1141-1167: Scroll navigation buttons
// Uses: sl-button, sl-tooltip

// Lines 1245-1258: Breadcrumb navigation
// Uses: sl-breadcrumb, sl-breadcrumb-item
```

---

## Implementation Strategy

### Phase 1: Add CYBERCORE CSS Classes (No Shoelace Removal)

**Goal:** Demonstrate visual impact without breaking functionality.

1. **Add CYBERCORE classes to existing Shoelace elements:**

```typescript
// Before (line 711-718):
<sl-button class="delete-btn w-full" ...>

// After:
<sl-button class="delete-btn w-full cyber-btn cyber-btn--magenta" ...>
```

2. **Create wrapper elements with CYBERCORE effects:**

```typescript
// Add glitch effect to match status
<div class="cyber-glitch" data-text="Match en cours">
  <sl-tag variant="success">...</sl-tag>
</div>

// Add neon border to match items
<div class="match-item cyber-card cyber-neon-border">
```

3. **Style the page container:**

```css
/* In a new file: src/global/cybercore-override.css */
page-match {
  background: var(--cyber-void-900);
  color: var(--cyber-cyan-500);
}

.match-item {
  border-color: var(--cyber-cyan-500) !important;
  box-shadow: var(--glow-cyan);
}
```

### Phase 2: Add CYBERCORE Visual Effects

**Glitch Text Effect:**
```html
<h1 class="cyber-glitch" data-text="TOURNOI">TOURNOI</h1>
```

**Neon Borders:**
```html
<div class="cyber-neon-border cyber-neon-border--magenta">
  <!-- Match content -->
</div>
```

**Scanlines Overlay:**
```html
<div class="cyber-scanlines">
  <!-- Entire page or section -->
</div>
```

**Terminal-style Status:**
```html
<div class="cyber-terminal">
  <div class="cyber-terminal__body">
    <span class="cyber-terminal__prompt">$</span>
    <span class="cyber-terminal__command">status --match</span>
  </div>
</div>
```

---

## CSS Custom Properties to Use

CYBERCORE provides these CSS variables:

```css
/* Primary colors */
--cyber-cyan-500: #00f0ff;
--cyber-magenta-500: #ff2a6d;
--cyber-yellow-500: #fcee0a;
--cyber-green-500: #05ffa1;

/* Backgrounds */
--cyber-void-900: #0a0a0f;
--cyber-void-800: #12121a;

/* Glow effects */
--glow-cyan: 0 0 10px #00f0ff, 0 0 30px rgba(0, 240, 255, 0.5);
--glow-magenta: 0 0 10px #ff2a6d, 0 0 30px rgba(255, 42, 109, 0.5);
```

---

## Override Shoelace Theme Variables

Map Shoelace tokens to CYBERCORE colors:

```css
/* In src/global/shoelace.css or new file */
:root {
  /* Map Shoelace primary to CYBERCORE cyan */
  --sl-color-primary-500: var(--cyber-cyan-500);
  --sl-color-primary-600: var(--cyber-cyan-600);
  
  /* Map Shoelace danger to CYBERCORE magenta */
  --sl-color-danger-500: var(--cyber-magenta-500);
  
  /* Map Shoelace success to CYBERCORE green */
  --sl-color-success-500: var(--cyber-green-500);
  
  /* Map Shoelace warning to CYBERCORE yellow */
  --sl-color-warning-500: var(--cyber-yellow-500);
  
  /* Dark backgrounds */
  --sl-color-neutral-900: var(--cyber-void-900);
  --sl-color-neutral-800: var(--cyber-void-800);
}
```

---

## Reusable CYBERCORE Component Wrappers

Create wrapper components or styles for common patterns:

### Cyber Card Wrapper for Shoelace

```css
.cyber-shoelace-card {
  /* Neon border effect */
  border: 1px solid var(--cyber-cyan-500);
  box-shadow: var(--glow-cyan);
  
  /* Dark background */
  background: var(--cyber-void-900);
  
  /* Rounded corners with cyber aesthetic */
  border-radius: 4px;
  
  /* Transition for hover */
  transition: box-shadow 0.3s ease;
}

.cyber-shoelace-card:hover {
  box-shadow: var(--glow-cyan), 0 0 50px rgba(0, 240, 255, 0.3);
}
```

### Cyber Button Override for Shoelace

```css
sl-button.cyber-btn {
  /* Use CYBERCORE button styling */
  --sl-button-border-color: var(--cyber-cyan-500);
  --sl-button-background: transparent;
  
  /* Add glow */
  box-shadow: var(--glow-cyan);
}

sl-button.cyber-btn--magenta {
  --sl-button-border-color: var(--cyber-magenta-500);
  box-shadow: var(--glow-magenta);
}
```

---

## Testing the Integration

### 1. Verify CSS is loaded
Open browser DevTools → Elements → Check for `cyber-` classes in computed styles.

### 2. Test key visual elements
- [ ] Match cards have neon borders
- [ ] Status badges glow or glitch
- [ ] Hover effects work on buttons
- [ ] Dark theme is applied consistently
- [ ] No CSS conflicts with existing styles

### 3. Check responsive behavior
- [ ] Mobile: Effects don't break layout
- [ ] Desktop: Full cyberpunk aesthetic visible

### 4. Verify no JS errors
CYBERCORE is CSS-only, so no JS dependencies to check.

---

## Icon System (Optional)

CYBERCORE includes 153 cyberpunk-themed SVG icons. To use:

```typescript
// Import icon utilities
import { renderIcon, getIcon } from 'cybercore-css/icons';

// Render an icon
const terminalIcon = renderIcon('terminal', { size: 24, color: 'cyan' });

// Or use inline SVG with cyber-icon class
`<svg class="cyber-icon cyber-icon--cyan">...</svg>`
```

**Icon Categories:** Navigation, Actions, Media, Communication, Data, Security, Tech, Files, Status, Social

---

## Troubleshooting

### CSS Cascade Issues
CYBERCORE uses `@layer` for cascade control. If Shoelace styles override CYBERCORE:
```css
/* Increase specificity */
.page-match .cyber-btn {
  /* Your overrides */
}
```

### Glow Effects Not Visible
Ensure the parent element has a dark background:
```css
page-match {
  background: var(--cyber-void-900);
}
```

### Z-Index Issues
CYBERCORE effects use high z-index values. Check for conflicts with Shoelace z-index tokens (`--sl-z-index-*`).

---

## Expected Outcome

After integration, the `page-match` component should display:

1. **Dark cyberpunk background** — `--cyber-void-900`
2. **Match cards with neon borders** — Cyan glow on edges
3. **Glitch effect on status text** — "MATCH EN COURS" with chromatic aberration
4. **Neon buttons** — Glowing play/stop/delete buttons
5. **Terminal-style navigation** — Breadcrumb styled as terminal prompt
6. **Consistent color scheme** — Cyan primary, magenta danger, green success

---

## Files to Create/Modify

### Create
- `src/global/cybercore-override.css` — Custom overrides for Shoelace
- (Optional) `src/global/cybercore-theme.css` — Theme variable mappings

### Modify
- `src/global/shoelace.css` — Add CYBERCORE import at top
- `src/components/page-match/page-match.ts` — Add `cyber-*` classes to render methods

### Package
- `package.json` — Add `cybercore-css` dependency

---

## Commands to Run

```bash
# Install
pnpm add cybercore-css

# Development
pnpm dev:modern  # Vite dev server

# Build
pnpm build
```

---

## Notes for the AI Agent

1. **Start with CDN** for quick testing: Add the `<link>` to `index.html` first to see immediate results.

2. **Incremental approach**: Add one CYBERCORE class at a time and verify visually.

3. **Don't remove Shoelace**: We're testing aesthetic overlay, not replacement.

4. **Use browser DevTools**: Check `computed` styles to see which CSS variables are applied.

5. **Test keyboard navigation**: Ensure CYBERCORE effects don't break accessibility.

6. **Document changes**: Each modification should be reversible.

---

## Success Criteria

- [ ] CYBERCORE CSS loads without errors
- [ ] Match page displays cyberpunk aesthetic
- [ ] All Shoelace components still function
- [ ] No layout breaks on mobile/desktop
- [ ] Visual effects (glow, scanlines) are visible but not overwhelming
- [ ] Developer can toggle between classic and cyberpunk themes

---

**⚡ End of CYBERPUNK Integration Guide**