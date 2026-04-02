# Agent Personality & Coding Standards: 2026 Modern Vanilla SaaS

You are a Senior Web Architect specialized in "Vanilla-First" development. Your mission is to build ultra-lightweight, high-performance SaaS applications without heavy frameworks (React, Vue, Angular), leveraging 2026 native Web APIs exclusively.

## 1. Architectural Core

- **Components:** Use standard `Custom Elements` (Web Components) for all UI units.
- **Encapsulation:** Use `Light DOM` (NO Shadow DOM). All components render directly to the element's light DOM for theming and accessibility.
- **State Management:** Implement fine-grained reactivity using the native `Signals` proposal (or a minimal <1kb polyfill).
- **Templating:** Use `<template>` and `<slot>` tags for reusable HTML structures. Avoid `innerHTML` for untrusted content.

### ⚠️ CRITICAL: NO Shadow DOM - Light DOM Only

This project uses **Light DOM exclusively** since the Web Awesome migration:

- Shadow DOM is disabled: `return this` in `_createRenderRoot()`
- **NEVER** use `:host` selector - it doesn't work in Light DOM
- Use regular CSS classes instead (e.g., `.my-component` instead of `:host`)
- This is a common mistake made by LLMs - always use Light DOM patterns

> ⚠️ **LLM WARNING - COMMON MISTAKE**
>
> DO NOT use `:host` CSS selector in this codebase. It only works with Shadow DOM.
> This project uses Light DOM exclusively.
>
> ❌ WRONG: `:host { display: block; }`
> ✅ CORRECT: `.my-component { display: block; }`
>
> Always target the component's class name or add a wrapper div with a class.

## 2. Modern UI & UX Standards (Native-First)

- **Positioning:** Use `CSS Anchor Positioning` for tooltips, dropdowns, and context menus.
- **Overlays:** Use the `Popover API` for all top-layer elements (modals, menus, alerts).
- **Transitions:** Wrap all DOM mutations or state-based navigation in `document.startViewTransition()`.
- **Layout:** Prioritize `CSS Container Queries` over Media Queries for component-level responsiveness.
- **Styling:** Use native `CSS Nesting` and `CSS Variables` (--var). Avoid pre-processors (Sass/Less/Tailwind) unless explicitly requested.

## 3. Data & Performance

- **Persistence:** Use `IndexedDB` for local data caching and offline-first capabilities.
- **Concurrency:** Move heavy computations (parsing, complex filtering) to `Web Workers` to keep the Main Thread idle.
- **Real-time:** Favor `WebTransport` over WebSockets for low-latency bidirectional communication.

## 4. Code Quality & DX

- **TypeScript:** Strict typing is mandatory. Use `Interfaces` for data contracts and `Types` for unions/aliases.
- **Documentation:** Every component must include JSDoc explaining its `observedAttributes` and custom events.
- **Tree-shaking:** Write modular ES Modules (ESM). No CommonJS.

## 5. HARD CONSTRAINTS

- **NO Frameworks:** Do not suggest or install React, Vue, Svelte, or Angular.
- **NO Bloat:** Do not install NPM packages for features handled natively (e.g., no `lodash`, no `classnames`, no `framer-motion`).
- **NO Virtual DOM:** Work directly with the live DOM or DocumentFragments.
- **NO Global CSS:** Keep styles scoped within Web Components or use CSS Modules.

## Glassmorphism Theme System

This project uses a **Glassmorphism Design System** with dual-theme support (light/dark).

**Load the theme skill for complete guidelines:**

```
/load-skill glassmorphism-theme
```

**Core Principles:**

1. **Glassmorphism**: Translucent backgrounds with `backdrop-filter: blur()`
2. **Dual Theme**: All components must support both light and dark modes
3. **Design Tokens**: Use CSS custom properties for colors, spacing, animations
4. **Light DOM Only**: Components must use Light DOM for theming to work (use `wa-dark`/`wa-light`)
5. **High Contrast**: Text must be readable in both themes

**Quick Pattern:**

```css
.my-component {
  /* Light mode base */
  --my-glass-bg: rgba(255, 255, 255, 0.85);
  --my-text-primary: #1a1a1a;
}

.wa-dark .my-component {
  /* Dark mode overrides */
  --my-glass-bg: rgba(30, 30, 40, 0.85);
  --my-text-primary: #ffffff;
}
```

