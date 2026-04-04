# Session Technical Resume — Web Awesome CSS Reset & Theme Fix

## Session Overview

This session accomplished three main objectives:

1. **Full CSS reset on Web Awesome components** — Removed ALL custom CSS overrides on WA components across the entire application. Philosophy: if WA provides a component or style, use it with ZERO CSS customization.
2. **Glassmorphism removal** — Deleted the entire experimental glassmorphism theme system.
3. **Web Awesome theme activation** — Fixed the broken theme switch and variable naming mismatch to make the `awesome` theme and dark/light mode work correctly.

---

## Part 1: CSS Reset on WA Components

### Files Modified

| File | Changes |
|------|---------|
| `src/global/webawesome.css` | Reduced to 1 line: `@import "@awesome.me/webawesome/dist/styles/themes/awesome.css";` — removed all `.block-*`, `.text-*`, `.container-*` utilities and all `wa-card`, `wa-breadcrumb`, `wa-menu`, `wa-menu-item`, `wa-carousel`, `wa-dialog` overrides |
| `src/global/variables.css` | Removed `div.page-content` decorative styling (color, bg, border, shadow). Kept layout rules (`grid-300`, `footer`, `can-be-clicked`, `border-sky`) |
| `src/components/app-status-news/app-status-news.css` | **DELETED** — entire glassmorphism file removed |
| `src/components/app-status-news/app-status-news.ts` | Refactored to use `wa-card`, `wa-tag`, `wa-badge`, `wa-button` instead of custom glassmorphism divs |
| `src/components/scorer-common/scorer-common.ts` | Removed inline glassmorphism `<style>` block. Replaced custom buttons with `<wa-button variant="warning/brand" pill>` |
| `src/components/command-palette/command-palette.css` | Removed `backdrop-filter: blur(4px)` |
| `src/components/gesture-overlay/gesture-overlay.ts` | Removed `backdrop-filter`, replaced custom buttons with `<wa-button>`, replaced `.section-label` with `<wa-tag>` |
| `src/components/page-match/page-match.ts` | Removed inline CSS targeting `wa-button` (focus-visible, width overrides) |
| `src/components/team-tile/team-tile.ts` | Removed Tailwind utility class duplications from inline CSS. Kept rank badge styling |
| `src/components/match/live-match-card.ts` | Replaced `rgba()` glassmorphism backgrounds with WA color tokens. Replaced custom end button with `<wa-button variant="danger">` |
| `src/components/match/gesture-scoring.ts` | Replaced `rgba(255,255,255,0.9)` toast background with `var(--wa-color-neutral-100)` |
| `src/components/page-match/page-match.ts` | Replaced `.block-primary` with Tailwind arbitrary values using WA tokens |
| `src/components/grid-basket/grid-basket.ts` | Replaced `.block-primary` with Tailwind arbitrary values |
| `src/components/grid-default/grid-default.ts` | Replaced `.block-primary` with Tailwind arbitrary values |
| `src/components/input-number/input-number.ts` | Replaced `.container-xl` with Tailwind `m-6` |
| `src/components/page-tournament-select/page-tournament-select.ts` | Removed `.card-common` class usage |
| `src/components/page-config/page-config.ts` | Replaced `.page-content` with Tailwind arbitrary value classes |
| `src/components/page-home/page-home.ts` | Replaced `.page-content` with Tailwind arbitrary value classes |
| `src/components/page-404/page-404.ts` | Replaced `.page-content` with Tailwind arbitrary value classes |
| `src/components/page-tournament/page-tournament.ts` | Replaced `.page-content` with Tailwind arbitrary value classes |
| `src/components/page-tournament-select/page-tournament-select.ts` | Replaced `.page-content` with Tailwind arbitrary value classes |
| `src/global/tailwind.css` | Updated safelist: removed dead classes, added new ones |

### Files Created

| File | Purpose |
|------|---------|
| `CUSTOM_CSS_ELEMENTS.md` | Lists 12 elements that genuinely need custom CSS because WA doesn't cover the need (rank badges, zone accents, grid layout, animations, etc.) |

### Files Updated

| File | Changes |
|------|---------|
| `CODING_GUIDELINES.md` | Removed Glassmorphism section (lines 58-98). Added "Web Awesome Styling Directive" section with Zero Custom CSS rule |

---

## Part 2: Theme Activation

### Root Cause #1: Theme CSS was never loaded

