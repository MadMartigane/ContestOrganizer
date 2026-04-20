# Project Rules — ContestOrganizer

## Skills

- **svelte** — Activé pour toutes les interactions avec le code Svelte/SvelteKit (`.svelte`, `.svelte.js`, `.svelte.ts`).
  Invoquer automatiquement pour l'écriture, la revue, le refactoring et le debug de tout code Svelte.

## Known Pitfalls

### `$effect` dependency tracking with async boundaries

**Piège critique Svelte 5** : `$effect` ne traque que les lectures synchrones. Toute lecture de réactivité (`$state`) 
à l'intérieur d'un `setTimeout`, `setInterval`, `Promise.then`, `await`, ou `requestAnimationFrame` est **invisible** 
pour le compilateur — l'effet ne se redéclenchera jamais quand ces valeurs changent.

❌ **Cassé** — `searchQuery` n'est jamais traqué :
```svelte
$effect(() => {
    const timer = setTimeout(() => {
        debouncedQuery = searchQuery; // lu dans setTimeout → non traqué
    }, 300);
    return () => clearTimeout(timer);
});
```

✅ **Correct** — lecture synchrone capturée avant l'asynchrone :
```svelte
$effect(() => {
    const query = searchQuery; // lecture synchrone → traqué
    const timer = setTimeout(() => {
        debouncedQuery = query;
    }, 300);
    return () => clearTimeout(timer);
});
```

**Règle** : toujours capturer les valeurs réactives **avant** la boundary asynchrone. Assigner dans une `const` 
locale synchrone, puis utiliser cette constante dans le callback asynchrone.

> Bug réel : `src/lib/components/team-search-drawer.svelte` — la recherche d'équipe NBA ne réagissait pas 
> à la saisie utilisateur. Corrigé après diagnostic de ce pattern.
```
