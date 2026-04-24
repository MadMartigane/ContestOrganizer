# ContestOrganizer — Spec vs Implementation Review Tracking

> **Purpose**: Systematic audit of every functional specification against the actual implementation.
> **Method**: One review session per batch to maintain context quality.

---

## Batch Organization

| Batch | Theme | Spec Sections | Key Files |
|-------|-------|---------------|-----------|
| 1 | Domain & Persistence | §1 (overview), §9 (Domain Model), §10 (Persistence & Merge), §21 (Cross-cutting) | `types.ts`, `constants.ts`, `id.ts`, `storage.ts`, `backend-api.ts`, `merge.ts`, `sync.ts` |
| 2 | Navigation & Shell | §2 (Routing), §3 (Home), §7 (Config), §8 (404), §18 (Theme) | `+layout.svelte`, `+layout.ts`, `home/+page.svelte`, `config/+page.svelte`, `+error.svelte`, `theme.svelte.ts`, `app.html` |
| 3 | Tournaments & Grid | §4 (Selection), §5 (Detail), §11 (Grid Management), §17 (Team Tile) | `tournaments/+page.svelte`, `tournament/[id]/+page.svelte`, `grid.ts`, `grid-row-*.svelte`, `grid-table.svelte`, `team-tile.svelte`, `tournament-header.svelte` |
| 4 | Matches & Scoring | §6 (Match Page), §12 (Match Lifecycle), §13 (Scoring), §14 (Ranking), §15 (NBA Schedule) | `match/[id]/+page.svelte`, `match.ts`, `scoring.ts`, `ranking.ts`, `nba-schedule.ts`, `match-*.svelte`, `match-scorer.svelte` |
| 5 | Team Search & APIs | §16 (Team Search), §19 (Error Handling) | `team-search.ts`, `team-cache.ts`, `team-queries.ts`, `magic-fillup.ts`, `api-error-alert.svelte`, `team-search-drawer.svelte` |
| 6 | Components & i18n & Anomalies | §20 (Reusable Components), §A (i18n), §B (Dialogs), §C (Known Anomalies) | All UI primitives, `paraglide/`, `messages/fr.json`, `messages/en.json`, `confirm-dialog.svelte`, `alert-dialog.svelte` |

---

## Detailed Spec Tracking

### Batch 1 — Domain & Persistence ✅ REVIEWED

