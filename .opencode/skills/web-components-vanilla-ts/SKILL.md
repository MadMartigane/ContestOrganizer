---
name: web-components-vanilla-ts
description: >
  Best practices, modern APIs, and common pitfalls for creating Web Components
  in vanilla TypeScript in 2026. Use this skill whenever the user asks to build,
  debug, or review a Web Component, Custom Element, Shadow DOM, or anything
  involving customElements.define(), HTMLElement subclasses, slots, parts,
  template instantiation, or the declarative shadow DOM. Also trigger for
  questions about interoperability with frameworks (React, Vue, Angular) and
  for performance or accessibility questions specifically about Web Components.
  Always use this skill before generating any Web Component code — it prevents
  a large class of common errors.
---

# Web Components in Vanilla TypeScript — 2026 Best Practices

> Before writing any code, read this skill. It prevents the most frequent class of bugs.
> For deep dives on a specific topic, see `references/` below.

---

## 1. Architecture Snapshot (2026 standards)

| API | Status | Notes |
|-----|--------|-------|
| Custom Elements v1 | ✅ Baseline | Universally supported |
| Shadow DOM v1 | ✅ Baseline | Use `attachShadow({mode:'open'})` by default |
| HTML Templates | ✅ Baseline | Prefer `<template>` + `cloneNode` over innerHTML in constructor |
| Declarative Shadow DOM (DSD) | ✅ Baseline | `<template shadowrootmode="open">` — critical for SSR |
| Custom State Pseudo-class | ✅ Baseline | `ElementInternals.states` — replaces attribute hacks |
| Form-Associated Custom Elements (FACE) | ✅ Baseline | Use `ElementInternals` for form integration |
| CSS `@layer` + `@scope` in Shadow DOM | ✅ Baseline | Full scoping support inside shadow roots |
| `::part()` / `::slotted()` | ✅ Baseline | Primary theming API |
| Template Instantiation API | 🧪 Origin Trial | Not yet production-safe; use cloneNode instead |
| Constructable Stylesheets (`CSSStyleSheet()`) | ✅ Baseline | Preferred for shared/dynamic styles |
| `customElements.upgrade()` | ✅ | Use in SSR hydration flows |
| `ElementInternals.ariaRole` etc. | ✅ Baseline | Use for a11y — do not use bare `aria-*` attrs on host |

---

## 2. TypeScript Setup

```ts
// tsconfig.json — minimum required
{
  "compilerOptions": {
    "target": "ES2022",        // class static blocks, top-level await
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "useDefineForClassFields": true,  // CRITICAL — see pitfalls §4
    "strict": true
  }
}
```

**Register with types:**
```ts
declare global {
  interface HTMLElementTagNameMap {
    'my-button': MyButton;
  }
}
```

---

## 3. Component Skeleton (canonical 2026 pattern)

```ts
const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: block; }
    :host([hidden]) { display: none !important; }
  </style>
  <slot></slot>
`;

export class MyButton extends HTMLElement {
  static formAssociated = true; // if needed
  static observedAttributes = ['disabled', 'label'] as const;

  #internals: ElementInternals;
  #shadow: ShadowRoot;

  // Reflect observed attributes as properties
  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(val: boolean) { this.toggleAttribute('disabled', val); }

  constructor() {
    super();
    // ❌ Never access DOM or attributes here — element is not yet connected
    this.#internals = this.attachInternals();
    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    // ✅ Safe to read/write attributes and children here
    this.#upgrade();
  }

  disconnectedCallback() {
    // Clean up listeners, observers, timers
  }

  adoptedCallback() {
    // Rare: element moved to another document
  }

  attributeChangedCallback(
    name: (typeof MyButton.observedAttributes)[number],
    _old: string | null,
    next: string | null
  ) {
    // Called before connectedCallback on upgrade — guard accordingly
    if (!this.isConnected) return;
    this.#upgrade();
  }

  #upgrade() {
    // Sync internal state from attributes
    this.#internals.ariaDisabled = this.disabled ? 'true' : null;
  }
}

customElements.define('my-button', MyButton);
```

---

## 4. The Top Pitfalls

### 4.1 `useDefineForClassFields` breaks property interception
With TS `useDefineForClassFields: true` (default in ES2022 target), class fields
are defined with `Object.defineProperty` *after* `super()`, which **overwrites
accessor descriptors** set up by a base class.

```ts
// ❌ BROKEN — 'value' field nukes the getter/setter from a mixin
class MyInput extends HTMLElement {
  value = '';           // This resets any accessor defined in a superclass
}

