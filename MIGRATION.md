# Migration Guide: Stencil to Vanilla Web Components

This guide provides comprehensive instructions for migrating Stencil components to native Web Components using our BaseElement pattern.

## Prerequisites

Before starting any migration work, you **MUST** load the `stencil-migration` skill:

```
/load-skill stencil-migration
```

This skill contains critical patterns and traps to avoid during migration, including:
- **Trap 1**: Property vs Attribute (Object Props) - How to pass complex objects to Stencil children
- **Trap 2**: Promise vs String (Async Props) - Handling async data correctly
- **Trap 3**: Boolean Attribute Coercion - Why `reverse="true"` doesn't work as expected
- **Trap 4**: Number Attribute Parsing - String vs number types in HTML attributes
- **Two-Pass Rendering Pattern** - The correct way to render vanilla parents with Stencil children
- **Type-Safe Best Practices** - Defining interfaces for type-safe property assignment

**Failure to follow these patterns will result in silent failures where components don't display correctly.**

## Overview

### Philosophy: "Touch it, modernize it"

When working with legacy Stencil components, our approach is clear: if you need to modify a component, migrate it to vanilla Web Components. This ensures consistency across the codebase and leverages modern web platform features.

### Benefits of the Vanilla Approach

- **Smaller bundle size**: No framework overhead or compiler runtime
- **Faster load times**: Native browser support for Web Components
- **Better performance**: Direct DOM manipulation without reconciliation
- **Simpler debugging**: Standard browser dev tools work out of the box
- **Future-proof**: Built on web standards that will continue to evolve

### Coexistence Strategy

Stencil and vanilla components can coexist during migration. The build system handles both. However, all new components should be written in vanilla style, and existing components should be migrated when touched.

## Quick Reference Table

| Stencil | Vanilla Web Components |
|---------|----------------------|
| `@Component({ tag: 'my-component' })` | `customElements.define('my-component', MyComponent)` |
| `@Prop() myProp: string` | `observedAttributes` + getter/setter |
| `@State() myState: string` | Signal |
| `@Event() myEvent: EventEmitter` | `_emit()` method |
| `render()` | `_render()` method |
| `componentDidLoad()` | `connectedCallback()` |
| `componentDidUpdate()` | `_requestRender()` microtask |
| `componentWillUnload()` | `disconnectedCallback()` |
| JSX | Template strings |
| `@Element()` | `this` (extends HTMLElement) |
| `@Listen('event')` | `addEventListener()` in `_setupEvents()` |
| `@Method()` | Public methods |

## Step-by-Step Migration Guide

### Step 1: Create .ts File (Delete .tsx)

Remove the `.tsx` extension and convert to `.ts`. Rename:

```
src/components/my-component/my-component.tsx → src/components/my-component/my-component.ts
```

Delete the original `.tsx` file after creating the new `.ts` file.

### Step 2: Import BaseElement

Import the BaseElement class from our core library:

```typescript
import { BaseElement } from "@core/base-element.js";
```

### Step 3: Extend BaseElement

Change your class to extend `BaseElement` instead of using Stencil decorators:

```typescript
// Before (Stencil)
@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true,
})
export class MyComponent implements ComponentInterface {
  // ...
}

// After (Vanilla)
export class MyComponent extends BaseElement {
  // ...
}
```

### Step 4: Define observedAttributes

For any property that corresponds to an HTML attribute, define `observedAttributes`:

```typescript
export class MyComponent extends BaseElement {
  static get observedAttributes() {
    return ['my-prop', 'another-prop'];
  }
}
```

### Step 5: Setup Properties

Implement property handling with private backing fields and getters/setters:

```typescript
export class MyComponent extends BaseElement {
  private _myProp = '';
  private _anotherProp = '';

  protected _setupProperties(): void {
    // Initialize properties from attributes if needed
    this._myProp = this.getAttribute('my-prop') || '';
    this._anotherProp = this.getAttribute('another-prop') || '';
  }

  protected _onAttributeChange(name: string, value: string | null): void {
    switch (name) {
      case 'my-prop':
        this._myProp = value || '';
        this._requestRender();
        break;
      case 'another-prop':
        this._anotherProp = value || '';
        this._requestRender();
        break;
    }
  }

  get myProp(): string {
    return this._myProp;
  }

  set myProp(value: string) {
    this.setAttribute('my-prop', value);
  }
}
```

### Step 6: Implement _render()

Replace the JSX `render()` method with `_render()` using template strings:

```typescript
// Before (Stencil JSX)
render() {
  return (
    <div class="container">
      <h1>{this.myProp}</h1>
      <button onClick={() => this.handleClick()}>Click me</button>
    </div>
  );
}

// After (Vanilla template strings)
protected _render(): void {
  this.innerHTML = `
    <div class="container">
      <h1>${this._myProp}</h1>
      <button class="btn">Click me</button>
    </div>
  `;
}
```

