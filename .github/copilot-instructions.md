# Copilot Instructions — ContestOrganizer

## Project Overview

ContestOrganizer is a vanilla Web Components SPA for managing sports tournaments (football, basketball, NBA, NFL, rugby). No frameworks — pure Custom Elements + lit-html for templating only.

## Commands

```bash
pnpm install                # install dependencies
pnpm dev                    # start dev server (Vite)
pnpm build                  # production build
pnpm test                   # run all tests
pnpm test -- --reporter=verbose src/components/ui/mad-button/mad-button.spec.ts  # single test
pnpm exec ultracite check   # lint + format check
pnpm exec ultracite fix     # auto-fix lint + format
```

Pre-commit hook (husky): runs vitest → build → ultracite fix on staged files.

## Architecture

**Layer-based structure** under `src/`:

| Directory | Role |
|---|---|
| `core/` | Framework primitives — `BaseElement`, `Signal`, `GestureEngine`, `NavigationOrchestrator`, `RouteSync`, shared stylesheets |
| `components/` | All web components (pages, zones, UI). Co-located: one folder per component with `.ts`, optional `.css` and `.logic.ts` |
| `modules/` | Business logic — `Tournaments` (main data store), API clients (`http-request`, `api-sports`, `thesportsdb`), sport-specific algorithms (`nba/`) |
| `global/` | CSS entry point (Tailwind v4), theme tokens (OKLCH), animations, variables |
| `generated/` | Auto-generated files — do not edit manually |
| `test/` | Vitest setup and helpers |

**Routing**: Custom hash-based (`#/<zone>[/<path>]`). `RouteSync` bidirectionally syncs URL ↔ `NavigationOrchestrator`. Zones: `config`, `home`, `tournaments`, `tournament`, `matchs`.

**State**: Custom `Signal<T>` / `Computed<T>` reactivity system. Business data in `Tournaments` singleton (bridged via `window.__tournaments` during Stencil→Vanilla migration).

**Navigation**: Three-zone spatial layout with gesture engine (swipe, pinch, long-press, double-tap via Pointer Events) + keyboard shortcuts.

## Component Pattern

Every component follows this canonical structure:

```typescript
export class MyComponent extends BaseElement {
  static observedAttributes = ['title'] as const;
  declare private _title: Signal<string>;  // declare, never initialize

  protected _setupProperties(): void {
    this._title = new Signal('');
    this._trackSignal(this._title);        // enables auto re-render
  }

  protected _injectStyles(): void {
    super._injectStyles(myComponentSheet);  // component-specific styles
  }

  protected _render(): void {
    this._renderTemplate(html`<div class="p-4">${this._title.value}</div>`);
  }
}
customElements.define('my-component', MyComponent);  // always at file bottom
```

Key `BaseElement` methods: `_setupProperties()`, `_injectStyles()`, `_render()`, `_renderTemplate()`, `_trackSignal()`, `_emit()`, `_onAttributeChange()`.

## Signal Rules

- `declare` properties — never initialize at declaration
- Read: `signal.value` (not `signal()`)
- Write: `signal.value = x` (not `signal.set(x)`)
- Track in component: `this._trackSignal(signal)`

## lit-html Bindings

- Events: `@click=${handler}`
- Boolean attributes: `?disabled=${condition}` — no quotes around expression
- Property binding: `.value=${expr}`
- Lists: `repeat(items, keyFn, templateFn)` — prefer over `.map()`
- Conditionals: `${condition ? html\`...\` : nothing}`

## Styling — Tailwind in Shadow DOM

Global Tailwind does **not** penetrate Shadow DOM. Components use:
1. `baseSheet` + `tailwindSheet` (auto-injected by `BaseElement` — ~190 utility classes)
2. Component-specific sheets via `_injectStyles()` + `createComponentSheet()`
3. CSS custom properties (`--color-*`) cross shadow boundaries

If a Tailwind class is missing in Shadow DOM, add it to `tailwindSheet` in `src/core/styles.ts`.

Dark mode: class-based (`html.dark`), toggled by `GlobalSetting`.

## Naming Conventions

- UI components: `mad-*` prefix (mad-button, mad-card, mad-badge, mad-icon…)
- Pages: `page-*` (page-home, page-tournament…)
- Zones: `*-zone` (home-zone, config-zone…)
- CSS Shadow Parts: `part="base"`, `part="header"`, `part="content"`

## Configuration Parity

When adding or modifying env vars: update BOTH `vite.config.ts` (`serveConfigPlugin`) AND `scripts/deploy.sh`. Config is served at `/config.js` and sets `window.APP_CONFIG`.

## Hard Constraints

- No React, Vue, Svelte, Angular, or any framework
- No lodash, classnames, or framer-motion
- No Web Awesome — fully removed. Do not reintroduce any `--wa-*` variables or WA component references
- Never override `_createRenderRoot()` — always use Shadow DOM
- Styling: use Tailwind utilities (via `tailwindSheet` in Shadow DOM) or standard CSS values. No third-party CSS frameworks
- Path aliases: `@/`, `@core/`, `@components/`, `@modules/`, `@generated/`

## External Services

- **thesportsdb**: sports data API
- **api-sports**: additional sports data (requires `VITE_API_SPORTS_KEY` in `.env`)
- **Deployment**: SSH-based to `/var/www/marius.click/html/contest` (prod) and `contest-preprod` (pre-prod)
