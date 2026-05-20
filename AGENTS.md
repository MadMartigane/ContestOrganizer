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

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **ContestOrganizer** (1548 symbols, 2148 relationships, 76 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/ContestOrganizer/context` | Codebase overview, check index freshness |
| `gitnexus://repo/ContestOrganizer/clusters` | All functional areas |
| `gitnexus://repo/ContestOrganizer/processes` | All execution flows |
| `gitnexus://repo/ContestOrganizer/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