| Spec Ref | Requirement | Status | Finding |
|----------|-------------|--------|---------|
| §1 | 5 sport types: Foot, Basket, NBA, NFL, Rugby | ✅ | Exact match in TournamentType |
| §1 | Sport display labels and emojis | ✅ | All 5 correct in SPORT_CONFIG |
| §1 | Grid model per sport (default vs basket) | ✅ | Foot=default, others=basket |
| §1 | Scorer buttons per sport | ✅ | Foot=common, Basket/NBA=basket, NFL/Rugby=rugby |
| §1 | Draw handling per sport | ✅ | Foot draws=1pt each, Basket ties=visitor wins |
| §1 | Manual ranking (Foot only) | ✅ | Foot=raw order, basket-types=auto-sorted |
| §1 | Magic fill-up (NBA only) | ✅ | Component exists, rendered only for NBA |
| §1 | NBA schedule generation | ✅ | Dedicated utility + button component |
| §1 | Default sport: Foot | ✅ | DEFAULT_SPORT = "Foot" |
| §9 | Tournament.id: Number, crypto random | ⚠️ | TYPE MISMATCH: implementation uses `string` (UUID v4) instead of `Number`. All IDs cascade: Tournament, TeamRow, Match, hostId, visitorId are all `string` |
| §9 | Tournament.name: String | ✅ | Correct, trimmed on creation |
| §9 | Tournament.type: TournamentType, defaults Foot | ✅ | Correct |
| §9 | Tournament.grid: TeamRow[] | ✅ | Correct, init empty array |
| §9 | Tournament.matchs: Match[] | ✅ | French spelling matches spec |
| §9 | Tournament.timestamp: Number, ms | ✅ | Date.now() on every change |
| §9 | Invariant: id immutable | ⚠️ | Not programmatically enforced — updater callback can mutate id |
| §9 | Invariant: timestamp auto-updated | ✅ | Both collection and tournament level |
| §9 | Invariant: type immutable after creation | ⚠️ | Not programmatically enforced — updater callback can mutate type |
| §9 | TeamRow.id: auto-generated | ⚠️ | Uses UUID string instead of spec's Number |
| §9 | TeamRow.type: from parent tournament | ✅ | createEmptySlot(type) correct |
| §9 | TeamRow.team: GenericTeam or undefined | ✅ | Correct, defaults undefined |
| §9 | TeamRow.points/scoredGoals/concededGoals/goalAverage/scheduledMatchs: all 0 | ✅ | All defaults correct |
| §9 | GenericTeam fields (id:number, name, type, logo?, league?, country?) | ✅ | All fields match including TeamCountry {code, flag, id, name} |
| §9 | Match fields (id, hostId, visitorId) | ⚠️ | All `string` instead of `Number` (cascades from UUID choice) |
| §9 | Match.goals: {host: number, visitor: number}, init 0 | ✅ | MatchGoals interface correct |
| §9 | Match.status: MatchStatus | ✅ | Default "PENDING" |
| §9 | MatchStatus: PENDING, DOING, DONE | ✅ | Exact string literal union |
| §9 | Match status labels (FR) | ✅ | Exact i18n match. Note: MATCH_STATUS_CONFIG.labelKey is dead code |
| §9 | Match status colors (blue/green/amber) | ✅ | PENDING=primary, DOING=success, DONE=warning |
| §10 | Dual persistence (localStorage + backend) | ✅ | saveCollection writes both |
| §10 | Local storage key: CONTEST_ORGANIZER_TOURNAMENTS | ✅ | Exact match |
| §10 | Local storage format: { timestamp, tournaments } | ✅ | TournamentCollection interface |
| §10 | Backend GET/POST endpoints | ✅ | Exact paths match |
| §10 | Backend save failure: logged, non-blocking | ✅ | Fire-and-forget with .catch logging |
| §10 | Merge: newer source is primary | ✅ | local.timestamp >= backend.timestamp comparison |
| §10 | Merge: per-tournament timestamp comparison | ✅ | Keeps higher timestamp version |
| §10 | Merge: secondary-only tournaments DISCARDED | ✅ | Only iterates primary's tournaments |
| §10 | Merge: result written to both locations | ✅ | saveCollection after merge |
| §10 | Merge scenarios (all 5 cases) | ✅ | All handled correctly |
| §10 | Initialization: concurrent load | ⚠️ | SEQUENTIAL: localStorage sync first, then backend fetch. Not truly concurrent but practically equivalent |
| §10 | Initialization: block UI until complete | ✅ | ready state + AppLoading component |
| §10 | Initialization: guards against double init | ✅ | Module-level initialized flag |
| §21.1 | ID generation: 3 random uint32, pick one | ❌ | COMPLETELY DIFFERENT: uses crypto.randomUUID() (string UUID v4) instead of spec's numeric 32-bit integer algorithm |
| §21.2 | Debounce: 300ms | ✅ | Correct in team-search-drawer with proper Svelte 5 async pattern |

### Batch 2 — Navigation & Shell ✅ REVIEWED

