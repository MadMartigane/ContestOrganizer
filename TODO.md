# Rapport d'Audit Complet — 42 Composants

**Date** : 2026-04-05
**Référentiel** : `CODING_GUIDELINES.md` (15 règles)
**Périmètre** : 42 composants Web (vanilla TypeScript, lit-html, Shadow DOM)
**Verdict** : Zéro composant n'est 100% clean. ~80+ anomalies détectées.

---

## 🔴 CRITIQUES (Bugs fonctionnels)

### 1. `app-status-news.ts` — `_state` déclaré comme Signal mais utilisé comme string
- **Lignes** : 20, 40
- **Problème** : `private declare _state: ComponentState;` (typé Signal) mais `this._state = this._determineState();` assigne une string, pas un Signal.
- **Impact** : Le type ment à l'exécution. Pas de `.value` utilisé, pas de tracking réactif.

### 2. `app-status-news.ts` — `_expandedSections` jamais tracké
- **Ligne** : 33
- **Problème** : `new Signal<Set<string>>(new Set())` créé mais **jamais passé à `_trackSignal()`**.
- **Impact** : Les changements ne déclenchent aucun re-render automatique. Le composant contourne avec de la manipulation DOM manuelle (`_updateAriaStates()`).

### 3. `page-match.ts` — `?disabled` avec string interpolation (toujours truthy)
- **Lignes** : 1116, 1175, 1186
- **Problème** : `?disabled="${expression}"` au lieu de `?disabled=${expression}`
- **Impact** : Les guillemets transforment l'expression en string non-vide → **toujours truthy** → les boutons restent toujours disabled.

### 4. `page-tournament.ts` — `?disabled` avec string interpolation
- **Ligne** : 486
- **Problème** : `?disabled="${magicFillLoading}"` — même bug, toujours truthy.

### 5. `gesture-overlay.ts` — Boolean attribute avec string
- **Lignes** : 356, 405
- **Problème** : `const nextButtonDisabled = ... ? "disabled" : ""` puis `?disabled=${nextButtonDisabled}`
- **Impact** : Fonctionne par accident mais sémantiquement faux et fragile.

### 6. `input-number.ts` — `max=""` et `step=""` vides (bug runtime)
- **Lignes** : 98-99, 124, 130
- **Problème** : Quand `max`/`step` sont `undefined`, le code rend `max=""` et `step=""`
- **Impact** : `max=""` sur un `<input type="number">` est interprété comme `max=0` → **toutes les valeurs sont capées à 0**.

### 7. `input-number.ts` — `value="${...}"` au lieu de `.value=${...}`
- **Ligne** : 132
- **Problème** : `value="${numberValue}"` — binding par attribut, pas par propriété.
- **Impact** : La valeur de l'input ne se met pas à jour réactivement.

### 8. `mad-input.ts` — `value="${value}"` au lieu de `.value=${value}`
- **Ligne** : 351
- **Problème** : Même violation sur le composant input UI.
- **Impact** : L'input ne reflète pas les changements de valeur réactivement.

### 9. `match-tile.ts` — `rank="${...}"` au lieu de `.rank=${...}`
- **Lignes** : 346, 364
- **Problème** : `rank` est une propriété `number` sur `MadTeamTile`, mais passée comme string attribute.
- **Impact** : Force un workaround de "second pass" DOM manipulation (lignes 372-392) pour corriger le type.

### 10. `page-match.ts` — Property binding manquant sur `mad-match-tile`
- **Lignes** : 965-971
- **Problème** : `tournament-id="${...}"`, `host-score="${...}"` etc. au lieu de `.tournamentId=${...}`.

### 11. `page-tournament.ts` — `.value="${...}"` avec quotes
- **Lignes** : 328, 376
- **Problème** : `.value="${tournament?.name ?? ""}"` — le `.value=` est correct mais les quotes `"${...}"` transforment en string interpolation.

---

## 🟠 HAUTES (Anti-patterns architecturaux)

### 12. `addEventListener` manuel sur des éléments de template (9 fichiers)