### Step 7: Register Component

Register your component at the end of the file:

```typescript
export class MyComponent extends BaseElement {
  // ... component implementation
}

customElements.define('my-component', MyComponent);
```

### Step 8: Setup Events

Implement event listeners in `_setupEvents()` and clean up in `_teardownEvents()`:

```typescript
export class MyComponent extends BaseElement {
  private _button?: HTMLButtonElement;

  protected _setupEvents(): void {
    this._button = this.shadowRoot?.querySelector('.btn');
    this._button?.addEventListener('click', this._handleClick);
  }

  protected _teardownEvents(): void {
    this._button?.removeEventListener('click', this._handleClick);
  }

  private _handleClick = (): void => {
    console.log('Button clicked');
    this._emit('my-event', { detail: 'some data' });
  };
}
```

### Lifecycle Method Mapping

| Stencil Lifecycle | Vanilla Equivalent | Notes |
|-------------------|---------------------|-------|
| `componentWillLoad()` | Override `_setupProperties()` | Called once when element is first connected |
| `componentDidLoad()` | `connectedCallback()` | Called after first render |
| `componentWillUpdate()` | `_onAttributeChange()` | Called before re-render when attributes change |
| `componentDidUpdate()` | `_requestRender()` handles internally | Called after render |
| `componentWillUnload()` | `disconnectedCallback()` | Called when element is removed |

## Common Patterns

### Light DOM vs Shadow DOM

**Use Shadow DOM when:**
- The component is self-contained and has isolated styles
- You want to prevent external CSS from affecting internal elements
- The component is a reusable UI primitive (buttons, inputs)

**Use Light DOM when:**
- The component needs to integrate with external styles
- You're building a page-level component
- The component uses Shoelace components (they require Light DOM)

### Handling Shoelace Components

When using Shoelace components, always use Light DOM:

```typescript
export class ErrorMessage extends BaseElement {
  protected _createRenderRoot(): Element | ShadowRoot {
    return this; // Light DOM - no shadow root
  }
}
```

Shoelace components won't work properly inside Shadow DOM because they expect to be in the document's main DOM tree.

### Timer Cleanup

Always clear timers in `disconnectedCallback()`:

```typescript
export class MyComponent extends BaseElement {
  private _timerId?: number;

  protected _setupProperties(): void {
    this._timerId = window.setInterval(() => {
      this._doSomething();
    }, 1000);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._timerId) {
      clearInterval(this._timerId);
      this._timerId = undefined;
    }
  }
}
```

### DOM References

Query DOM elements after render in `connectedCallback()`:

```typescript
export class MyComponent extends BaseElement {
  private _container?: HTMLDivElement;

  connectedCallback(): void {
    super.connectedCallback();
    this._container = this.shadowRoot?.querySelector('.container');
  }

  protected _render(): void {
    this.innerHTML = `
      <div class="container">Content</div>
    `;
  }
}
```

Note: If you need to query after every render, do it in `_setupEvents()` which is called after each render.

### Handling State with Signals

For reactive state, use the Signal pattern:

```typescript
import { signal } from "@core/signals.js";

export class Counter extends BaseElement {
  private _count!: ReturnType<typeof signal<number>>;

  protected _setupProperties(): void {
    this._count = signal(0);
  }

  protected _render(): void {
    this.innerHTML = `
      <div>Count: ${this._count()}</div>
      <button class="increment">+</button>
    `;
  }

  protected _setupEvents(): void {
    const button = this.shadowRoot?.querySelector('.increment');
    button?.addEventListener('click', () => {
      this._count.set(this._count() + 1);
      this._requestRender();
    });
  }
}
```

### Correct Signal Initialization Pattern (Important)

⚠️ **Critical**: Do NOT use field initializers for Signals in vanilla BaseElement components. This causes JavaScript class initialization order issues.

#### Why Field Initializers Fail

When you declare a Signal as a class field initializer:

```typescript
// ❌ WRONG - will cause issues
private _count = signal(0);
```

JavaScript executes field initializers **before** the `super()` call in the constructor. Since `BaseElement` (which extends `HTMLElement`) must call `super()` first, any initialization that depends on the element being fully constructed will fail or behave unexpectedly.

#### The Correct Pattern

Declare Signals with the non-null assertion operator (`!`) and initialize them in `_setupProperties()`:

```typescript
// ✅ CORRECT - proper initialization order
export class Counter extends BaseElement {
  // Declare without initialization, using ! to assert it will be assigned
  private _count!: ReturnType<typeof signal<number>>;

  protected _setupProperties(): void {
    // Initialize after super() has completed
    this._count = signal(0);
  }

  protected _render(): void {
    this.innerHTML = `
      <div>Count: ${this._count()}</div>
      <button class="increment">+</button>
    `;
  }

  protected _setupEvents(): void {
    const button = this.shadowRoot?.querySelector('.increment');
    button?.addEventListener('click', () => {
      this._count.set(this._count() + 1);
      this._requestRender();
    });
  }
}
```

