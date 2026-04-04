# CSS Architecture in Shadow DOM — 2026

## Layer ordering inside shadow root

```css
/* Recommended layer order inside a component */
@layer reset, base, variants, states;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
}
@layer base {
  :host {
    display: block;
    /* expose tokens with fallbacks */
    color: var(--my-btn-color, inherit);
    background: var(--my-btn-bg, ButtonFace);
  }
}
@layer variants {
  :host([variant="primary"]) { background: var(--my-btn-primary-bg, #0070f3); }
}
@layer states {
  :host([disabled]) { opacity: 0.5; cursor: not-allowed; }
  :host(:focus-visible) { outline: 2px solid var(--my-btn-focus-ring, #0070f3); }
}
```

## @scope inside shadow DOM

`@scope` is fully supported inside shadow roots (no cross-shadow leakage):

```css
@scope (.card) to (.card-inner) {
  p { color: red; } /* only <p> inside .card but outside .card-inner */
}
```

## ::part() — theming API design

Expose parts deliberately. Every `part` name is a public API contract.

```html
<!-- In component template -->
<button part="trigger">
  <span part="label"><slot></slot></span>
  <span part="icon" aria-hidden="true">▸</span>
</button>
```

```css
/* Consumer styles */
my-accordion::part(trigger) {
  background: hotpink;
  font-weight: bold;
}
/* Compound parts — requires exportparts forwarding */
my-accordion::part(label) { font-size: 1.2rem; }
```

**Forwarding parts from inner components:**
```html
<!-- my-accordion exports its child my-button's parts -->
<my-button exportparts="trigger: btn-trigger, label: btn-label"></my-button>
```

## CSS Custom Properties — token design

Keep token names scoped to the component:

```css
:host {
  /* Layout */
  --_gap: var(--my-card-gap, 1rem);
  --_radius: var(--my-card-radius, 0.5rem);
  /* Color */
  --_bg: var(--my-card-bg, var(--color-surface, #fff));
  --_border: var(--my-card-border, 1px solid var(--color-border, #e2e8f0));
}
```

Convention: `--_name` = internal alias (not intended for consumers), `--component-name-token` = public API.

## Constructable Stylesheets for design tokens

Share a single stylesheet across all instances to avoid duplication:

```ts
// tokens.ts
export const tokenSheet = new CSSStyleSheet();
tokenSheet.replaceSync(`
  :host {
    --radius-sm: 4px;
    --radius-md: 8px;
  }
`);

// In component constructor:
this.#shadow.adoptedStyleSheets = [tokenSheet, componentSheet];
```

## What does NOT pierce the shadow boundary

- Global CSS classes (`.btn`, `.flex`, etc.) — shadow DOM ignores them
- CSS resets (normalize.css, preflight) — must be re-included or shared via adopted stylesheets
- Tailwind utilities — do not apply inside shadow roots (unless adoptedStyleSheets)

### Tailwind + Shadow DOM workaround

```ts
// Get Tailwind's generated sheet from the main document
const twSheet = [...document.styleSheets].find(s =>
  s.href?.includes('tailwind') || /* detect by content */
  [...(s.cssRules ?? [])].some(r => r.cssText.includes('--tw'))
);
if (twSheet) {
  // Can't directly adopt cross-origin sheets — must clone or use constructable
}
// Recommended: use CSS custom properties as bridge between Tailwind and shadow DOM
```

Best practice: design tokens live in `:root`, web components consume via `var(--token)`.
