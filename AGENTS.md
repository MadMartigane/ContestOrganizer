# Project Rules — ContestOrganizer

## Skills

- **svelte** — Enabled for all interactions with Svelte/SvelteKit code (`.svelte`, `.svelte.js`, `.svelte.ts`).
  Automatically invoke for writing, reviewing, refactoring, and debugging any Svelte code.

## Known Pitfalls

### `$effect` dependency tracking with async boundaries

**Critical Svelte 5 pitfall**: `$effect` only tracks synchronous reads. Any reactivity read (`$state`)
inside a `setTimeout`, `setInterval`, `Promise.then`, `await`, or `requestAnimationFrame` is **invisible**
to the compiler — the effect will never re-trigger when those values change.

❌ **Broken** — `searchQuery` is never tracked:

```svelte
$effect(() => {
    const timer = setTimeout(() => {
        debouncedQuery = searchQuery; // read inside setTimeout → not tracked
    }, 300);
    return () => clearTimeout(timer);
});
```

✅ **Correct** — synchronous read captured before the async boundary:

```svelte
$effect(() => {
    const query = searchQuery; // synchronous read → tracked
    const timer = setTimeout(() => {
        debouncedQuery = query;
    }, 300);
    return () => clearTimeout(timer);
});
```

**Rule**: always capture reactive values **before** the async boundary. Assign to a synchronous local
`const`, then use that constant inside the async callback.

> Real bug: `src/lib/components/team-search-drawer.svelte` — NBA team search was not responding
> to user input. Fixed after diagnosing this pattern.

## Development Workflow — Zero-Warning Policy

All code changes must pass `svelte-check` with **zero warnings**.

### Mandatory check command

Run this after every non-trivial code change (especially after editing `.svelte` files):

```bash
npx svelte-check --threshold warning
```

If any warnings appear, fix them before committing. Do not ignore or suppress warnings unless explicitly approved.