| Spec Ref | Requirement | Status | Finding |
|----------|-------------|--------|---------|
| §2 | Route registry: 6 routes | ✅ | All 6 routes present in file system |
| §2 | Root / redirects to /home | ✅ | 307 redirect in +page.ts |
| §2 | 404 fallback | ✅ | +error.svelte with SPA mode |
| §2 | Deep linking | ✅ | SPA mode serves shell for all URLs |
| §2 | Browser history (back/forward) | ✅ | SvelteKit native History API |
| §2 | Breadcrumb: Home (🏠 current) | ✅ | Single item, no href |
| §2 | Breadcrumb: Tournaments (🏠→🏆) | ✅ | Home clickable, Tournaments current |
| §2 | Breadcrumb: Tournament Detail (🏠→🏆→📋) | ✅ | First two clickable, last current |
| §2 | Breadcrumb: Match (🏠→🏆→📋→🎮) | ✅ | Tournament clickable, Match current |
| §2 | Breadcrumb: Config (⚙ current) | ✅ | Single item, no href |
| §2 | Breadcrumb: 404 (4-0-4 decorative) | ✅ | Decorative span circles, not Breadcrumb component |
| §3 | Home breadcrumb: 🏠 house icon | ✅ | Correct |
| §3 | Page title: "Contest Tournament" | ✅ | app_title() i18n key |
| §3 | Carousel: one illustration, centered | ✅ | max-w-md centered wrapper |
| §3 | Carousel: auto-rotate 5 seconds | ✅ | interval=5000 default |
| §3 | Carousel: randomly selecting | ⚠️ | SEQUENTIAL rotation (index+1 % length), NOT random |
| §3 | Carousel: initial "Greek freak basketball" 300×300 | ⚠️ | Initial slide = "Foot" (not basketball); aspect ratio 4:3 (not 300×300 square) |
| §3 | Carousel: no user controls | ⚠️ | Pagination dots visible and clickable (showDots=true by default) |
| §3 | App Version Badge | ✅ | __APP_VERSION__ from package.json |
| §3 | Footer: ⚙ Configuration + 🏆 Tournois buttons | ✅ | Two large primary side-by-side buttons |
| §7 | Config breadcrumb: ⚙ Config (current) | ✅ | Correct |
| §7 | Page title: "Configuration" | ✅ | config_title() i18n |
| §7 | Dark mode toggle: label + 💡 icon | ✅ | "💡 Mode sombre" |
| §7 | Dark mode: reflects state, immediate, persisted | ✅ | Reactive rune + localStorage + data-mode |
| §7 | Divider | ✅ | hr element |
| §7 | Cache heading | ⚠️ | Extra 🗂️ emoji prefix not in spec |
| §7 | Cache description | ✅ | Exact match |
| §7 | "Vider le cache" button (warning, trash) | ✅ | Warning variant + 🗑️ emoji |
| §7 | Cache clear: no confirmation | ✅ | Direct call, no dialog |
| §7 | Cache clear: green alert auto-dismiss 3s | ✅ | Toast variant=success, 3000ms timeout |
| §7 | Footer: 🏠 Accueil + 🏆 Tournois | ✅ | Correct |
| §8 | 404 breadcrumb: decorative 4-0-4 circles | ✅ | Rounded-full spans |
| §8 | Error title: "404 - La page demandée n'existe pas." | ✅ | Exact i18n match |
| §8 | 404 carousel: 2 illustrations + pagination dots | ⚠️ | Generic sport illustrations (Foot, Basket), not "404-themed" |
| §8 | Footer: 🏠 Accueil + 🏆 Tournois | ✅ | Correct |
| §18 | OS preference detection | ✅ | prefers-color-scheme matchMedia |
| §18 | System preference following until manual toggle | ✅ | change listener + userHasManualChoice flag |
| §18 | Manual toggle: immediate + persisted | ✅ | setDarkMode + localStorage + stop tracking |
| §18 | Storage key: CONTEST_ORGANIZER_SETTING, darkMode | ✅ | Exact match |
| §18 | Skeleton v4 theme system, data-mode on root | ✅ | data-theme="cerberus" + data-mode |
| §18 | FOUC prevention | ✅ | Inline script in app.html before paint |
| §18 | Edge case: no localStorage → OS preference | ✅ | try/catch fallback |
| §18 | Edge case: corrupted data → OS preference | ✅ | catch block fallback |
| §18 | Edge case: multiple init → only first | ✅ | initialized flag guard |