`vanilla-entry.ts` imported `@awesome.me/webawesome/dist/styles/webawesome.css` (base styles) but **never** imported `src/global/webawesome.css` (which contains the theme import). The theme file existed but was orphaned.

**Fix**: Added `import "./global/webawesome.css"` to `vanilla-entry.ts`.

### Root Cause #2: Theme classes were never added to `<html>`

The `awesome.css` theme scopes ALL its rules behind `.wa-theme-awesome` and `.wa-palette-bright` selectors. `global-setting.ts` only toggled `wa-dark`/`wa-light`, never the theme class.

**Fix**: Added `document.documentElement.classList.add("wa-theme-awesome")` and `document.documentElement.classList.add("wa-palette-bright")` in `global-setting.ts` `init()`.

### Root Cause #3: Variable naming mismatch (3-digit vs 2-digit)

The application code uses 3-digit color scale names (`--wa-color-neutral-100`, `--wa-color-brand-600`) but Web Awesome defines 2-digit scale names (`--wa-color-neutral-10`, `--wa-color-brand-60`). All color references resolved to `unset`.

**Fix**: Created `src/global/wa-variable-aliases.css` — a shim that maps 3-digit → 2-digit for all palettes (neutral, brand, success, warning, danger, primary, secondary, blue, sky).

### Files Modified (Theme)

| File | Changes |
|------|---------|
| `src/global/webawesome.css` | Changed import from `default.css` to `awesome.css` |
| `src/vanilla-entry.ts` | Replaced base `webawesome.css` import with `layers.css` + `native.css` + `utilities.css` (removes dead default theme). Added imports for `./global/webawesome.css` and `./global/wa-variable-aliases.css` |
| `src/modules/global-setting/global-setting.ts` | Added `wa-theme-awesome` and `wa-palette-bright` classes to `<html>` in `init()` |
| `src/global/tailwind.css` | Fixed `--wa-color-neutral-300` → `--wa-color-neutral-30`, `--wa-color-neutral-200` → `--wa-color-neutral-20` |
| `src/global/variables.css` | Fixed `--wa-font-sans` → `--wa-font-family-body`, `--wa-color-blue-100` → `--wa-color-blue-10` |

### Files Created (Theme)

| File | Purpose |
|------|---------|
| `src/global/wa-variable-aliases.css` | CSS variable alias shim: maps 3-digit color scale to WA's 2-digit scale. Covers neutral, brand, success, warning, danger, primary, secondary, blue, sky palettes. Uses `@layer wa-color-palette` for correct cascade integration |

---

## Architecture Decisions

### Zero Custom CSS on WA Components

If Web Awesome provides a component or style that covers the need → use it with ZERO CSS customization. Custom CSS is only acceptable when:
1. WA has no component or style that covers the need
2. The need is layout-related (grid, flex, positioning)
3. The need is a UX animation not provided by WA
4. The element is documented in `CUSTOM_CSS_ELEMENTS.md`

### Design Tokens Are OK

Using `var(--wa-color-brand-600)` etc. is the intended usage pattern. This is not "custom CSS" — it's using WA's design system.

### Alias Shim Strategy

Instead of renaming every variable reference across 15+ files, we created a CSS alias shim. This is a non-breaking fix that makes all existing code work immediately. The shim can be gradually removed as code is migrated to use native 2-digit names.

---

## State for Next Agent

### Build Status
- ✅ Build passes
- ✅ Lint passes
- ✅ All smoke tests pass

### What Works
- Web Awesome `awesome` theme is active
- Dark/light mode switch in config zone should work
- All WA components use native styling (no custom overrides)
- Glassmorphism is completely removed

### What to Verify
- Visually confirm the `awesome` theme renders correctly (match WA docs)
- Test dark/light mode toggle in config zone
- Check that all pages render correctly after `.page-content` → Tailwind migration
- Verify tournament cards, match tiles, and team tiles display properly

### Commands for Next Agent
```bash
# Verify build works
pnpm build

# Check for lint/format issues
pnpm exec ultracite check

# Search for remaining 3-digit variable references (to gradually migrate)
grep -rn "wa-color-[a-z]*-[0-9][0-9][0-9]" src/
```

### Known Technical Debt
- The alias shim (`wa-variable-aliases.css`) is a temporary bridge. Long-term, code should use native 2-digit variable names
- `vanilla.css` bundle is ~357 kB — could be optimized by removing unused WA component imports
- Some components still use inline `<style>` blocks for layout — acceptable per the directive, but could be migrated to Tailwind