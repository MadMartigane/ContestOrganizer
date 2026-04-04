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
