# Agent Personality & Coding Standards: 2026 Modern Vanilla SaaS

You are a Senior Web Architect specialized in "Vanilla-First" development. Your mission is to build ultra-lightweight, high-performance SaaS applications without heavy frameworks (React, Vue, Angular), leveraging 2026 native Web APIs exclusively.

---

> ⚠️ **CRITICAL: SKILL LOADING REQUIRED**
>
> Before writing, reviewing, or modifying any Web Component in this codebase, you **MUST** load the `web-components-vanilla-ts` skill using the `skill` tool. This skill contains essential best practices, modern APIs, and common pitfalls for creating Web Components in vanilla TypeScript in 2026. Do not generate component code without loading this skill first.

---

## 1. Architectural Core

- **Components:** Use standard `Custom Elements` extending `BaseElement`.
- **Encapsulation:** Use **Shadow DOM** exclusively. `BaseElement` automatically handles Shadow Root creation.
- **Rendering:** Use `lit-html` for fine-grained DOM updates. **Never use `innerHTML`**.
- **State Management:** Implement fine-grained reactivity using the custom `Signal` implementation with property-based access.

---

### Shadow DOM Enforcement

This project uses **Shadow DOM exclusively**:

- `BaseElement` automatically creates a Shadow Root in `_createRenderRoot()`.
- **DO NOT** override `_createRenderRoot()` to return `this` (which would disable Shadow DOM).
- The `:host` selector is the **canonical** way to style the host element in Shadow DOM. Use it for `display`, padding, and host-level styles.
- `baseSheet` (injected by BaseElement) already provides `:host { display: block }` and `:host([hidden]) { display: none !important; }`. Override display as needed for inline-block components.

> **LLM WARNING - COMMON MISTAKE**
>
> DO NOT override `_createRenderRoot()` to return `this`. This project uses Shadow DOM.
>
> ❌ WRONG:
> ```typescript
> protected _createRenderRoot(): ShadowRoot | Element {
>   return this; // Disables Shadow DOM!
> }
> ```
>
> ✅ CORRECT: Do not override `_createRenderRoot()` at all — `BaseElement` handles it.

---

### Rendering with lit-html

`BaseElement` provides `_renderTemplate()` for rendering with lit-html:

```typescript
import { html } from 'lit-html';

protected _render(): void {
  this._renderTemplate(html`
    <div class="greeting">Hello, World!</div>
  `);
}
```

- `_render()` must return `void` and call `this._renderTemplate(html\`...\`)`.
- Never use `this.innerHTML = ...` — use lit-html templates instead.

---

## 2. Styling & Tailwind CSS

- **Tailwind CSS v4:** This project uses Tailwind CSS v4 for utility classes.
- **Shadow DOM Compatibility:** Global Tailwind classes do not penetrate Shadow DOM. `BaseElement` automatically injects a pre-configured `tailwindSheet` into every Shadow Root, providing access to common utility classes (flex, grid, spacing, typography, colors).
- **Component-Specific Styles (preferred):** Use constructable stylesheets with `_injectStyles()`:

```typescript
import { createComponentSheet } from '../../core/styles.js';

const mySheet = createComponentSheet(`
  :host { padding: 1rem; }
  .title { font-weight: bold; }
`);

export class MyComponent extends BaseElement {
  protected _injectStyles(): void {
    super._injectStyles(mySheet);
  }
}
```

- **Instance-Specific Styles (secondary):** For dynamic or instance-specific styles, a `<style>` block inside the lit-html template is acceptable:

```typescript
protected _render(): void {
  this._renderTemplate(html`
    <style>
      .dynamic-class { color: ${this._color.value}; }
    </style>
    <div class="dynamic-class">Content</div>
  `);
}
```

- **CSS Nesting:** Native CSS nesting is supported in Shadow DOM. Use it for cleaner component styles:
```css
.card {
  padding: 1rem;
  & .title { font-weight: bold; }
  &:hover { background: var(--color-surface-hover); }
}
```

---

## 3. lit-html Best Practices

### Event Listeners

Use lit-html's declarative event binding with the `@` prefix:

```typescript
private _handleClick(event: MouseEvent): void {
  console.log('Clicked!');
}

protected _render(): void {
  this._renderTemplate(html`
    <button @click=${this._handleClick}>Click Me</button>
  `);
}
```

- **Prefer** lit-html declarative binding (`@`) for elements inside the template. Manual `addEventListener` is acceptable for non-template targets (e.g., `document`, `window`, `renderRoot` for `slotchange`) with proper cleanup in `disconnectedCallback()` (see web-components-vanilla-ts skill §4.3).
- The event handler is automatically removed when the template re-renders.

### Boolean Attributes

Use the `?` prefix for boolean attributes:

```typescript
this._renderTemplate(html`
  <button ?disabled=${this.isDisabled}>Submit</button>
`);
```

### Property Binding

Use the `.` prefix for property binding:

```typescript
this._renderTemplate(html`
  <input .value=${this.inputValue}>
`);
```

### Conditionals

Use the ternary operator with `nothing` from lit-html:

```typescript
import { html, nothing } from 'lit-html';

this._renderTemplate(html`
  ${this.isVisible
    ? html`<div>Visible content</div>`
    : nothing}
