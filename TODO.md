# ContestOrganizer — Functional TODO

> Auto-generated from `docs/FONCTIONNAL_SPECIFICATIONS.md`. Check items off as they are implemented.

---

## §7 — Configuration Page

- [x] Display page title "Configuration"
- [x] Dark mode toggle: label "Mode sombre" with 💡 icon
- [x] Dark mode toggle reflects the current theme state
- [x] Dark mode toggle immediately applies theme on change
- [x] Dark mode toggle persisted in localStorage under `CONTEST_ORGANIZER_SETTING` with `darkMode` boolean
- [x] Divider between dark mode section and cache section
- [x] Team cache section heading: "Cache des équipes"
- [x] Team cache description: "Vide le cache des équipes si vous rencontrez des problèmes de recherche."
- [x] "Vider le cache" button with warning variant and trash icon
- [x] Cache clearing: no confirmation dialog — clears immediately on click
- [x] Cache clearing success feedback: green alert "Le cache des équipes a été vidé." auto-dismisses after 3 seconds
- [x] Footer navigation button: 🏠 "Accueil" → `/home`
- [x] Footer navigation button: 🏆 "Tournois" → `/tournaments`

---

## §5 — Tournament Detail (Magic Fill-Up)

- [x] "🔮 Magic fill-up" button visible on tournament detail page for NBA tournaments only
- [x] Fetch all 30 NBA teams from TheSportsDB API when magic fill-up is triggered
- [x] Cache fetched NBA teams for 7 days (TTL)
- [x] Deduplicate: remove duplicate team IDs from existing grid, keep first occurrence
- [x] Identify missing NBA teams not already present in the grid
- [x] Shuffle missing teams using Fisher-Yates algorithm
- [x] Fill empty grid slots with shuffled missing teams
- [x] Add remaining teams (beyond empty slots) as new grid rows
- [x] Existing teams in the grid are never removed or replaced
- [x] Error handling: API failure with stale cache → use stale cache data
- [x] Error handling: API failure with no cache → display "Failed to load NBA teams"
- [x] Result: all 30 NBA teams present in the grid after fill-up

---

## §6 — Match Page (Match Creator UI)

- [ ] Match list header: 3-column layout — Left (3/11): "Locaux" (Home teams), Center (5/11): sport type label, Right (3/11): "Visiteurs" (Visitor teams)
- [ ] Match creator displays teams in a selection table layout (not a flat list)
- [ ] Each row includes a checkbox column for team selection
- [ ] Each row includes column for total matches (all statuses) per team
- [ ] Each row includes column for played matches (DONE status) per team
- [ ] Each row includes column for scheduled matches per team
- [ ] Teams sorted by: completed matches ASC, then scheduled matches DESC
- [ ] First team clicked/checked = host, second = visitor
- [ ] "Valider" button disabled until both host and visitor are selected
- [ ] "Annuler" button discards the match and closes the selector

---

## §19 — Error Handling (Differentiated UI)

- [ ] Network error display: title "Erreur réseau", message "Impossible de contacter le serveur. Vérifie ta connexion."
- [ ] Network error: show "Réessayer" button (retryable)
- [ ] Rate limit (HTTP 429) display: title "Trop de requêtes", message "Tu as effectué trop de recherches. Réessaie dans quelques minutes."
- [ ] Rate limit error: show "Réessayer" button (retryable)
- [ ] Not found (HTTP 404) display: title "Non trouvé", message "La ressource demandée n'existe pas."
- [ ] Not found error: no retry button (not retryable)
- [ ] Server error (HTTP 500+) display: title "Erreur serveur", message "Le serveur rencontre un problème. Réessaie plus tard."
- [ ] Server error: show "Réessayer" button (retryable)
- [ ] Client error (other 4xx) display: title "Erreur", message "Une erreur est survenue."
- [ ] Client error: no retry button (not retryable)
- [ ] All error displays use red/danger alert banner with warning triangle icon
- [ ] All error displays show bold title + descriptive message
- [ ] Retryable errors show "Réessayer" button with refresh icon that re-executes the same search
- [ ] Error differentiation applied in team search drawer (currently shows generic error text)

---

## §10 — Tournament Persistence & Merge (Backend Sync)

- [ ] REST API client for backend communication
- [ ] API proxy or endpoint configuration for backend calls
- [ ] Dual persistence: tournament data saved to both localStorage and backend simultaneously
- [ ] Backend save: `POST /api/index.php/store/tournaments` — full collection sent as JSON body
- [ ] Backend save: asynchronous, fire-and-forget (does not block user)
- [ ] Backend save failure: logged to console but does not block or alert the user
- [ ] Backend load: `GET /api/index.php/list/tournaments`
- [ ] localStorage key: `CONTEST_ORGANIZER_TOURNAMENTS`, format: `{ timestamp, tournaments }`
- [ ] Initialization: on app startup, load from localStorage and fetch from backend concurrently
- [ ] Merge algorithm: compare collection timestamps — newer source becomes primary
- [ ] Merge algorithm: for each tournament in primary list, find match by `id` in secondary list
- [ ] Merge algorithm: keep the version with the higher timestamp for each tournament
- [ ] Merge algorithm: tournaments only in secondary list are discarded (deletion in newer source honored)
- [ ] Merge algorithm: merge result written back to both localStorage and backend
- [ ] Initialization sequence: app waits for merge to complete before accepting user interactions
- [ ] Scenario handling: both sources, local newer → merge with local as primary
- [ ] Scenario handling: both sources, backend newer → merge with backend as primary
- [ ] Scenario handling: only backend → use backend data
- [ ] Scenario handling: only local → use local data
- [ ] Scenario handling: neither → empty tournament list

---

## Appendix C — Known Issues & Edge Cases

- [ ] Win percentage displays NaN (not 0) when a team has zero completed matches
- [x] Typo "Acceuil" → "Accueil" on the home button label — fixed in documentation, verify in source when config page is built