#### SelectTeam Example

A more complete example showing multiple Signals:

```typescript
import { signal } from "@core/signals.js";

export class SelectTeam extends BaseElement {
  // Declare all signals with !, initialize in _setupProperties()
  private _teams!: ReturnType<typeof signal<Team[]>>;
  private _selectedTeamId!: ReturnType<typeof signal<string | null>>;
  private _isLoading!: ReturnType<typeof signal<boolean>>;

  protected _setupProperties(): void {
    this._teams = signal([]);
    this._selectedTeamId = signal(null);
    this._isLoading = signal(true);

    // Fetch teams after signals are initialized
    this._fetchTeams();
  }

  private async _fetchTeams(): Promise<void> {
    try {
      const teams = await fetch('/api/teams').then(r => r.json());
      this._teams.set(teams);
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      this._isLoading.set(false);
      this._requestRender();
    }
  }

  protected _render(): void {
    this.innerHTML = `
      <div class="select-team">
        ${this._isLoading() ? '<p>Loading...</p>' : this._renderTeamList()}
      </div>
    `;
  }

  private _renderTeamList(): string {
    return this._teams().map(team => `
      <button
        class="team-btn ${this._selectedTeamId() === team.id ? 'selected' : ''}"
        data-team-id="${team.id}"
      >
        ${team.name}
      </button>
    `).join('');
  }

  protected _setupEvents(): void {
    const teamButtons = this.shadowRoot?.querySelectorAll('.team-btn');
    teamButtons?.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const teamId = target.dataset.teamId;
        if (teamId) {
          this._selectedTeamId.set(teamId);
          this._emit('team-selected', { detail: { teamId } });
          this._requestRender();
        }
      });
    });
  }
}
```

#### Key Takeaways

1. **Always use `!` for Signal declarations** - This tells TypeScript the property will be assigned before use
2. **Initialize in `_setupProperties()`** - This runs after `super()` completes, ensuring proper initialization order
3. **Use `ReturnType<typeof signal<T>>`** - This provides proper typing for the Signal

## Examples

### Simple Component: page-404

A basic page component without complex state:

```typescript
// page-404.ts
import { BaseElement } from "@core/base-element.js";

export class Page404 extends BaseElement {
  protected _render(): void {
    this.innerHTML = `
      <div class="page-404">
        <h1>404</h1>
        <p>Page not found</p>
        <a href="/" class="btn">Go Home</a>
      </div>
    `;
  }
}

customElements.define('page-404', Page404);
```

### Component with State: page-home

A component using signals for reactive state:

```typescript
// page-home.ts
import { BaseElement } from "@core/base-element.js";
import { signal } from "@core/signals.js";

export class PageHome extends BaseElement {
  private _userName!: ReturnType<typeof signal<string | null>>;

  protected _setupProperties(): void {
    this._userName = signal<string | null>(null);

    // Simulate fetching user data
    setTimeout(() => {
      this._userName.set('John');
      this._requestRender();
    }, 100);
  }

  protected _render(): void {
    this.innerHTML = `
      <div class="home">
        <h1>Welcome${this._userName() ? `, ${this._userName()}` : ''}!</h1>
        <p>Start your contest journey today.</p>
      </div>
    `;
  }
}

customElements.define('page-home', PageHome);
```

### Component with Props: error-message

A component that accepts attributes and emits events:

```typescript
// error-message.ts
import { BaseElement } from "@core/base-element.js";

export class ErrorMessage extends BaseElement {
  private _message = '';
  private _type = 'error';

  static get observedAttributes() {
    return ['message', 'type'];
  }

  protected _setupProperties(): void {
    this._message = this.getAttribute('message') || '';
    this._type = this.getAttribute('type') || 'error';
  }

  protected _onAttributeChange(name: string, value: string | null): void {
    if (name === 'message') {
      this._message = value || '';
    } else if (name === 'type') {
      this._type = value || 'error';
    }
    this._requestRender();
  }

  protected _render(): void {
    this.innerHTML = `
      <div class="error-message ${this._type}" role="alert">
        <span class="icon">⚠</span>
        <span class="message">${this._message}</span>
        <button class="dismiss" aria-label="Dismiss">×</button>
      </div>
    `;
  }

  protected _setupEvents(): void {
    const dismissBtn = this.shadowRoot?.querySelector('.dismiss');
    dismissBtn?.addEventListener('click', () => {
      this._emit('dismiss');
    });
  }

  get message(): string {
    return this._message;
  }

  set message(value: string) {
    this.setAttribute('message', value);
  }
}

customElements.define('error-message', ErrorMessage);
```