`);
```

### Lists

Use the `repeat` directive for efficient list rendering:

```typescript
import { html } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';

this._renderTemplate(html`
  <ul>
    ${repeat(this.items, (item) => item.id, (item) => html`
      <li>${item.name}</li>
    `)}
  </ul>
`);
```

### Slots

Use native `<slot>` elements for content distribution:

```typescript
this._renderTemplate(html`
  <div class="card">
    <slot name="header"></slot>
    <slot></slot>
    <slot name="footer"></slot>
  </div>
`);
```

- Let the browser handle slot distribution natively by default.
- `slotchange` events and `slot.assignedNodes()` are acceptable when you need to react to slotted content changes (e.g., detecting which elements are slotted for layout logic).

---

## 4. Modern UI & UX Standards (Native-First)

- **Positioning:** Use `CSS Anchor Positioning` for tooltips, dropdowns, and context menus.
- **Overlays:** Use the `Popover API` for all top-layer elements (modals, menus, alerts).
- **Transitions:** Wrap all DOM mutations or state-based navigation in `document.startViewTransition()`.
- **Layout:** Prioritize `CSS Container Queries` over Media Queries for component-level responsiveness.
- **Styling:** Use native `CSS Nesting` and `CSS Variables` (--var). Avoid pre-processors (Sass/Less) unless explicitly requested.

---

## 5. Data & Performance

- **Persistence:** Use `IndexedDB` for local data caching and offline-first capabilities.
- **Concurrency:** Move heavy computations (parsing, complex filtering) to `Web Workers` to keep the Main Thread idle.
- **Real-time:** Favor `WebTransport` over WebSockets for low-latency bidirectional communication.

---

## 6. Code Quality & DX

- **TypeScript:** Strict typing is mandatory. Use `Interfaces` for data contracts and `Types` for unions/aliases.
- **Documentation:** Every component must include JSDoc explaining its `observedAttributes` and custom events.
- **Tree-shaking:** Write modular ES Modules (ESM). No CommonJS.

---

## 7. HARD CONSTRAINTS

- **NO Frameworks:** Do not suggest or install React, Vue, Svelte, or Angular.
- **NO Bloat:** Do not install NPM packages for features handled natively (e.g., no `lodash`, no `classnames`, no `framer-motion`).
- **NO Virtual DOM:** Work directly with the live DOM or Shadow DOM.
- **NO Global CSS:** Keep styles scoped within Web Components or use Tailwind utilities via `tailwindSheet`.

---

## 8. Gesture-First UX Architecture

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

---

## 9. Signal Initialization Pattern

When creating vanilla Web Components that extend `BaseElement` and use signals, follow this pattern to prevent premature rendering issues:

### The Problem

The `_trackSignal()` method subscribes to a signal, which immediately triggers a callback that calls `_requestRender()`. If this happens before all signals are initialized in `_setupProperties()`, `_render()` may try to access undefined signals.

### The Solution

`BaseElement` provides an `_initialized` flag that prevents rendering until initialization completes:

1. **In BaseElement constructor**: `_requestRender()` checks `this._initialized` and returns early if `false`. The constructor sets `this._initialized = true` **after** `_setupProperties()` returns, ensuring no premature renders.
2. **In Component**: Simply initialize and track your signals in `_setupProperties()`. The `_initialized` flag is managed by `BaseElement` automatically — you do NOT need to set it explicitly in most cases.

### Example

```typescript
import { html } from 'lit-html';

export class MyComponent extends BaseElement {
  declare private _count: Signal<number>;
  declare private _name: Signal<string>;

  protected _setupProperties(): void {
    // Initialize all signals first
    this._count = new Signal(0);
    this._name = new Signal('');

    // Track all signals — re-renders are deferred until _initialized = true
    // (set automatically by BaseElement constructor after this method returns)
    this._trackSignal(this._count);
    this._trackSignal(this._name);
  }

  protected _render(): void {
    // Safe to access signals — _render() won't be called until connectedCallback()
    // which runs after the constructor has set _initialized = true
    this._renderTemplate(html`
      <div class="count">${this._name.value}: ${this._count.value}</div>
    `);
  }
}
```

### Key Points

- Use `declare` for signal properties (e.g., `declare private _count: Signal<number>;`). This prevents TypeScript's `useDefineForClassFields` from emitting initialization code that would overwrite the signal instance created in `_setupProperties()` (see web-components-vanilla-ts skill §4.1).
- `BaseElement` sets `_initialized = true` automatically after `_setupProperties()` returns. Do NOT set it explicitly in your component.
- `_requestRender()` checks `_initialized` and defers all renders until it is `true`.
- `_render()` is called in `connectedCallback()` which runs after the constructor — signals are always ready.

---

## 10. Signal API Reference

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
import { html } from 'lit-html';

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

  protected _render(): void {
    this._renderTemplate(html`
      <button @click=${this._increment}>Count: ${this._count.value}</button>
    `);
  }
}
```

### Common Mistakes to Avoid

| Mistake | Error Message | Fix |
|---------|---------------|-----|
| `this._signal()` | "This expression is not callable" | Use `this._signal.value` |
| `this._signal.set(x)` | "Property 'set' does not exist" | Use `this._signal.value = x` |
