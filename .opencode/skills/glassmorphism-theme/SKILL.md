# Glassmorphism Theme Skill

## Overview

This project uses a **Glassmorphism Design System** with dual-theme support (light/dark). All vanilla Web Components must follow this design language for consistency.

**Core Principles:**
- Translucent backgrounds with backdrop blur
- Floating cards with depth (layered shadows)
- Subtle animations and micro-interactions
- High contrast text in both themes
- Consistent spacing and typography

## Quick Start

### 1. Component Structure

Every themed component MUST follow this structure:

```typescript
import { BaseElement } from "@core/base-element.js";
import styles from "./my-component.css";

export class MyComponent extends BaseElement {
  protected _createRenderRoot(): Element {
    return this; // Light DOM for theming
  }

  protected _render(): void {
    this.innerHTML = `
      <div class="my-component">
        <style>${styles}</style>
        <!-- Content -->
      </div>
    `;
  }
}
```

### 2. CSS Architecture

The CSS file MUST be structured in this exact order:

```css
/* ========================================
   1. DESIGN TOKENS (Custom Properties)
   ======================================== */
.my-component {
  /* Glassmorphism Base */
  --my-glass-bg: rgba(255, 255, 255, 0.85);
  --my-glass-border: rgba(255, 255, 255, 0.5);
  --my-glass-shadow:
    0 8px 32px rgba(31, 38, 135, 0.2),
    0 2px 8px rgba(31, 38, 135, 0.15);
  --my-glass-shadow-hover:
    0 16px 48px rgba(31, 38, 135, 0.25),
    0 4px 16px rgba(31, 38, 135, 0.2);
  --my-glass-blur: 16px;

  /* Status Accents (mapped to Shoelace) */
  --my-accent-info: var(--sl-color-primary-500);
  --my-accent-bug: var(--sl-color-danger-500);
  --my-accent-task: var(--sl-color-neutral-500);
  --my-accent-note: var(--sl-color-success-500);
  --my-accent-warning: var(--sl-color-warning-500);

  /* RGB versions for rgba() - CRITICAL for status badges */
  --my-accent-info-rgb: var(--sl-color-primary-500-rgb, 66, 99, 235);
  --my-accent-bug-rgb: var(--sl-color-danger-500-rgb, 217, 51, 51);
  --my-accent-task-rgb: var(--sl-color-neutral-500-rgb, 112, 118, 128);
  --my-accent-note-rgb: var(--sl-color-success-500-rgb, 43, 174, 102);
  --my-accent-warning-rgb: var(--sl-color-warning-500-rgb, 232, 166, 29);

  /* Text Hierarchy */
  --my-text-primary: var(--sl-color-neutral-900);
  --my-text-secondary: var(--sl-color-neutral-600);
  --my-text-muted: var(--sl-color-neutral-500);

  /* Animation Timings */
  --my-transition-fast: 150ms ease;
  --my-transition-normal: 250ms ease;
  --my-transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);

  /* Spacing System */
  --my-space-xs: 0.25rem;
  --my-space-sm: 0.5rem;
  --my-space-md: 0.75rem;
  --my-space-lg: 1rem;
  --my-space-xl: 1.5rem;
  --my-space-2xl: 2rem;

  /* Focus Ring */
  --my-focus-ring: 0 0 0 2px var(--sl-color-primary-200);
}

/* ========================================
   2. COMPONENT STYLES
   ======================================== */
.my-component {
  display: flex;
  flex-direction: column;
  gap: var(--my-space-lg);
  padding: var(--my-space-lg);
}

/* Glass Card */
.my-card {
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0.7) 100%
  );
  border: 1px solid var(--my-glass-border);
  border-radius: var(--sl-border-radius-large);
  box-shadow: var(--my-glass-shadow);
  -webkit-backdrop-filter: blur(var(--my-glass-blur));
  backdrop-filter: blur(var(--my-glass-blur));
  transition:
    transform var(--my-transition-normal),
    box-shadow var(--my-transition-normal);
  animation: fade-in-up var(--my-transition-slow) both;
}

/* Gradient Border Effect */
.my-card::before {
  position: absolute;
  inset: 0;
  padding: 1px;
  pointer-events: none;
  content: "";
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.8),
    rgba(255, 255, 255, 0.1)
  );
  border-radius: inherit;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

/* Shimmer Effect */
.my-card::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: "";
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  background-size: 200% 100%;
  border-radius: inherit;
  animation: shimmer 3s infinite;
}

.my-card:hover {
  box-shadow: var(--my-glass-shadow-hover);
  transform: translateY(-4px) scale(1.01);
}

/* ========================================
   3. DARK MODE OVERRIDES
   ======================================== */
.sl-theme-dark .my-component {
  /* Glassmorphism - Dark translucent backgrounds */
  --my-glass-bg: rgba(35, 35, 45, 0.9);
  --my-glass-border: rgba(255, 255, 255, 0.15);
  --my-glass-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.3);
  --my-glass-shadow-hover:
    0 16px 48px rgba(0, 0, 0, 0.5),
    0 4px 16px rgba(0, 0, 0, 0.4);

  /* Text - Light colors for dark backgrounds */
  --my-text-primary: #ffffff;
  --my-text-secondary: #e0e0e0;
  --my-text-muted: #a0a0a0;

  /* Focus ring - lighter for visibility on dark */
  --my-focus-ring: 0 0 0 2px var(--sl-color-primary-400);
}

/* Dark mode card gradient override */
.sl-theme-dark .my-card {
  background: linear-gradient(
    135deg,
    rgba(40, 40, 55, 0.9) 0%,
    rgba(25, 25, 35, 0.85) 100%
  );
}

/* Dark mode gradient border */
.sl-theme-dark .my-card::before {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15),
    rgba(255, 255, 255, 0.05)
  );
}

/* Dark mode shimmer - subtler */
.sl-theme-dark .my-card::after {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
}
```