### Batch 3 — Tournaments & Grid ✅ REVIEWED

| Spec Ref | Requirement | Status | Finding |
|----------|-------------|--------|---------|
| §4 | Breadcrumb: 🏠→🏆 | ✅ | Correct |
| §4 | Tournament list in insertion order | ✅ | #each on array |
| §4 | List item: name, sport label+emoji, team count pill, 🗑, ➡ | ⚠️ | MISSING sport label text (only emoji shown). Trash is error-red not warning-amber |
| §4 | Empty state: 🏆 "Pas encore de tournois" ⛹ | ✅ | Correct colors and text |
| §4 | Divider | ✅ | hr element |
| §4 | "Nouveau tournoi" button (➕) | ✅ | Correct |
| §4 | Creation form: name label, placeholder, min length | ⚠️ | MIN_NAME_LENGTH=3 (spec says 2). No HTML minlength attribute |
| §4 | Sport selector: label, help, options, default | ⚠️ | Placeholder defined in i18n but never rendered (select element has no placeholder) |
| §4 | Buttons: Annuler (warning) + Ajouter (primary, ≥3 chars) | ⚠️ | Annuler is neutral-tonal, NOT warning-colored |
| §4 | Keyboard: Enter submits, ArrowDown to sport | ✅ | Correct |
| §4 | Create: unique ID, empty grid+matches, persisted | ✅ | Correct |
| §4 | Cancel: form closes | ✅ | Correct |
| §4 | Delete: confirm dialog with 🚨, Oui/Non, overlay no dismiss | ✅ | closeOnInteractOutside=false |
| §5 | Tournament loaded by URL param ID | ✅ | $page.params.tournamentId |
| §5 | Not found: error message + breadcrumbs | ⚠️ | Error message correct but NO BREADCRUMBS shown in not-found state |
| §5 | Inline name editing | ❌ | VALIDATION MISMATCH: requires length≥3 (spec says no validation). Escape DISCARDS (spec says saves) |
| §5 | Team number input: min 2, max 32, step 2, default 4 | ⚠️ | Shows 0 for new tournaments (grid empty). No placeholder |
| §5 | Footer button order: Effacer, Classement, Go Match, Magic | ⚠️ | ORDER DIFFERS: Effacer, Magic, Classement, Go Match |
| §5 | Grid reset: confirmation + reset to 4 | ⚠️ | French typography space before "?" differs from spec |
| §5 | Ranking (Foot only): points DESC, goal avg DESC, persisted | ✅ | Correct |
| §11 | Default grid columns: #, Équipes, Points, Buts+, Buts−, Goal avg, 📅 | ✅ | All 7 columns correct |
| §11 | Default grid column colors (primary/green/amber) | ❌ | MISSING: no color classes on data cells — all use default text |
| §11 | Basket grid columns: #, Équipes, %, J, G, P, +, −, 📅 | ⚠️ | Headers show "Buts +" / "Buts −" instead of "+" / "−" |
| §11 | Basket full/short labels | ⚠️ | Legend correct but headers use wrong keys (Buts+ instead of +) |
| §11 | Basket mobile legend | ⚠️ | Legend shown on ALL screen sizes (no responsive breakpoint). Extra 📅 entry not in spec |
| §11 | Grid size constraints (2/32/2/4) | ✅ | Constants match |
| §11 | Grid resize behavior | ✅ | Append/slice correct |
| §11 | Team number syncs to row count | ✅ | $derived from grid.length |
| §11 | Team assignment: filtered by sport, persisted | ✅ | Correct |
| §11 | Team change: preserves stats | ✅ | Spread operator preserves all fields |
| §11 | Empty slot: "Équipe vide" | ✅ | Correct i18n |
| §11 | Duplicate teams allowed | ✅ | No uniqueness check |
| §11 | Empty grid (0): hidden + message | ✅ | Correct |
| §11 | Row numbering: zero-padded 2 digits | ✅ | padStart(2, "0") |
| §11 | BONUS: header/cell responsive mismatch | ⚠️ | Headers hidden on mobile but data cells aren't → misalignment |
| §17 | Layout: 50/50 logo/name, reversed text alignment | ⚠️ | Fixed 48px logo (not 50%). No text-right in reversed mode |
| §17 | Responsive: stacks on small screens | ❌ | MISSING: no flex-col breakpoint, always horizontal |
| §17 | Lazy logo: IntersectionObserver 10% | ✅ | threshold: 0.1 + disconnect |
| §17 | Placeholder: basketball SVG, custom animation | ❌ | WRONG SHAPE (concentric circles, not basketball). Uses animate-pulse instead of custom scale+opacity animation |
| §17 | prefers-reduced-motion: opacity 0.8, no animation | ⚠️ | Animation removed but NO opacity-80 applied |
| §17 | Logo error: shield-with-x 64×64, muted, console.warn | ❌ | 48×48 (not 64). Error-red color (not muted). No console.warn |
| §17 | No team: ⏳ placeholder | ✅ | Hourglass emoji shown |
| §17 | Rank badge | ✅ | Gold/silver/bronze/blue gradients |