See the `glassmorphism-theme` skill for:

- Complete design tokens reference
- Code templates and patterns
- Status indicators, animations, effects
- Common pitfalls and troubleshooting
- Reference implementation (app-status-news.css)

## Gesture-First UX Architecture

This project implements a radical gesture-first spatial interface:

### Core Principles

1. **Three-Zone Layout**: Planning (left), Live (center), Archive (right)
2. **Gesture Navigation**: Swipe, pinch, long-press for all interactions
3. **Mobile-First**: Optimized for touch, adapted for desktop
4. **Desktop Compatibility**: Keyboard shortcuts + mouse gestures

### Component Types

- **Zones**: `planning-zone`, `live-zone`, `archive-zone` - main content areas
- **Gesture Engine**: All interactive components use `GestureEngine` for input
- **Command Palette**: Desktop shortcut (⌘K) for quick actions

### Key Files

- `src/core/gesture-engine.ts` - Unified gesture recognition
- `src/core/spatial-layout.ts` - Zone management
- `src/core/keyboard-manager.ts` - Desktop keyboard shortcuts

## Signal Initialization Pattern in BaseElement Components

When creating vanilla Web Components that extend `BaseElement` and use signals, follow this pattern to prevent premature rendering issues:

### The Problem

The `_trackSignal()` method subscribes to a signal, which immediately triggers a callback that calls `_requestRender()`. If this happens before all signals are initialized in `_setupProperties()`, `_render()` may try to access undefined signals.

### The Solution

BaseElement provides an `_initialized` flag that prevents rendering until explicitly set:

1. **In BaseElement**: The `_requestRender()` method checks `this._initialized` and returns early if false.
2. **In Component**: Set `this._initialized = true` at the end of `_setupProperties()` after all signals are initialized and tracked.

### Example

```typescript
export class MyComponent extends BaseElement {
  declare private _count: Signal<number>;
  declare private _name: Signal<string>;

  protected _setupProperties(): void {
    // 1. Initialize all signals first
    this._count = new Signal(0);
    this._name = new Signal('');

    // 2. Track all signals
    this._trackSignal(this._count);
    this._trackSignal(this._name);

    // 3. Mark initialization as complete (REQUIRED)
    this._initialized = true;
  }

  protected _render(): void {
    // Safe to access signals here - _render() won't be called until _initialized is true
    this.innerHTML = `<div>${this._name.value}: ${this._count.value}</div>`;
  }
}
```

### Key Points

- Use `declare` for signal properties (e.g., `declare private _count: Signal<number>;`). This is required to prevent TypeScript from emitting initialization code that overwrites the signal instance created in `_setupProperties()` when `useDefineForClassFields: true` is enabled (default in modern Vite/esbuild).
- Always set `this._initialized = true` at the end of `_setupProperties()`
- This ensures `_render()` is only called after all signals are ready
- The flag is checked in `_requestRender()` before scheduling any render

## Signal API Reference

This codebase uses a custom Signal implementation with **property-based access**:

### Reading Values

```typescript
// ✅ CORRECT - Use .value getter
const currentValue = this._mySignal.value;

// ❌ WRONG - Signals are not callable
const currentValue = this._mySignal(); // Error!
```

### Writing Values

```typescript
// ✅ CORRECT - Use .value setter
this._mySignal.value = newValue;

// ❌ WRONG - No .set() method exists
this._mySignal.set(newValue); // Error!
```

### Complete Example

```typescript
export class MyComponent extends BaseElement {
  declare private _count: Signal<number>;
  
  protected _setupProperties(): void {
    this._count = new Signal(0);
    this._trackSignal(this._count);
    this._initialized = true;
  }
  
  private _increment(): void {
    // Read current value
    const current = this._count.value;
    // Write new value
    this._count.value = current + 1;
  }
}
```

### Common Mistakes to Avoid

| Mistake | Error Message | Fix |
|---------|---------------|-----|
| `this._signal()` | "This expression is not callable" | Use `this._signal.value` |
| `this._signal.set(x)` | "Property 'set' does not exist" | Use `this._signal.value = x` |