## Design Tokens Reference

### Glassmorphism Values

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--glass-bg` | `rgba(255,255,255,0.85)` | `rgba(35,35,45,0.9)` | Card backgrounds |
| `--glass-border` | `rgba(255,255,255,0.5)` | `rgba(255,255,255,0.15)` | Card borders |
| `--glass-blur` | `16px` | `16px` | Backdrop blur |
| `--glass-shadow` | Blue-tinted | Black | Depth on bg |

### Status Accents

| Status | Color Variable | RGB Variable | Usage |
|--------|---------------|--------------|-------|
| info | `var(--sl-color-primary-500)` | `var(--sl-color-primary-500-rgb)` | Information |
| bug | `var(--sl-color-danger-500)` | `var(--sl-color-danger-500-rgb)` | Bugs/errors |
| task | `var(--sl-color-neutral-500)` | `var(--sl-color-neutral-500-rgb)` | Tasks |
| note | `var(--sl-color-success-500)` | `var(--sl-color-success-500-rgb)` | Notes |
| warning | `var(--sl-color-warning-500)` | `var(--sl-color-warning-500-rgb)` | Warnings |

### Text Colors

**Light Mode:**
- Primary: `var(--sl-color-neutral-900)` → `#1a1a1a`
- Secondary: `var(--sl-color-neutral-600)` → `#4a4a4a`
- Muted: `var(--sl-color-neutral-500)` → `#6a6a6a`

**Dark Mode:**
- Primary: `#ffffff`
- Secondary: `#e0e0e0`
- Muted: `#a0a0a0`

### Spacing Scale

```
xs:   0.25rem  (4px)
sm:   0.5rem   (8px)
md:   0.75rem  (12px)
lg:   1rem     (16px)
xl:   1.5rem   (24px)
2xl:  2rem     (32px)
```

### Animation Timings

```
fast:   150ms ease
normal: 250ms ease
slow:   400ms cubic-bezier(0.4, 0, 0.2, 1)
```

## Common Patterns

### Pattern 1: Status Indicator Badge