### Batch 4 — Matches & Scoring ✅ REVIEWED

| Spec Ref | Requirement | Status | Finding |
|----------|-------------|--------|---------|
| §6 | Match breadcrumb (4 levels, Tournament clickable) | ✅ | Correct |
| §6 | Match count header: "Match(s) {count}" | ✅ | Correct |
| §6 | Match list header: 3/11-5/11-3/11 layout | ✅ | grid-cols-[3fr_5fr_3fr] |
| §6 | Match list in insertion order | ✅ | Array order preserved |
| §6 | Empty state: "Aucun match en cours" (amber) | ⚠️ | GRAY text (text-surface-500) instead of amber/warning |
| §6 | Creation buttons: Nouveau, Auto-Match, Generate All Missing | ✅ | All present |
| §6 | Buttons disabled when NBA 82 games complete | ✅ | seasonComplete flag |
| §6 | Manual match: team selector panel with stats | ✅ | Full table with checkbox, stats, sorting |
| §6 | Manual match: sorted completed ASC, scheduled DESC | ✅ | Correct sort |
| §6 | Manual match: first=host second=visitor, Valider disabled until 2 | ✅ | Correct |
| §6 | Manual match: Annuler discards, PENDING 0-0 | ✅ | Correct |
| §6 | Auto-match: Team1 fewest total (tiebreak: first in grid) | ✅ | Correct |
| §6 | Auto-match: Team2 fewest confrontations (tiebreak: fewest total, last in grid) | ✅ | Correct |
| §6 | Auto-match: PENDING 0-0, needs ≥2 teams | ✅ | Correct |
| §6 | Match tile: host/visitor tiles, scores, VS, status, actions | ✅ | Correct |
| §6 | Status badges: PENDING=blue+calendar, DOING=green+spinner, DONE=amber+check | ⚠️ | Colors correct but ICONS MISSING — only text labels shown |
| §6 | Match lifecycle: PENDING→DOING→DONE, re-open DONE→DOING | ✅ | 3-state cycle correct |
| §6 | Delete match: confirmation "Supprimer le match?" | ✅ | ConfirmDialog |
| §6 | Auto-scroll: last DOING, last DONE fallback | ⚠️ | Finds FIRST DOING instead of LAST (findIndex vs findLastIndex) |
| §6 | Auto-scroll: smooth, virtual scrolling | ✅ | TanStack virtual + scrollToIndex smooth |
| §6 | Nav dock: Top/Current/Bottom with Alt+T/M/B | ✅ | All shortcuts correct |
| §6 | Nav dock: visibility rules | ⚠️ | More restrictive than spec (requires target OR >75% scroll) |
| §6 | "Sélection…" placeholder for empty teams | ❌ | i18n key exists but NEVER USED — shows ⏳/— instead |
| §12 | Score propagation per click | ✅ | Update → persist → recalc → reactive update |
| §12 | Score recalc: full reset-and-replay | ✅ | All stats reset to 0, then replay all matches |
| §12 | scheduledMatchs for all statuses, DONE only for goals+points | ✅ | Correct |
| §12 | goalAverage = scoredGoals − concededGoals | ✅ | Correct |
| §13 | Foot scorer: +1/−1, min 0, disabled when not DOING | ✅ | Correct |
| §13 | Basket/NBA scorer: +1/+2/+3, Add/Remove toggle | ✅ | Correct steps and toggle |
| §13 | Toggle: Add=blue, Remove=amber | ⚠️ | Remove uses preset-tonal (GRAY) not amber |
| §13 | Toggle label: "Ajouter/Supprimer des points" | ✅ | Correct |
| §13 | Score clamped (min 0) | ✅ | Correct |
| §13 | NFL/Rugby: +2/+3/+5 with toggle | ✅ | Correct |
| §13 | Universal 3-1-0 point system | ⚠️ | NOT UNIVERSAL: basket=1/0/0, rugby=4/2/0 instead of 3/1/0 |
| §14 | Two ranking models | ✅ | Correct |
| §14 | Foot ranking: 2-level, stable sort, manual, persisted | ✅ | Correct |
| §14 | Basket ranking: 5-level, auto on render, not persisted | ✅ | Correct |
| §14 | Basket data computed from scratch | ⚠️ | Missing scoredPoints/concededPoints/scheduledMatchs in computed stats |
| §14 | Draw handling Basket/NBA/NFL/Rugby: visitor wins on tie | ⚠️ | NFL/Rugby point system treats draws as draws, not visitor wins |
| §14 | Win percentage: NaN bug when 0/0 | ⚠️ | BUG FIXED: returns 0 instead of NaN (better but deviates from spec) |
| §14 | Rank badges: gold/silver/bronze/blue colors | ✅ | Tailwind gradient approximations, visually correct |
| §14 | Badge position: right for host, left for visitor | ⚠️ | Rank badges NOT shown in match tiles at all |
| §14 | Grid: sequential numbers, NOT badges | ⚠️ | Grid rows use colored badge circles (spec says plain numbers) |
| §14 | No tie handling in ranks | ✅ | Sequential ranks by array position |
| §15 | NBA config: max 82, balance, window 5, max consecutive 2 | ⚠️ | NBA_HOME_AWAY_BALANCE defined but UNUSED. Window 5 and max consecutive 2 NOT IMPLEMENTED |
| §15 | NBA constants (82, 2, 41) | ✅ | All defined |
| §15 | NBA validation: min teams, over-82, enough need games → alert | ✅ | Correct with French warnings |
| §15 | Missing count: floor(sum(remaining)/2) | ✅ | Correct formula |
| §15 | NBA Phase 1: init stats, gamesByOpponent, lastMatchIndex | ✅ | Correct |
| §15 | NBA Phase 2: safety cap 82×numTeams | ✅ | Correct |
| §15 | NBA Step 1: primary = most remaining, rest tiebreak, rest substitution | ✅ | Correct |
| §15 | NBA Step 2: opponent scoring formula | ⚠️ | Extra -100,000 fallback penalty not in spec formula |
| §15 | NBA Step 3: fewer home = host, tie → primary host | ✅ | Correct |
| §15 | NBA Step 4: PENDING 0-0, stats update | ✅ | Correct |
| §15 | "Season Complete" display + disable buttons | ✅ | Correct |
| §15 | Magic fill-up: fetch, dedup, shuffle, fill, add remaining | ✅ | Full Fisher-Yates pipeline |
| §15 | Magic fill-up: error handling (stale cache, no cache) | ✅ | Fallback chain correct |

