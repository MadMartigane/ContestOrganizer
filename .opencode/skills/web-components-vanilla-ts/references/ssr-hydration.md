# SSR & Hydration for Web Components

## Declarative Shadow DOM (DSD)

DSD lets the browser parse a shadow root from static HTML — no JS needed for
initial render. Essential for SSR to avoid FOUC.

```html
<my-card>
  <template shadowrootmode="open">
    <style>
      :host { display: block; padding: 1rem; }
    </style>
    <slot></slot>
  </template>
  <p>Light DOM content</p>
</my-card>
```

When JS loads and `customElements.define('my-card', MyCard)` runs, the browser
**upgrades** the element without recreating the shadow root.

### DSD modes

| Attribute | Effect |
|-----------|--------|
| `shadowrootmode="open"` | `element.shadowRoot` accessible from JS |
| `shadowrootmode="closed"` | shadow root inaccessible externally |
| `shadowrootdelegatesfocus` | delegates focus to first focusable inside |
| `shadowrootclonable` | shadow root is cloned with `cloneNode(true)` |
| `shadowrootserializable` | shadow root included in `getHTML({ serializableShadowRoots: true })` |

## `getHTML()` — serializing shadow DOM (2025+)

```ts
// Serialize an element's full shadow DOM tree (e.g., for SSR output)
const html = document.body.getHTML({ serializableShadowRoots: true });
// Returns a string including <template shadowrootmode> for all serializable roots
```

Mark a shadow root serializable at attach time:
```ts
this.attachShadow({ mode: 'open', serializable: true });
```

## Upgrade safety pattern

When injecting SSR HTML via `innerHTML` or streaming:

```ts
async function injectAndUpgrade(html: string, container: Element) {
  container.innerHTML = html;
  // Wait for all custom element definitions used in the HTML
  await Promise.all(
    [...container.querySelectorAll(':not(:defined)')]
      .map(el => customElements.whenDefined(el.localName))
  );
  customElements.upgrade(container);
}
```

## Preventing double-shadow-root errors

If your constructor calls `attachShadow` but a DSD shadow root already exists,
the browser **reuses** the existing root (no error). But if you then call
`innerHTML = ...` on it, you'll wipe the server-rendered content.

```ts
constructor() {
  super();
  // Only create shadow root if DSD hasn't already provided one
  if (!this.shadowRoot) {
    this.attachShadow({ mode: 'open' });
    this.#shadow.appendChild(template.content.cloneNode(true));
  } else {
    // Reuse DSD-provided shadow root — just wire up refs
  }
  this.#shadow = this.shadowRoot!;
}
```

## Streaming HTML considerations

With HTTP streaming (e.g., ReadableStream to the browser), elements may be
partially parsed. Ensure components are resilient to `connectedCallback` firing
before all children are present — use `slotchange` rather than querying light DOM
children in `connectedCallback`.