```css
.status-indicator {
  display: inline-flex;
  gap: var(--my-space-xs);
  align-items: center;
  padding: var(--my-space-xs) var(--my-space-sm);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border-radius: 9999px;
  box-shadow: 0 0 10px currentColor;
}

.sl-theme-dark .status-indicator {
  box-shadow: 0 0 8px currentColor;
}

.status-indicator[data-type="info"] {
  color: var(--my-accent-info);
  background: rgba(var(--my-accent-info-rgb), 0.1);
}

.status-indicator[data-type="bug"] {
  color: var(--my-accent-bug);
  background: rgba(var(--my-accent-bug-rgb), 0.1);
}

.status-indicator[data-type="task"] {
  color: var(--my-accent-task);
  background: rgba(var(--my-accent-task-rgb), 0.1);
}

.status-indicator[data-type="note"] {
  color: var(--my-accent-note);
  background: rgba(var(--my-accent-note-rgb), 0.1);
}

.status-indicator[data-type="warning"] {
  color: var(--my-accent-warning);
  background: rgba(var(--my-accent-warning-rgb), 0.1);
}
```

### Pattern 2: Entrance Animation

```css
@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  70% {
    transform: translateY(-4px) scale(1.01);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.my-card {
  animation: fade-in-up var(--my-transition-slow) both;
}

/* Staggered delays */
.my-card:nth-child(1) { animation-delay: 0ms; }
.my-card:nth-child(2) { animation-delay: 100ms; }
.my-card:nth-child(3) { animation-delay: 200ms; }
.my-card:nth-child(4) { animation-delay: 300ms; }
.my-card:nth-child(5) { animation-delay: 400ms; }

@media (prefers-reduced-motion: reduce) {
  .my-card {
    animation: none;
  }
}
```

### Pattern 3: Skeleton Loading

```css
@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-card {
  height: 5rem;
  background: linear-gradient(
    90deg,
    var(--sl-color-neutral-100) 0%,
    var(--sl-color-neutral-50) 50%,
    var(--sl-color-neutral-100) 100%
  );
  background-size: 200% 100%;
  border-radius: var(--sl-border-radius-large);
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.sl-theme-dark .skeleton-card {
  background: linear-gradient(
    90deg,
    var(--sl-color-neutral-800) 0%,
    var(--sl-color-neutral-900) 50%,
    var(--sl-color-neutral-800) 100%
  );
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-card {
    background-position: 0;
    animation: none;
  }
}
```

### Pattern 4: Empty State

```css
.my-empty {
  display: flex;
  flex-direction: column;
  gap: var(--my-space-md);
  align-items: center;
  justify-content: center;
  padding: var(--my-space-2xl);
  text-align: center;
}

.sl-theme-dark .my-empty {
  color: var(--my-text-secondary);
}

.my-empty-icon {
  font-size: 3rem;
  opacity: 0.6;
}

.my-empty p {
  margin: 0;
  font-size: 1rem;
  color: var(--my-text-muted);
}
```

### Pattern 5: Error State

```css
.my-error {
  display: flex;
  flex-direction: column;
  gap: var(--my-space-md);
  align-items: center;
  justify-content: center;
  padding: var(--my-space-2xl);
  text-align: center;
  background: rgba(var(--my-accent-bug-rgb), 0.05);
  border: 1px solid rgba(var(--my-accent-bug-rgb), 0.2);
  border-radius: var(--sl-border-radius-large);
}

.sl-theme-dark .my-error {
  background: rgba(var(--my-accent-bug-rgb), 0.15);
  border-color: rgba(var(--my-accent-bug-rgb), 0.4);
}

.my-retry {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--my-space-sm) var(--my-space-lg);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--sl-color-neutral-0);
  cursor: pointer;
  background: var(--sl-color-neutral-600);
  border: none;
  border-radius: var(--sl-border-radius-medium);
  transition: background var(--my-transition-fast);
}

.my-retry:hover {
  background: var(--sl-color-neutral-700);
}

.my-retry:focus-visible {
  outline: none;
  box-shadow: var(--my-focus-ring);
}
```

### Pattern 6: Focus Visible