### Batch 5 — Team Search & APIs ✅ REVIEWED

| Spec Ref | Requirement | Status | Finding |
|----------|-------------|--------|---------|
| §16 | 5 data sources (Foot v3, Basket v1, NFL v1, Rugby v1, NBA TheSportsDB) | ✅ | All endpoints exact match |
| §16 | Authentication: x-apisports-key header / TheSportsDB key in URL | ✅ | Correct |
| §16 | Search: click → left drawer opens | ✅ | Left-side drawer |
| §16 | Search: auto-focused input | ⚠️ | MISSING: no autofocus attribute or programmatic focus() |
| §16 | Drawer title: "Recherche ton équipe. (3 lettres min)" | ✅ | Exact match |
| §16 | Search placeholder: "nom d'équipe" | ✅ | Exact match |
| §16 | Minimum 3 characters, below: clear, no API call | ✅ | TanStack Query enabled flag |
| §16 | Debounce 300ms | ✅ | Correct with Svelte 5 async pattern |
| §16 | Loading: spinner + "Chargement des équipes…" | ⚠️ | Text correct but NO SPINNER — plain text only |
| §16 | Only most recent results displayed | ✅ | TanStack Query queryKey includes query string |
| §16 | Smooth scroll to results after load | ❌ | MISSING: no scroll logic at all |
| §16 | API-Sports response mapping (nested vs flat auto-detect) | ✅ | "team" in item check |
| §16 | TheSportsDB: fetch all, client-side filter, strBadge+"/small", idTeam→number | ✅ | Correct with fallback to strTeamBadge |
| §16 | No results: warning alert 😞 + "Aucun résultat" | ⚠️ | Text+emoji correct but plain <p>, NOT styled as alert banner |
| §16 | Team selection: logo + name + arrow icon, auto-close | ⚠️ | Arrow icon MISSING from result items |
| §16 | Cancel: "Annuler" closes drawer | ✅ | Correct |
| §16 | API-Sports cache: permanent until manual clear | ✅ | No TTL check |
| §16 | API-Sports cache: corrupted → cleared | ✅ | try/catch returns empty |
| §16 | TheSportsDB cache: 7-day TTL, stale fallback | ✅ | NBA_CACHE_TTL + hasStaleNbaCache |
| §16 | Cache clearing: no confirmation, success 3s auto-dismiss | ✅ | Verified in Batch 2 |
| §19 | 5 error categories (Network, Rate Limit, Not Found, Server, Client) | ✅ | All 5 with correct HTTP classification |
| §19 | Error display: red/danger alert, warning triangle, bold title + message | ✅ | Correct styling |
| §19 | Retryable errors: "Réessayer" button re-executes search | ✅ | Network/RateLimit/Server retryable |
| §19 | Backend response wrapping: { procedure, data, error, debug } | ⚠️ | TYPE MISMATCHES: debug is string (not string[]), error is string (not {message}), procedure is "ERROR"|"OK" (not full enum) |

