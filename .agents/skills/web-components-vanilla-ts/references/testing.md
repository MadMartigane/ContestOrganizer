# Testing Web Components

## Tool recommendations (2026)

| Tool | Use |
|------|-----|
| **Web Test Runner** (@web/test-runner) | Primary — runs tests in real browsers via Playwright/Puppeteer |
| **@open-wc/testing** | Assertion helpers, `fixture()`, `html` template tag |
| **Vitest + happy-dom** | Fast unit tests, but Shadow DOM support is incomplete — use for logic only |
| **Playwright** | E2E and visual regression |

## Basic test with @open-wc/testing

```ts
import { fixture, html, expect } from '@open-wc/testing';
import './my-button.js';

describe('my-button', () => {
  it('renders with default slot', async () => {
    const el = await fixture<MyButton>(html`
      <my-button>Click me</my-button>
    `);
    expect(el.shadowRoot).to.exist;
    expect(el.textContent?.trim()).to.equal('Click me');
  });

  it('reflects disabled attribute', async () => {
    const el = await fixture<MyButton>(html`<my-button disabled></my-button>`);
    expect(el.disabled).to.be.true;
    expect(el).to.have.attribute('disabled');
  });

  it('dispatches a click event', async () => {
    const el = await fixture<MyButton>(html`<my-button>OK</my-button>`);
    let fired = false;
    el.addEventListener('click', () => (fired = true));
    el.click();
    expect(fired).to.be.true;
  });
});
```

## JSDOM limitations — do NOT rely on it for:

- `attachShadow` — shadow DOM support is incomplete
- `ElementInternals` — FACE / ARIA internals not fully implemented
- `CSSStyleSheet.replace()` — constructable stylesheets limited
- `ResizeObserver` / `IntersectionObserver` — need polyfills or mocks

Use Web Test Runner with a real browser for anything touching shadow DOM.

## Testing `::part()` styles

Computed styles applied via `::part()` are accessible from outside:

```ts
const part = el.shadowRoot!.querySelector('[part="trigger"]') as HTMLElement;
const styles = getComputedStyle(part);
expect(styles.backgroundColor).to.equal('rgb(0, 112, 243)');
```

## Testing form association (FACE)

```ts
it('submits value with form', async () => {
  const form = await fixture<HTMLFormElement>(html`
    <form>
      <my-input name="email" value="test@example.com"></my-input>
    </form>
  `);
  const data = new FormData(form);
  expect(data.get('email')).to.equal('test@example.com');
});
```

## Accessibility testing

```ts
import { isAccessible } from '@open-wc/testing';

it('is accessible', async () => {
  const el = await fixture(html`<my-button>Submit</my-button>`);
  await expect(el).to.be.accessible(); // runs axe-core
});
```
