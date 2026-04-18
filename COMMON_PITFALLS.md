# Common Pitfalls

This document tracks common issues and their solutions specific to the ContestOrganizer codebase.

## Table of Contents
1. [Blank Page Caused by Overlay Elements](#blank-page-caused-by-overlay-elements)
2. [Zone Navigation System](#zone-navigation-system)

---

## Blank Page Caused by Overlay Elements

### Problem
The entire application appears as a blank (dark gray/black) page. All DOM elements are present in the DevTools, but nothing is visible or interactable.

### Root Cause
`<command-palette>` and `<gesture-overlay>` elements are created with `position: absolute; width: 100%; height: 100%` styles (inherited from zone styling in `app-root.ts`). Even when these components render `nothing` (empty content), their **host elements remain in the DOM with full viewport dimensions**, creating an invisible layer that blocks all content and interactions beneath them.

### Why This Happens
1. `AppRoot._ensureZoneElements()` applies zone-specific styles to ALL elements it creates
2. Overlays are NOT zones but were receiving zone styling (absolute positioning, full viewport size)
3. Components render `nothing` when closed, but the `:host` element still has layout
4. Overlays are appended last in DOM order, so they appear on top

### Solution
1. **In `app-root.ts`**: Distinguish overlays from zones and apply appropriate initialization:
   - Overlays: Set `hidden` attribute, skip zone styling
   - Zones: Apply zone styling (`data-active`, `data-collapsed`, positioning)

2. **In overlay components** (CommandPalette, GestureOverlay):
   - Remove `hidden` attribute when opening
   - Add `hidden` attribute when closing
   - Add CSS: `:host([hidden]) { display: none; }`

### Code Pattern
```typescript
// app-root.ts
const isOverlay = name === "command-palette" || name === "gesture-overlay";
if (isOverlay) {
  el.setAttribute("hidden", "");  // Hidden by default
} else {
  // Apply zone styling
}

// In overlay components
show(): void {
  this.removeAttribute("hidden");  // Make visible
  // ... open logic
}

hide(): void {
  this.setAttribute("hidden", "");  // Hide from layout
  // ... close logic
}
```

### Prevention
- Always distinguish overlay components from zone components
- Overlays should manage their own visibility state
- Use `hidden` attribute (not just empty rendering) for overlays
- Consider `display: none` on `:host` when hidden

---

## Zone Navigation System

### Architecture Overview
The application uses a **spatial navigation system** with three layers:

1. **Zones**: Main content areas (config, home, tournaments, tournament, matchs)
2. **NavigationOrchestrator**: Manages zone transitions and active state
3. **Overlays**: Global components (command-palette, gesture-overlay) that float above zones

### Key Concepts

#### Zones vs Overlays
| Aspect | Zones | Overlays |
|--------|-------|----------|
| Purpose | Main content areas | Global UI components |
| Visibility | Managed by `data-active`/`data-collapsed` | Managed by `hidden` attribute |
| Layout | Fill viewport portions (`position: absolute`) | Fixed overlay (`position: fixed`) |
| URL Sync | Yes (route changes update zones) | No |
| Multiple Active | Only one zone active at a time | Can coexist |

#### Zone Attributes
- `data-active="true"`: Zone is currently visible and interactive
- `data-collapsed="true"`: Zone is hidden (used for inactive zones)
- `data-zone`: Zone type identifier (config, home, tournaments, etc.)

#### Default Zone State
- Home zone is active by default (`activeZoneIndex = 1`)
- All other zones are collapsed by default

### Common Mistakes

1. **Treating overlays like zones**: Don't apply zone styling to overlays
2. **Forgetting `hidden` attribute**: Overlays need explicit visibility control
3. **Modifying zone state directly**: Use `NavigationOrchestrator` methods
4. **Assuming global CSS works**: All CSS is scoped to Shadow DOM

### Debugging Navigation Issues

1. Check `data-active` and `data-collapsed` attributes on zone elements
2. Verify `zoneType` property/attribute is set correctly
3. Check `NavigationOrchestrator.activeZoneIndex` value
4. Look for CSS `visibility: hidden` or `display: none` on zones

---

## Shadow DOM Specifics

### CSS Inheritance
- Global Tailwind classes do NOT penetrate Shadow DOM
- `BaseElement` injects `tailwindSheet` with common utilities (~190 classes)
- Component-specific styles via `createComponentSheet()`
- Dark mode: Check for `html.dark` class on document, use CSS custom properties

### Rendering
- Never use `innerHTML` — always use lit-html `html\`...\`` templates
- `_render()` must call `this._renderTemplate()`
- Property bindings (`.prop=`) execute before `connectedCallback` — guard against missing shadow root

---

*Last updated: 2026-04-12*