### Batch 6 — Components & i18n & Anomalies ✅ REVIEWED

| Spec Ref | Requirement | Status | Finding |
|----------|-------------|--------|---------|
| §20.1 | Action Bar: horizontal, right-aligned, footer | ✅ | flex justify-end with gap-2 |
| §20.2 | Number Input: labeled, +/- buttons, min/max/step, clamp, disabled when not DOING | ✅ | All features correct. DOING guard at match-tile level |
| §20.3 | Error Message: red/danger, 🐛 icon, "Erreur", bold message, optional home | ⚠️ | NO red/danger styling. Message NOT bold. Icon and heading correct |
| §A | All ~80 message keys present in fr.json + en.json | ✅ | 116 keys in both files, identical key sets |
| §A | Messages via Paraglide runtime | ✅ | import * as m from '$lib/paraglide/messages' |
| §A | FR base, EN secondary | ✅ | FR-first locale branching in generated code |
| §B | Confirm Dialog: 🚨, Oui/Non, overlay no dismiss | ⚠️ | Mechanics correct. Non is preset-tonal (NOT warning). No "large" sizing |
| §B | Alert Dialog: ⚠️, Fermer, overlay no dismiss | ⚠️ | Mechanics correct. No "large" sizing on Fermer button |
| §C.1 | NaN bug in winGamesPercent (0/0) | ⚠️ | BUG FIXED: guard returns 0 (spec documents it as unfixed) |
| §C.2 | Dual ranking models produce different results | ✅ | Confirmed: TeamRow 2-level vs Basket 5-level |
| §C.3 | Match re-opening (DONE→DOING) intentional | ✅ | Works correctly with "Réouvrir" button |
| §C.4 | No draw in Basket/NBA/NFL/Rugby | ⚠️ | Basket/NBA: consistent. NFL/Rugby: INCONSISTENT — display shows no draws but point system awards draw points |
| §C.5 | Empty tournament name allowed | ⚠️ | ANOMALY FIXED: validation enforces ≥3 chars (spec says empty allowed) |
| §C.6 | Duplicate teams allowed in grid | ✅ | No uniqueness check |
| §C.7 | Stats preserved on team change | ✅ | Spread operator preserves all fields |
| §C.8 | Match score defaults to 0 | ✅ | DEFAULT_GOALS = {host:0, visitor:0}. No null guard at display |
| §C.9 | NBA home/away balance drift (greedy) | ✅ | No hard 41 constraint. NBA_HOME_AWAY_BALANCE defined but unused |
| §C.10 | No UUID collision detection | ✅ | No collision check |
| §C.11 | Multiple tabs: merge on startup | ✅ | Timestamp-based merge mechanism |
| §C.12 | Config page "Accueil" spelling correct | ✅ | Correctly spelled |