```css
.my-component *:focus-visible {
  outline: none;
  box-shadow: var(--my-focus-ring);
}

.my-interactive:focus-visible {
  outline: none;
  border-radius: var(--sl-border-radius-medium);
  box-shadow: var(--my-focus-ring);
}
```

## Critical Rules

### 1. Always Use Custom Properties

❌ **Never hardcode colors:**
```css
.my-text { color: #333; } /* Bad - won't adapt */
```

✅ **Use CSS variables:**
```css
.my-component { --my-text: var(--sl-color-neutral-900); }
.sl-theme-dark .my-component { --my-text: #ffffff; }
.my-text { color: var(--my-text); } /* Good - adapts */
```

### 2. Light DOM Only

Always use Light DOM for themed components:
```typescript
protected _createRenderRoot(): Element {
  return this; // Not attachShadow()
}
```

### 3. High Contrast Text

- Light mode: Dark text on light translucent backgrounds
- Dark mode: Light text (#ffffff minimum) on dark translucent

### 4. Include RGB Variants for Status Colors

When using status badges with `rgba()`, you MUST include RGB variants:
```css
--my-accent-info-rgb: var(--sl-color-primary-500-rgb, 66, 99, 235);
```

Then use them like:
```css
background: rgba(var(--my-accent-info-rgb), 0.1);
```

### 5. Test Both Themes

Before submitting:
- [ ] Test in light mode
- [ ] Test in dark mode (add `.sl-theme-dark` to `<html>`)
- [ ] Check contrast ratios
- [ ] Verify animations work
- [ ] Test reduced-motion preference

## Reference Implementation

See `/src/components/app-status-news/app-status-news.css` for a complete, production-ready example.

Key sections:
- Lines 1-46: Design tokens (light mode)
- Lines 48-54: Main container styles
- Lines 59-77: Dark mode overrides
- Lines 132-188: Glassmorphism card with gradient border
- Lines 234-282: Status indicator badges
- Lines 490-575: Empty and error states
- Lines 579-637: Skeleton loading with shimmer
- Lines 655-698: Entrance animation and stagger
- Lines 701-726: Reduced motion support
- Lines 791-807: High contrast mode

## Troubleshooting

### Text is invisible in dark mode
**Cause:** Using dark text colors in dark mode
**Fix:** Override with `#ffffff` for primary text in `.sl-theme-dark`

### Glassmorphism effect not visible
**Cause:** Solid background instead of translucent
**Fix:** Use `rgba()` with alpha < 1, add `backdrop-filter: blur()`

### Shadows not visible on dark background
**Cause:** Dark shadows on dark background
**Fix:** Use darker shadows (higher alpha) in dark mode, use black instead of blue-tinted

### Component not adapting to theme
**Cause:** Hardcoded colors or Shadow DOM
**Fix:** Use CSS custom properties + Light DOM

### Status indicator has no visible background
**Cause:** Forgot to use RGB variant for rgba()
**Fix:** Define `--my-accent-info-rgb` and use `rgba(var(--my-accent-info-rgb), 0.1)`

### Animation looks janky
**Cause:** No `animation-fill-mode: both` or conflicting transitions
**Fix:** Add `animation-fill-mode: both` and ensure transitions don't conflict

### Card border looks wrong in dark mode
**Cause:** Gradient border overlay not adjusted for dark
**Fix:** Override `.my-card::before` background in `.sl-theme-dark`

### Focus ring not visible
**Cause:** Focus ring color same as background
**Fix:** Override `--my-focus-ring` in dark mode with lighter color

## Accessibility Checklist

- [ ] Focus states visible in both themes (`.sl-theme-dark .my-component *:focus-visible`)
- [ ] Reduced motion respected (`@media (prefers-reduced-motion: reduce)`)
- [ ] High contrast mode supported (`@media (prefers-contrast: high)`)
- [ ] Color is not the only indicator (use icons + text for status)
- [ ] Touch targets are at least 44x44px on mobile
- [ ] Text has sufficient contrast ratio (4.5:1 for body, 3:1 for large text)
