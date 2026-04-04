# Web Component Lifecycle — Deep Dive

## Callback execution order

```
1. constructor()              — Element created (or upgraded)
2. attributeChangedCallback() — If attributes exist in HTML before upgrade
3. connectedCallback()        — Element inserted into DOM
4. attributeChangedCallback() — For subsequent attribute mutations
5. disconnectedCallback()     — Element removed from DOM
6. adoptedCallback()          — Element moved to another document (rare)
```

## Upgrade timing gotcha

When the browser parses `<my-el data-x="1">` before the script defining `MyEl`
has loaded, the element exists as an HTMLElement stub. When the script loads,
`customElements.define` **upgrades** existing instances:

- `constructor()` is called
- Any attributes already on the element fire `attributeChangedCallback` immediately
- Then `connectedCallback` fires if the element is still in the DOM

**Consequence:** `attributeChangedCallback` may fire BEFORE `connectedCallback`.
Always guard internal state initialization:

```ts
#initialized = false;

connectedCallback() {
  if (!this.#initialized) {
    this.#init();
    this.#initialized = true;
  }
  this.#render();
}

attributeChangedCallback(...) {
  if (!this.#initialized) return; // safe to skip, connectedCallback will sync
  this.#render();
}
```

## `customElements.whenDefined()` pattern

```ts
// Wait for a specific element to be defined before interacting with it
await customElements.whenDefined('my-chart');
const chart = document.querySelector('my-chart') as MyChart;
chart.data = [...]; // now safe to call custom methods
```

## `customElements.upgrade()` for SSR/streaming

When HTML is injected dynamically (innerHTML, streaming SSR), elements are not
automatically upgraded until the next microtask. Force synchronous upgrade:

```ts
const wrapper = document.createElement('div');
wrapper.innerHTML = serverRenderedHTML;
customElements.upgrade(wrapper); // upgrades all custom elements inside
document.body.appendChild(wrapper);
```

## Avoiding double-initialization with `isConnected`

```ts
attributeChangedCallback(name, old, next) {
  if (old === next) return;           // no-op guard
  if (!this.isConnected) return;      // defer until connectedCallback
  this.#applyChange(name, next);
}
```

## `disconnectedCallback` — what to clean up

| Resource | Cleanup method |
|----------|---------------|
| `addEventListener` (document/window) | `removeEventListener` |
| `ResizeObserver` / `IntersectionObserver` / `MutationObserver` | `.disconnect()` |
| `setInterval` / `setTimeout` | `clearInterval` / `clearTimeout` |
| Abort controller for fetch | `controller.abort()` |
| Custom event subscriptions (e.g., a store) | call unsubscribe function |

Tip: use an `AbortController` and pass its `signal` to all listeners — one abort
cleans everything:

```ts
#ac: AbortController | null = null;

connectedCallback() {
  this.#ac = new AbortController();
  const { signal } = this.#ac;
  window.addEventListener('resize', this.#onResize, { signal });
  document.addEventListener('keydown', this.#onKey, { signal });
}

disconnectedCallback() {
  this.#ac?.abort();
  this.#ac = null;
}
```