---

## Status Legend

| Status | Meaning |
|--------|---------|
| ⬜ | Not yet reviewed |
| ✅ | Spec implemented correctly |
| ⚠️ | Implemented with minor differences |
| ❌ | Missing or significantly different |
| 🔄 | Under review |

---

## Review Log

| Date | Batch | Findings | Actions |
|------|-------|----------|---------|
| 2026-04-21 | Batch 1 | 39 ✅ 7 ⚠️ 1 ❌ | Critical: ID gen algorithm differs (UUID string vs spec uint32 number). Invariant enforcement missing. Merge loads sequential vs concurrent. |
| 2026-04-21 | Batch 2 | 24 ✅ 5 ⚠️ 0 ❌ | Carousel sequential (not random), wrong initial slide, dots visible (should have no controls), 404 uses generic illustrations, extra emoji on cache heading |
| 2026-04-21 | Batch 3 | 23 ✅ 14 ⚠️ 5 ❌ | Critical: name edit validation wrong, grid colors missing, team-tile not responsive, wrong placeholder, header/cell misalignment. Moderate: button order, basket headers, no breadcrumbs on not-found |
| 2026-04-21 | Batch 4 | 37 ✅ 13 ⚠️ 1 ❌ | Critical: point system NOT universal (basket=1/0/0 rugby=4/2/0), status badge icons missing, auto-scroll finds first not last DOING, NBA window/consecutive constraints unused. Moderate: grid uses badges (spec says no), rank badges not in match tiles, NaN bug fixed (deviates from spec) |
| 2026-04-21 | Batch 5 | 17 ✅ 5 ⚠️ 1 ❌ | Missing: smooth scroll to results. Partial: no auto-focus, no loading spinner, no-results not styled as alert, no arrow icon on results, backend response types simplified |
| 2026-04-21 | Batch 6 | 17 ✅ 6 ⚠️ 0 ❌ | Error message missing danger styling + bold. Dialog buttons not "large" sized. Two anomalies fixed (NaN guard, empty name validation). NFL/Rugby draw inconsistency between display and points |
