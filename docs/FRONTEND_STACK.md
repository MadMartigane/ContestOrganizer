# Frontend Technical Stack

**Sports Tournament Management App — Architecture decisions**

This document captures the frontend stack choices for this project, including the rationale behind each decision. It is intended to be handed to a coding agent to bootstrap the project from scratch alongside the functional specs.

---

## Project context

Small-scale non-profit web app for managing sports tournaments within an association. It replaces a previous app that went through several technical migrations and became too complex to maintain.

Key constraints:
- Self-hosted on a personal server — no external SaaS dependencies, no recurring costs
- Small codebase (~5 pages)
- Single developer, frontend-focused

Two primary pain points of the previous app that drive most decisions below:
- **Aesthetics** — disproportionate time spent on styling with unsatisfying results
- **Performance** — a page listing ~1,500 matches was sluggish under React

---

## Stack summary

| Concern | Choice |
|---|---|
| Framework | SvelteKit + TypeScript |
| Styling | Tailwind CSS v4 + Skeleton UI |
| List performance | TanStack Virtual |
| Data fetching / cache | TanStack Query (`@tanstack/svelte-query`) |
| Forms | Superforms |
| Testing | Vitest |
| i18n | Paraglide JS |
| Structure | Simple monorepo |

---

## Framework — SvelteKit + TypeScript

Svelte compiles components to vanilla JS at build time. There is no Virtual DOM, no runtime diffing. For data-heavy views like a 1,500-row match list, this is a meaningful performance advantage over React.

SvelteKit adds routing, SSR, file-based layouts, and API routes. For a 5-page app this is correctly sized — nothing more is needed.

TypeScript is used throughout: components, routes, and API routes. Types flow from schema definitions all the way to the template.

The developer already knows TypeScript well. No learning curve.

---

## Styling — Tailwind CSS v4 + Skeleton UI

### Tailwind v4

The developer knows Tailwind. v4 specifically introduces a native CSS engine with improved performance and no `tailwind.config.js` required for most use cases.

### Skeleton UI

The core problem to solve was aesthetics: previous apps consumed disproportionate time on theming with unsatisfying results. The requirement was visual polish by default, without custom design work.

- Built specifically for Svelte/SvelteKit — not a port from another ecosystem
- Ships with several professionally designed themes (Cerberus, Wintry, Modern, Rocket, etc.) — the developer picks one at project start and does not author a custom theme
- Dark mode is built into all themes via CSS variables — zero additional configuration
- Built on top of Melt UI (headless, accessible primitives) — accessibility is handled correctly without extra effort
- Tailwind-native — utility classes work seamlessly alongside components

**Explicit non-goal:** custom theming. A pre-built theme is selected once and not modified.

---

## List performance — TanStack Virtual

The previous app rendered up to 1,500 match rows simultaneously into the DOM. Under React this was a significant performance problem.

TanStack Virtual solves this with windowing: only the rows visible in the viewport are in the DOM at any time. Scrolling swaps rows in and out. A list of 1,500 items renders with the same cost as a list of ~20.

- Framework-agnostic, integrates cleanly with Svelte
- Headless — provides scroll math and row indices, the template remains in Svelte
- Applied specifically to the match listing view; other pages with short lists do not need it

---

## Data fetching and cache — TanStack Query

`@tanstack/svelte-query` is used for all server data fetching.

- Loading, error, and success states handled declaratively
- Client-side cache: navigating back to a previously loaded page does not re-fetch unless the cache has expired
- Built-in pagination and infinite query support — used on the match listing page alongside TanStack Virtual
- Svelte-native stores and lifecycle hooks via the official Svelte adapter

---

## Forms — Superforms

Superforms is the standard form library in the SvelteKit ecosystem.

- Form schemas defined once with Zod — types flow from schema through server action to component
- Client and server validation from the same schema, no duplication
- Progressive enhancement: forms work without JavaScript by default
- Designed around SvelteKit's load functions and form actions — no adapter needed

---

## Testing — Vitest

Vitest is the test runner. End-to-end testing (Playwright) is out of scope for now and can be added later.

- Runs in the same Vite pipeline as SvelteKit — near-zero configuration
- Jest-compatible API — existing knowledge transfers directly
- Fast parallel execution and watch mode

---

## Internationalisation — Paraglide JS

The app supports two languages: French (default) and English.

Paraglide JS from the Inlang team is the chosen i18n library. Unlike traditional i18n libraries that load JSON translation files at runtime, Paraglide compiles each message into a TypeScript function at build time.

- Full type safety — translation keys and their parameters are typed, missing keys are caught at compile time
- Tree-shaking — only the messages actually used in the bundle are included
- SvelteKit plugin handles routing automatically: `/fr/...` and `/en/...` are generated from the existing route structure without modification
- Zero runtime overhead — no JSON parsing, no dynamic imports

Messages are stored as JSON files per language:

```
messages/
  fr.json
  en.json
```

Usage in components:

```typescript
import * as m from '$lib/paraglide/messages'

m.match_status_live()                  // "En direct" / "Live"
m.match_score({ home: 2, away: 1 })   // typed parameters
```

French is the default language. The `/fr` URL prefix can be omitted for the default locale if desired.

---

## Project structure

Simple monorepo. No special tooling (no Turborepo, no Nx). Standard SvelteKit file layout:

```
src/
  lib/
    components/
    stores/
  routes/
tests/
```