| Fichier | Lignes | Détail |
|---------|--------|--------|
| `app-status-news.ts` | 303, 315, 327 | 3 listeners manuels sur `.status-card-header` et `.status-retry` |
| `page-config.ts` | 116-125 | `addEventListener` sur `darkModeSwitch` et `clearCacheBtn` |
| `page-match.ts` | 433-449, 1423-1470 | `_setupEvents()` attache manuellement tous les listeners |
| `page-tournament.ts` | 408-420 | `addEventListener` sur les grid components |
| `page-tournament-select.ts` | 94-155 | 6+ listeners manuels (cards, buttons, input) |
| `live-match-card.ts` | 95-109 | `addEventListener("gesture", ...)` sur `_hostZone` et `_visitorZone` |
| `grid-default.ts` | 230 | `addEventListener("madSelectChange", ...)` |
| `grid-basket.ts` | 368 | Même pattern que grid-default |
| `mad-drawer.ts` | 134 | `overlay.addEventListener("click", ...)` avec guard `dataset.madHook` |

**Impact** : ~200+ lignes de boilerplate (`_setupEvents`, `_boundHandlers`, cleanup) qui seraient inutiles avec `@event=${handler}` dans les templates lit-html.

### 13. 5 zone components ne utilisent JAMAIS `_renderTemplate()`
- **Fichiers** : `home-zone.ts`, `config-zone.ts`, `matchs-zone.ts`, `tournament-zone.ts`, `tournaments-zone.ts`
- **Pattern** : `super._render()` puis `document.createElement("page-*")` + `appendChild()`
- **Impact** : Bypass total du système de rendu lit-html. Les enfants ne sont pas trackés par lit-html.

### 14. `page-match.ts` — `render()` impératif de lit-html
- **Ligne** : 427
- **Problème** : `render(template, container as unknown as ShadowRoot)`
- **Impact** : Bypass le pipeline de rendu du composant. Seul fichier qui fait ça.

---

## 🟡 MOYENNES

### 15. `.map()` au lieu de `repeat` directive (9 fichiers)

| Fichier | Lignes |
|---------|--------|
| `page-match.ts` | 1098, 1295-1297 |
| `page-tournament-select.ts` | 376-411 |
| `scorer-basket.ts` | 133 |
| `scorer-rugby.ts` | 133 |
| `select-team.ts` | 389-402 |
| `grid-default.ts` | 146-176 |
| `grid-basket.ts` | 272-310 |
| `command-palette.ts` | 446 |
| `mad-breadcrumb.ts` | 69 |

**Impact** : Pas de keyed DOM reconciliation. Les éléments sont détruits/recréés à chaque re-render au lieu d'être réutilisés.

### 16. Sélecteur `:host` interdit (15 fichiers)

| Fichier | Lignes |
|---------|--------|
| `page-404.ts` | 30 |
| `page-config.ts` | 64 |
| `page-home.ts` | 71 |
| `page-match.ts` | 1221 |
| `page-tournament.ts` | 310, 357 |
| `page-tournament-select.ts` | 289 |
| `zone-container.ts` | 156 |
| `scorer-common.ts` | 159 |
| `scorer-basket.ts` | 127 |
| `scorer-rugby.ts` | 127 |
| `grid-default.ts` | 186 |
| `grid-basket.ts` | 322 |
| `input-number.ts` | 109-115 |
| `command-palette.ts` | 319 |
| `error-message.ts` | 102 |

**Note** : Techniquement `:host` fonctionne avec Shadow DOM, mais la règle l'interdit explicitement. Remplacer par des sélecteurs de classe.

### 17. Scorers bypassent `adoptedStyleSheets` du BaseElement
- **Fichiers** : `scorer-common.ts`, `scorer-basket.ts`, `scorer-rugby.ts`
- **Problème** : Override `_createRenderRoot()` pour appeler `this.attachShadow()` directement.
- **Impact** : Ne reçoivent pas `baseSheet` ni `tailwindSheet` injectés automatiquement par `BaseElement`.

### 18. `console` statements en production (3 fichiers)

| Fichier | Lignes | Détail |
|---------|--------|--------|
| `team-tile.ts` | 163 | `console.warn(...)` |
| `grid-basket.ts` | 190 | `console.error(error)` |
| `input-number.ts` | 214-216 | `console.warn(...)` |

---

## 🟢 BASSES

