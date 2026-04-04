# Slots & Composition Patterns

## Named slots

```html
<!-- Template -->
<template>
  <header><slot name="header">Default header</slot></header>
  <main><slot></slot></main>
  <footer><slot name="footer"></slot></footer>
</template>

<!-- Usage -->
<my-card>
  <h2 slot="header">Title</h2>
  <p>Content goes in the default slot</p>
  <button slot="footer">OK</button>
</my-card>
```

## slotchange event

```ts
connectedCallback() {
  const slot = this.#shadow.querySelector('slot')!;
  slot.addEventListener('slotchange', () => {
    const nodes = slot.assignedElements({ flatten: true });
    this.#updateFromSlot(nodes);
  });
}
```

Use `assignedElements()` (not `assignedNodes()`) to skip text nodes.
Pass `{ flatten: true }` to resolve nested slot forwarding.

## ::slotted() limits

```css
/* ✅ Works — direct slotted children */
::slotted(li) { list-style: none; }

/* ❌ Does NOT work — descendants of slotted children */
::slotted(li span) { color: red; }
```

To style deep descendants of slotted content, the consumer must do it.
You can provide CSS custom properties as styling hooks instead.

## Slot forwarding (composition of components)

```html
<!-- my-dialog wraps my-panel and forwards its slots -->
<my-panel>
  <slot name="title" slot="header"></slot>
  <slot></slot>
</my-panel>
```

## Light DOM projection gotchas

- Slotted elements remain in the **light DOM** — they are styled by the consumer's stylesheet, not the shadow root
- Do not try to `appendChild` slotted elements — they will be removed from the slot
- `querySelector` inside `#shadow` will not find slotted elements; query from the host element directly

## Detecting empty slots (conditional rendering)

```ts
#slot: HTMLSlotElement;

connectedCallback() {
  this.#slot = this.#shadow.querySelector('slot[name="icon"]')!;
  this.#slot.addEventListener('slotchange', () => this.#syncIconVisibility());
  this.#syncIconVisibility();
}

#syncIconVisibility() {
  const hasIcon = this.#slot.assignedElements().length > 0;
  this.#shadow.querySelector('.icon-wrapper')!
    .toggleAttribute('hidden', !hasIcon);
}
```