## CSS Migration

### Converting Tailwind Classes to Native CSS

Tailwind utilities must be converted to standard CSS. Create a stylesheet or use inline styles:

```typescript
// Before (Tailwind classes in JSX)
<div class="container mx-auto px-4 py-8">
  <h1 class="text-2xl font-bold text-gray-900">Title</h1>
</div>

// After (Native CSS)
protected _render(): void {
  this.innerHTML = `
    <style>
      .container {
        margin-left: auto;
        margin-right: auto;
        padding-left: 1rem;
        padding-right: 1rem;
        padding-top: 2rem;
        padding-bottom: 2rem;
        max-width: 64rem;
      }
      h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #111827;
      }
    </style>
    <div class="container">
      <h1>Title</h1>
    </div>
  `;
}
```

### Using Shoelace CSS Custom Properties

Shoelace provides CSS custom properties for theming. Use these instead of hardcoding colors:

```typescript
protected _render(): void {
  this.innerHTML = `
    <style>
      .card {
        background-color: var(--sl-color-neutral-0);
        border: 1px solid var(--sl-color-neutral-200);
        border-radius: var(--sl-border-radius-medium);
        padding: var(--sl-spacing-medium);
      }
      .title {
        color: var(--sl-color-neutral-900);
        font-size: var(--sl-font-size-large);
      }
    </style>
    <div class="card">
      <h2 class="title">Card Title</h2>
    </div>
  `;
}
```

### Container for Responsive Design

Wrap content in a container for proper responsive behavior:

```typescript
protected _render(): void {
  this.innerHTML = `
    <style>
      .container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
      }
      @media (min-width: 768px) {
        .container {
          padding: 0 2rem;
        }
      }
    </style>
    <div class="container">
      <!-- content here -->
    </div>
  `;
}
```

### Common CSS Conversions

| Tailwind | CSS |
|----------|-----|
| `flex` | `display: flex;` |
| `flex-col` | `flex-direction: column;` |
| `items-center` | `align-items: center;` |
| `justify-center` | `justify-content: center;` |
| `justify-between` | `justify-content: space-between;` |
| `gap-4` | `gap: 1rem;` |
| `p-4` | `padding: 1rem;` |
| `m-4` | `margin: 1rem;` |
| `text-sm` | `font-size: 0.875rem;` |
| `font-bold` | `font-weight: 700;` |
| `text-center` | `text-align: center;` |
| `w-full` | `width: 100%;` |
| `h-full` | `height: 100%;` |
| `rounded` | `border-radius: 0.25rem;` |
| `shadow` | `box-shadow: 0 1px 3px rgba(0,0,0,0.1);` |

## Troubleshooting

### Component Not Rendering

1. Check if the component is registered: `customElements.get('my-component')`
2. Verify `observedAttributes` includes all relevant attributes
3. Ensure `_render()` is calling `_requestRender()` after state changes
4. Check browser console for errors

### Attributes Not Updating

1. Verify `observedAttributes` includes the attribute name
2. Ensure `_onAttributeChange` handles the attribute
3. Check that `_requestRender()` is called after updating state

### Events Not Working

1. Verify `_setupEvents()` is implemented
2. Ensure elements are queried after render
3. Check that event listeners are added in `_setupEvents()`
4. Verify cleanup in `_teardownEvents()` to prevent duplicates

### Styles Not Applied

1. If using Shadow DOM, styles must be in the shadow root
2. If using Shoelace, ensure Light DOM is enabled
3. Check that CSS selectors match the rendered HTML
4. Verify CSS custom properties are available

### Memory Leaks

1. Always clean up timers in `disconnectedCallback()`
2. Remove event listeners in `_teardownEvents()`
3. Clear any subscriptions or observers
4. Nullify DOM references if needed

### Build Issues

1. Ensure TypeScript is configured correctly
2. Check that all imports resolve
3. Verify the build output includes the component
4. Check for circular dependencies

## Best Practices

1. **Keep components small**: Each component should have a single responsibility
2. **Use signals for state**: Signals provide reactive updates with minimal overhead
3. **Clean up resources**: Always implement proper cleanup in `disconnectedCallback()`
4. **Test in isolation**: Verify each component works independently before integration
5. **Document props**: Add JSDoc comments for component API surface
6. **Use TypeScript**: Leverage type safety for better developer experience
7. **Follow naming conventions**: Use kebab-case for component names, camelCase for properties

## Additional Resources

- [Web Components MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Custom Elements API](https://developer.mozilla.org/en-US/docs/Web/API/Custom_Elements_API)
- [Shadow DOM API](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot)
- [Shoelace Component Library](https://shoelace.style/)