### 19. JSDoc incomplet ou absent (25+ fichiers)
Tous les composants ont un JSDoc manquant ou incomplet sur au moins un point :
- Pas de documentation des `observedAttributes`
- Pas de documentation des custom events (`@fires`)
- Certains n'ont aucun JSDoc du tout : `scorer-common.ts`, `mad-badge.ts`, `mad-callout.ts`, `mad-card.ts`, `mad-menu.ts`, `mad-spinner.ts`

### 20. TypeScript — casts non-safe (6 fichiers)

| Fichier | Détail |
|---------|--------|
| `select-team.ts` | `as unknown as HTMLElement & {...}` double cast |
| `page-tournament-select.ts` | Structural type assertions au lieu d'interfaces |
| `grid-default.ts` | `as HTMLElement`, `as EventListener` |
| `grid-basket.ts` | `as HTMLElement`, `as EventListener` |
| `page-match.ts` | `(ev as CustomEvent).detail` |
| `command-palette.ts` | `e[key as keyof KeyboardEvent]` |

### 21. `page-config.ts` — `_initialized = true` manquant dans `_setupProperties()`
- Le BaseElement le set dans le constructeur, mais la guideline exige qu'il soit set à la fin de `_setupProperties()`.

### 22. `page-tournament.ts` — Code unreachable
- **Ligne** : 243
- **Problème** : `if (event.key === "Escape")` est unreachable car le bloc précédent (ligne 238) gère déjà Escape avec un `return`.

---

## 📊 Résumé par Règle

| Règle | Description | Violations | Fichiers touchés |
|-------|-------------|-----------|-----------------|
| **R2** | Rendering (`_renderTemplate`) | 6 | 5 zones + `page-match.ts` |
| **R3** | Signal API (`.value`) | 2 | `app-status-news.ts` |
| **R4** | Signal Init/Track | 2 | `app-status-news.ts`, `page-config.ts` |
| **R5/11** | Event Listeners (`@event=`) | 9 | `app-status-news`, `page-config`, `page-match`, `page-tournament`, `page-tournament-select`, `live-match-card`, `grid-default`, `grid-basket`, `mad-drawer` |
| **R6** | Boolean Attributes (`?disabled=`) | 4 | `page-match.ts`, `page-tournament.ts`, `gesture-overlay.ts`, `mad-input.ts` |
| **R7** | Property Binding (`.value=`) | 7 | `page-match.ts`, `page-tournament.ts`, `match-tile.ts`, `input-number.ts`, `mad-input.ts`, `mad-select.ts`, `mad-icon.ts` |
| **R8** | JSDoc complet | 25+ | Quasiment tous les fichiers |
| **R13** | Pas de `:host` selector | 15 | Voir liste ci-dessus |
| **R14** | `repeat` directive | 9 | Voir liste ci-dessus |
| **R15** | Pas de `console` | 3 | `team-tile`, `grid-basket`, `input-number` |
| **Shadow DOM** | Pas de bypass `adoptedStyleSheets` | 3 | `scorer-common`, `scorer-basket`, `scorer-rugby` |

---

## 🏆 Top 3 des fichiers les plus problématiques

1. **`page-match.ts`** — 1490 lignes, 12+ violations dont des bugs fonctionnels (`?disabled` string, `render()` impératif, `.map()`, property binding manquant)
2. **`app-status-news.ts`** — Signal API complètement cassée (`_state` non-Signal, `_expandedSections` non-tracké, 3 `addEventListener` manuels)
3. **`input-number.ts`** — Bug runtime critique (`max=""` cappe les valeurs à 0), property binding manquant, `console.warn`

---

## 🎯 Ordre de correction recommandé

1. **Bugs fonctionnels** (R3, R4, R6, R7) — Corriger les signaux cassés et les bindings
2. **addEventListener → @event** (R5/11) — Éliminer ~200 lignes de boilerplate
3. **`:host` → sélecteurs de classe** (R13) — 15 fichiers, fix rapide
4. **`.map()` → `repeat`** (R14) — 9 fichiers, fix rapide
5. **JSDoc** (R8) — Documentation systématique
6. **Console cleanup** (R15) — Supprimer les `console.*`
7. **Shadow DOM scorers** — Restaurer l'injection automatique des styles