// ✅ FIXED — use declare, initialize in connectedCallback
class MyInput extends HTMLElement {
  declare value: string;
  connectedCallback() { this.value ??= ''; }
}
// OR use private backing field + explicit accessor
class MyInput extends HTMLElement {
  #value = '';
  get value() { return this.#value; }
  set value(v: string) { this.#value = v; }
}
```

### 4.2 Attributes in constructor
The constructor runs during `customElements.define` upgrades. Attributes and
children are **not yet available**.

```ts
// ❌
constructor() {
  super();
  this.setAttribute('role', 'button'); // may throw in some parsers
  console.log(this.children);          // always empty
}
// ✅ Use connectedCallback
```

### 4.3 Memory leaks — listeners not removed
```ts
// ❌ — closure keeps reference alive
connectedCallback() {
  document.addEventListener('keydown', (e) => this.#handleKey(e));
}

// ✅ — bound ref stored, removed on disconnect
#handleKey = (e: KeyboardEvent) => { /* ... */ };

connectedCallback() {
  document.addEventListener('keydown', this.#handleKey);
}
disconnectedCallback() {
  document.removeEventListener('keydown', this.#handleKey);
}
```

### 4.4 Using `innerHTML` in constructor for templates
Parsing HTML on every instantiation is slow. Clone a shared `<template>` instead:
```ts
// ❌ Per-instance HTML parsing
constructor() { this.#shadow.innerHTML = '<div>...</div>'; }

// ✅ Parse once, clone many
const tpl = document.createElement('template');
tpl.innerHTML = '<div>...</div>';
// In constructor:
this.#shadow.appendChild(tpl.content.cloneNode(true));
```

### 4.5 Forgetting `:host([hidden]) { display: none !important; }`
Custom elements default to `display: inline`. Always set `:host { display: block }` (or
`inline-block`, `contents`…) and override for `[hidden]`.

### 4.6 Leaking styles via `::slotted` misunderstanding
`::slotted()` only matches **direct** slotted children — not their descendants.
Deep theming must use CSS custom properties or `::part()`.

### 4.7 Not using `ElementInternals` for ARIA
Setting `aria-*` attributes on the host element can be overridden by consumers.
Use `ElementInternals.ariaRole`, `ariaLabel`, etc. — they set the *default*
accessibility semantics, overridable by the user but not silently clobbered.

### 4.8 Event retargeting in Shadow DOM
Events fired from inside a shadow root have their `target` **retargeted** to the
host element when they cross the shadow boundary. Use `event.composedPath()` to
get the real target.

```ts
// If you need the original target from outside:
element.addEventListener('click', (e) => {
  const innerTarget = e.composedPath()[0]; // real origin
});
```
Set `{ bubbles: true, composed: true }` only if you intentionally want the event
to escape the shadow root.

### 4.9 Forgetting `customElements.whenDefined()` in consumers
Consumers rendering web components before the script loads will get an
HTMLElement stub. Always `await customElements.whenDefined('my-el')` before
querying its custom properties/methods.

### 4.10 SSR: missing Declarative Shadow DOM
If the component is server-rendered, use DSD so the shadow root is available
before JS hydrates. Without it, users see a flash of unstyled content (FOUC).

```html
<my-card>
  <template shadowrootmode="open">
    <style>:host { display: block }</style>
    <slot></slot>
  </template>
</my-card>
```

---

## 5. Constructable Stylesheets (shared / dynamic styles)

```ts
const sheet = new CSSStyleSheet();
sheet.replaceSync(':host { color: red }');

// In constructor:
this.#shadow.adoptedStyleSheets = [sheet];

// Dynamic update (efficient — no re-parse):
await sheet.replace(':host { color: blue }');
```
Prefer this over `<style>` tags when the same styles are shared across many
instances or need runtime updates.

---

## 6. Form-Associated Custom Elements

```ts
class MyInput extends HTMLElement {
  static formAssociated = true;
  #internals = this.attachInternals(); // call before attachShadow

  get form()  { return this.#internals.form; }
  get name()  { return this.getAttribute('name') ?? ''; }
  get type()  { return 'my-input'; }
  get validity() { return this.#internals.validity; }

  #setValue(v: string) {
    this.#internals.setFormValue(v);
    // Optionally set validity:
    if (!v) {
      this.#internals.setValidity({ valueMissing: true }, 'Required', this.#inputEl);
    } else {
      this.#internals.setValidity({});
    }
  }
}
```

---

## 7. Theming API: `::part()` vs CSS Custom Properties

| Mechanism | Use for |
|-----------|---------|
| `::part(name)` | External full style override of a named element |
| `var(--token)` | Constrained theming (colors, spacing, font-size) |
| `::slotted(el)` | Styling **direct** slotted children from outside |
| `@layer` inside shadow | Layering internal styles with correct specificity |

Always expose a documented set of `--custom-property` tokens and `part` names.
Never rely on `:host-context()` — it's deprecated.

---

## 8. Accessibility Checklist

- [ ] `#internals.role` set to appropriate ARIA role
- [ ] Keyboard navigation handled (`keydown` on host or internal focusable)
- [ ] `:focus-visible` styled inside shadow root
- [ ] `tabindex` managed if custom focusability needed
- [ ] `aria-live` regions for dynamic content updates
- [ ] `ElementInternals.ariaLabel/ariaDescribedBy` set when no visible label exists

---

## 9. Framework Interop Quick Notes

**React 19+:** Native custom element support — props passed as properties, not just attributes. Use `ref` for imperative API. No wrapper needed.

**Vue 3:** `<my-el :value="x" />` passes as property if `value` is not in `observedAttributes`. Use `.prop` modifier or `defineCustomElement` wrapper.

**Angular:** Enable `CUSTOM_ELEMENTS_SCHEMA` or use `@angular/elements`.

**Lit (as reference):** If complexity grows beyond ~150 lines per component, consider Lit — it compiles to the same standard APIs but eliminates all boilerplate above. Not a requirement, but a pragmatic choice.

---

## 10. References

For deeper dives, read these as needed:

| File | When to read |
|------|-------------|
| `references/lifecycle.md` | Complex lifecycle sequencing, upgrade timing, adoptedCallback |
| `references/slots-and-composition.md` | Named slots, slotchange events, light DOM projection patterns |
| `references/css-architecture.md` | `@scope`, `@layer`, part/token design system patterns |
| `references/ssr-hydration.md` | DSD, `customElements.upgrade()`, streaming HTML |
| `references/testing.md` | Unit testing with Web Test Runner, JSDOM limitations |
| `references/project-patterns.md` | lit-html, BaseElement, Signals, Tailwind in Shadow DOM |

---

## 11. Project Integration: lit-html, BaseElement & Signals

> This section covers project-specific patterns that build on the generic Web Component
> standards in §1–§10. These patterns apply when the project uses `BaseElement`, `lit-html`,
> and a custom `Signal` implementation.

### 11.1 lit-html as Rendering Engine

Instead of raw `<template>` + `cloneNode` (§3), this project uses **lit-html** for
declarative templating with efficient DOM diffing.

```ts
import { html, nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';

// Inside _render():
this._renderTemplate(html`
  <div class="card">
    <h2>${this._title.value}</h2>
    ${this._items.value.length
      ? repeat(
          this._items.value,
          (item) => item.id,
          (item) => html`<div class="item">${item.name}</div>`
        )
      : nothing}
  </div>
`);
```

**Binding syntax:**

| Prefix | Purpose | Example |
|--------|---------|---------|
| `@` | Event listener | `@click=${this._handleClick}` |
| `.` | Property binding | `.value=${this._inputVal}` |
| `?` | Boolean attribute | `?disabled=${this._isDisabled}` |
| `${}` | Text interpolation / child | `${this._label.value}` |

**Conditionals:** Use `${condition ? html\`...\` : nothing}`. Import `nothing` from `lit-html`.

**Lists:** Use `repeat(items, keyFn, templateFn)` for keyed list rendering. Falls back to
array `.map()` for simple static lists.

**Slots:** Use native `<slot>` and `<slot name="...">`. Slot distribution is handled by the browser.

---

### 11.2 BaseElement Abstract Class

All components extend `BaseElement` (from `src/core/base-element.ts`) instead of raw
`HTMLElement`. It provides:

- Shadow DOM creation via `_createRenderRoot()`
- lit-html rendering via `_renderTemplate(template)`
- Signal reactivity via `_trackSignal(signal)`
- Custom event dispatch via `_emit(name, detail)`
- Render batching via `_requestRender()`

**Lifecycle:**

```
constructor() → _setupProperties() [abstract] → _initialized = true
connectedCallback() → _createRenderRoot() → _injectStyles() → _render()
attributeChangedCallback() → _onAttributeChange() → _requestRender()
disconnectedCallback() → _cleanupSignals()
```

**Minimal component:**

```ts
import { BaseElement, html } from '../../core/base-element.js';

export class MyCard extends BaseElement {
  static observedAttributes = ['title'] as const;

  protected _setupProperties(): void {
    // Initialize signals, properties, etc.
  }

  protected _render(): void {
    this._renderTemplate(html`
      <div class="card">
        <slot></slot>
      </div>
    `);
  }
}
```

**Rules:**

- **DO NOT** override `_createRenderRoot()`. Use `_injectStyles(...sheets)` to add
  component-specific constructable stylesheets.
- **DO NOT** override `connectedCallback()` without calling `super.connectedCallback()`.
- `_setupProperties()` is called in the constructor — do NOT access DOM or attributes there.
- `_render()` is called in `connectedCallback()` — safe to access attributes and DOM.

---

### 11.3 Signal-Based Reactivity

The project uses a custom `Signal<T>` class (from `src/core/signal.ts`) for fine-grained
reactive state.

```ts
import { Signal } from '../../core/signal.js';

declare private _count: Signal<number>; // 'declare' prevents useDefineForClassFields overwrite (§4.1)

protected _setupProperties(): void {
  this._count = new Signal(0);
  this._trackSignal(this._count); // Auto re-renders on change
}
```

**API:**

- Read: `signal.value` (getter)
- Write: `signal.value = newValue` (setter, uses `Object.is` comparison)
- Track: `this._trackSignal(signal)` — subscribes and triggers `_requestRender()` on change

**`_trackSignal()` details:**

- Calls `signal.subscribe()`, which fires the callback **immediately** with current value.
- The callback calls `_requestRender()`, which is gated by `this._initialized`.
- `BaseElement` sets `_initialized = true` **after** `_setupProperties()` returns, so premature
  renders during initialization are prevented automatically.

**Pattern — components WITHOUT signals:**

```ts
protected _setupProperties(): void {
  // No signals to track — nothing needed here
  // _initialized is set by BaseElement constructor automatically
}
```

**Pattern — components WITH signals:**

```ts
declare private _name: Signal<string>;
declare private _items: Signal<Item[]>;

protected _setupProperties(): void {
  this._name = new Signal('');
  this._items = new Signal([]);
  this._trackSignal(this._name);
  this._trackSignal(this._items);
  // _initialized is set by BaseElement constructor automatically after this returns
}
```

---

### 11.4 Tailwind CSS v4 in Shadow DOM

Global Tailwind styles do not penetrate Shadow DOM. `BaseElement` solves this by:

1. **`tailwindSheet`** — A constructable stylesheet containing ~190 Tailwind utility classes
   (layout, spacing, typography, colors, effects). Auto-injected into every Shadow Root via
   `adoptedStyleSheets`.

2. **`baseSheet`** — Provides CSS reset, `:host { display: block }`, `:host([hidden])`,
   and dark mode CSS variables.

3. **`createComponentSheet(css)`** — Utility to create component-specific constructable
   stylesheets (from `src/core/styles.ts`).

**Adding component-specific styles:**

```ts
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

Prefer constructable stylesheets (`_injectStyles`) over `<style>` tags in lit-html templates
for any styles used across instances. Use `<style>` in templates only for truly
instance-specific dynamic styles.

---

### 11.5 CSS in Shadow DOM — Project Conventions

**:host selector** — Recommended and canonical (per §3, §4.5, §5). Use it to set `display`,
padding, and other host-level styles. `baseSheet` already provides `:host { display: block }`
and `:host([hidden]) { display: none !important; }`.

**CSS Nesting** — Fully supported in Shadow DOM. Use native CSS nesting for component styles:

```css
.card {
  padding: 1rem;
  & .title {
    font-weight: bold;
  }
  &:hover {
    background: var(--color-surface-hover);
  }
}
```

**Pre-built sheets** (from `src/core/styles.ts`):

- `baseSheet` — Reset, `:host` defaults, dark mode variables
- `inlineBlockSheet` — `:host { display: inline-block }` for icon/badge/spinner/tooltip
- `spinnerSheet` — Inline-block + spin animation
- `tailwindSheet` — ~190 Tailwind utility classes

**addEventListener exception:** For elements outside the lit-html template (e.g., `document`,
`window`, `renderRoot` for `slotchange`), manual `addEventListener` is acceptable with proper
cleanup per §4.3:

```ts
#handleKeyDown = (e: KeyboardEvent) => { /* ... */ };

connectedCallback() {
  super.connectedCallback();
  document.addEventListener('keydown', this.#handleKeyDown);
}
disconnectedCallback() {
  document.removeEventListener('keydown', this.#handleKeyDown);
  super.disconnectedCallback();
}
```
