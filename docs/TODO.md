# ContestOrganizer — Spec Alignment TODO

> **Source**: `docs/REVIEW_TRACKING.md` — exhaustive audit of `docs/FONCTIONNAL_SPECIFICATIONS.md`
> **Method**: Each finding is referenced by its batch number (e.g., #3.15) for traceability to REVIEW_TRACKING.md
> **Deduplication**: 6.4=dup→4.10, 6.5=dup→4.9, 6.6=dup→3.2+3.6, 3.12=merged→3.11
> **Exclusions**: crypto.randomUUID() items, carousel items
> **Unique findings**: 45

## Legend

| Priority | Meaning | Example |
|----------|---------|---------|
| **HIGH** ❌ | Missing or significantly wrong behavior | Feature absent, logic inverted |
| **HIGH** ⚠️ | Deviation affecting core functionality | Wrong scoring, wrong auto-scroll target |
| **MEDIUM** ⚠️ | Visible UX/styling gap, not breaking | Missing icon, wrong color, wrong label |
| **LOW** ⚠️ | Minor cosmetic or typography issue | Extra emoji, button order, space before "?" |
| **NOTE** ℹ️ | Implementation is better than spec | Kept for spec-alignment awareness |

## Summary

| Priority | Tasks | Findings |
|----------|-------|----------|
| HIGH     | 13    | 21       |
| MEDIUM   | 20    | 19       |
| LOW      | 6     | 5        |
| NOTE     | 2     | 2        |
| **Total**| **41**| **47**   |

> Note: some findings map to multiple tasks or are spec notes, hence total findings > unique findings (44) due to overlap and merged entries.

---

## HIGH Priority

### H1. Team Tile — Layout & Responsive Stacking
- **Findings**: #3.15 ⚠️ #3.16 ❌
- **Spec**: §17 Team Display (Team Tile)
- **Files**: `src/lib/components/team-tile.svelte`
- **Description**: Logo uses fixed 48px width instead of 50% container. No `text-right` alignment when `variant="reverse"`. No responsive breakpoint to stack vertically on small screens — layout is always horizontal.
- **Acceptance**:
  - [ ] Logo occupies ~50% of tile width (not fixed px)
  - [ ] `variant="reverse"` applies `text-right` alignment to name container
  - [ ] Below `sm` breakpoint: `flex-col` vertical stacking

### H2. Team Tile — Placeholder & Error States
- **Findings**: #3.17 ❌ #3.18 ⚠️ #3.19 ❌
- **Spec**: §17 — "basketball SVG", "custom scale+opacity animation", "64×64 muted shield", "console.warn"
- **Files**: `src/lib/components/team-tile.svelte`
- **Description**: Placeholder shows concentric circles instead of basketball shape. Uses `animate-pulse` instead of custom scale+opacity. Logo error: 48×48 (not 64), error-red (not muted), no `console.warn`. `prefers-reduced-motion`: animation removed but no `opacity-80` fallback.
- **Acceptance**:
  - [ ] Placeholder SVG is basketball-shaped (not concentric circles)
  - [ ] Custom animation: scale + opacity (not `animate-pulse`)
  - [ ] Error state: 64×64, muted/gray color (not error-red), `console.warn` on error
  - [ ] `prefers-reduced-motion`: `opacity-80` fallback applied

### H3. Grid Table — Default Column Colors
- **Findings**: #3.10 ❌
- **Spec**: §11 — "Points=primary, Buts+/Buts−=green, Goal avg=amber"
- **Files**: `src/lib/components/grid-table.svelte`
- **Description**: Data cells use default text color. No sport-specific color classes applied to column cells.
- **Acceptance**:
  - [ ] Points column: primary color class
  - [ ] Buts+/Buts− columns: green/success color class
  - [ ] Goal avg column: amber/warning color class

### H4. Grid Table — Row Numbering Style
- **Findings**: #4.12 ⚠️
- **Spec**: §14 — "sequential numbers, NOT badges"
- **Files**: `src/lib/components/grid-table.svelte`
- **Description**: Grid row numbers rendered as colored badge circles (bg-primary, rounded-full). Spec requires plain numbers only.
- **Acceptance**:
  - [ ] Row numbers are plain text (no background, no rounded-full, no color)

### H5. Grid Table — Header/Cell Responsive Mismatch
- **Findings**: #3.14 ⚠️
- **Spec**: §11 — consistent responsive hiding
- **Files**: `src/lib/components/grid-table.svelte`
- **Description**: Column headers hidden on mobile via responsive classes, but corresponding data cells remain visible, causing column misalignment.
- **Acceptance**:
  - [ ] Each data cell's responsive visibility matches its header's visibility

### H6. Tournament Detail — Inline Name Editing
- **Findings**: #3.6 ❌
- **Spec**: §5 — "no validation on inline edit", "Escape saves current value"
- **Files**: `src/routes/tournament/[tournamentId]/+page.svelte`
- **Description**: Inline name edit enforces min-length ≥3 (spec says no validation). Pressing Escape discards changes (spec says Escape saves current value).
- **Acceptance**:
  - [ ] Remove min-length validation from inline edit (accept any non-empty)
  - [ ] Escape key saves the current input value (not discards)

### H7. Match Page — Auto-Scroll Target
- **Findings**: #4.3 ⚠️
- **Spec**: §6 — "scroll to last DOING, fallback last DONE"
- **Files**: `src/routes/match/[tournamentId]/+page.svelte`
- **Description**: Auto-scroll uses `findIndex` (returns FIRST match) instead of `findLastIndex` (returns LAST match) for DOING status.
- **Acceptance**:
  - [ ] Auto-scroll targets the LAST match with DOING status
  - [ ] Fallback targets the LAST match with DONE status

### H8. Match Tiles — Wire "Sélection…" Placeholder
- **Findings**: #4.5 ❌
- **Spec**: §6 — "Sélection…" placeholder for empty teams
- **Files**: `src/lib/components/match-tile.svelte`, `src/lib/components/team-tile.svelte`
- **Description**: i18n key `match_select_placeholder` exists but is never used. Empty teams show ⏳ or — instead. Need to pass the i18n key down to TeamTile for display when team is undefined and match is PENDING.
- **Acceptance**:
  - [ ] PENDING matches with empty team slots show "Sélection…" text
  - [ ] The existing i18n key is used (not a hardcoded string)

### H9. Scoring — Non-Universal Point System
- **Findings**: #4.7 ⚠️
- **Spec**: §13 — "universal 3-1-0 point system"
- **Files**: `src/lib/utils/scoring.ts`
- **Description**: Point system is NOT universal. Basket uses 1/0/0, Rugby uses 4/2/0 instead of spec's 3/1/0 for all sports.
- **Acceptance**:
  - [ ] Basket: win=3, draw=1, loss=0
  - [ ] Rugby: win=3, draw=1, loss=0
  - [ ] NFL: win=3, draw=1, loss=0
  - [ ] NBA: win=3, draw=1, loss=0 (if draw handled)
  - [ ] Foot: unchanged (already correct)
- **⚠️ Risk**: Changing point system invalidates saved tournament scores. Requires migration or data reset strategy.

### H9b. Scorer — Wrong Step Values for Rugby/NFL
- **Findings**: audit gap (discovered post-review)
- **Spec**: §13 — scorer steps
- **Files**: `src/lib/components/match-scorer.svelte`
- **Description**: Scorer step buttons for rugby scorerType (used by both NFL and Rugby) show `[2, 3, 5]` instead of `[3, 5, 7]`. Basket/NBA steps `[1, 2, 3]` are correct. Common (Foot) `[+1]` is correct.
- **Acceptance**:
  - [ ] Rugby/NFL: scorer buttons show `3, 5, 7` (not `2, 3, 5`)
  - [ ] Basket/NBA: unchanged (`1, 2, 3`)
  - [ ] Foot: unchanged (`+1`)

### H10. Scoring — Draw Handling NFL/Rugby
- **Findings**: #4.9 ⚠️
- **Spec**: §14 — "visitor wins on tie" for Basket/NBA/NFL/Rugby
- **Files**: `src/lib/utils/scoring.ts`, `src/lib/utils/ranking.ts`
- **Description**: NFL and Rugby point systems still award draw points (e.g., rugby gives 2 for draw). Spec says no draws — visitor wins on tie. Inconsistency between display (no draw shown) and points (draw points awarded).
- **Acceptance**:
  - [ ] NFL: tied scores → visitor gets win points (3), host gets loss (0)
  - [ ] Rugby: tied scores → visitor gets win points (3), host gets loss (0)
  - [ ] No draw points awarded for NFL/Rugby under any condition

### H11. Domain — Enforce id/type Immutability
- **Findings**: #1.1 ⚠️ #1.2 ⚠️
- **Spec**: §9 — "id is immutable", "type is immutable after creation"
- **Files**: `src/lib/domain/types.ts` (or storage updaters in `storage.ts`)
- **Description**: The updateTournament callback receives the full Tournament object, allowing mutation of `id` and `type` fields. These invariants are documented in spec but not programmatically enforced.
- **Acceptance**:
  - [ ] `id` cannot be mutated through any public API (updater callback, spread, etc.)
  - [ ] `type` cannot be mutated through any public API after creation
  - [ ] Existing tests continue to pass

### H12. Team Search — Smooth Scroll to Results
- **Findings**: #5.3 ❌
- **Spec**: §16 — "smooth scroll to results after load"
- **Files**: `src/lib/components/team-search-drawer.svelte`
- **Description**: No `scrollIntoView` logic after search results load. Results may appear outside the visible drawer area.
- **Acceptance**:
  - [ ] After results load, the results container scrolls smoothly into view
  - [ ] Uses `scrollIntoView({ behavior: 'smooth' })` or equivalent

---

## MEDIUM Priority

### M1. Tournament List — Sport Label Text & Trash Color
- **Findings**: #3.1 ⚠️
- **Spec**: §4
- **Files**: `src/lib/components/tournament-list-item.svelte`
- **Description**: Tournament list items show only emoji, missing the sport label text (e.g., "Basket"). Trash icon is error-red (`text-error-500`) instead of warning-amber.
- **Acceptance**:
  - [ ] Sport label text (e.g., "Basket") shown next to emoji
  - [ ] Trash icon uses `text-warning-500` or `variant="warning"`

### M2. Tournament Form — Cancel Button Color
- **Findings**: #3.4 ⚠️
- **Spec**: §4
- **Files**: `src/lib/components/new-tournament-form.svelte`
- **Description**: Cancel button uses `preset-tonal` (neutral gray). Spec requires warning-colored.
- **Acceptance**:
  - [ ] Cancel button uses warning variant or warning color

### M3. Tournament Form — Sport Selector Placeholder
- **Findings**: #3.3 ⚠️
- **Spec**: §4
- **Files**: `src/lib/components/new-tournament-form.svelte`
- **Description**: `sport_selector_placeholder` i18n key is imported but never rendered in the `<select>` element.
- **Acceptance**:
  - [ ] `<select>` has a disabled/selected `<option>` with placeholder text as first child

### M4. Tournament Detail — Not-Found Breadcrumbs
- **Findings**: #3.5 ⚠️
- **Spec**: §5
- **Files**: `src/routes/tournament/[tournamentId]/+page.svelte`
- **Description**: When tournament not found, error message displays correctly but breadcrumbs are absent.
- **Acceptance**:
  - [ ] Breadcrumb component shown even in the error/not-found branch

### M5. Grid Table — Basket Column Headers
- **Findings**: #3.11 ⚠️ + #3.12 ⚠️ (merged — same root cause)
- **Spec**: §11
- **Files**: `src/lib/components/grid-table.svelte`
- **Description**: Basket grid headers show "Buts +" / "Buts −" (using default grid i18n keys). Spec requires "+" / "−" (short labels). Wrong i18n keys used for basket column headers.
- **Acceptance**:
  - [ ] Basket mode columns use short-form i18n keys ("+" / "−")

### M6. Grid Table — Basket Mobile Legend
- **Findings**: #3.13 ⚠️
- **Spec**: §11
- **Files**: `src/lib/components/grid-table.svelte`
- **Description**: Basket mobile legend shown on ALL screen sizes (no responsive breakpoint). Extra 📅 entry not in spec.
- **Acceptance**:
  - [ ] Legend wrapped in responsive breakpoint (e.g., `sm:hidden`)
  - [ ] Remove extra 📅 entry from legend

### M7. Match Page — Empty State Text Color
- **Findings**: #4.1 ⚠️
- **Spec**: §6
- **Files**: `src/routes/match/[tournamentId]/+page.svelte`
- **Description**: Empty match state text uses `text-surface-500` (gray). Spec requires amber/warning.
- **Acceptance**:
  - [ ] Empty state text uses warning color (`text-warning-600 dark:text-warning-400` or alert component)

### M8. Match Tiles — Status Badge Icons
- **Findings**: #4.2 ⚠️
- **Spec**: §6
- **Files**: `src/lib/components/match-tile.svelte`
- **Description**: Status badges show only text labels ("À jouer", "En cours", "Terminé"). Spec requires icons: PENDING=📅 calendar, DOING=⏳ spinner, DONE=✅ check.
- **Acceptance**:
  - [ ] PENDING badge has calendar icon (📅 or SVG)
  - [ ] DOING badge has spinner icon (⏳ or SVG)
  - [ ] DONE badge has check icon (✅ or SVG)

### M9. Match Tiles — Rank Badges
- **Findings**: #4.11 ⚠️
- **Spec**: §14 — rank position displayed on right for host, left for visitor
- **Files**: `src/lib/components/match-tile.svelte`
- **Description**: Rank badges (gold/silver/bronze/blue) not shown in match tiles.
- **Acceptance**:
  - [ ] Rank info passed to TeamTile and rendered as badge overlay
  - [ ] Host: right side, Visitor: left side

### M10. Scorer — Remove Button Color
- **Findings**: #4.6 ⚠️
- **Spec**: §13
- **Files**: `src/lib/components/match-scorer.svelte`
- **Description**: Scorer Remove toggle uses `preset-tonal` (gray). Spec requires amber/warning.
- **Acceptance**:
  - [ ] Remove toggle uses amber/warning variant or color

### M11. Ranking — Missing Computed Stats (Basket)
- **Findings**: #4.8 ⚠️
- **Spec**: §14
- **Files**: `src/lib/utils/ranking.ts`
- **Description**: Basket ranking computed stats missing `scoredPoints`, `concededPoints`, `scheduledMatchs`.
- **Acceptance**:
  - [ ] `scoredPoints` computed and exposed in basket ranking
  - [ ] `concededPoints` computed and exposed in basket ranking
  - [ ] `scheduledMatchs` computed and exposed in basket ranking

### M12. Nav Dock — Visibility Rules
- **Findings**: #4.4 ⚠️
- **Spec**: §6
- **Files**: `src/lib/components/nav-dock.svelte`
- **Description**: Nav dock visibility more restrictive than spec (requires target OR >75% scroll).
- **Acceptance**:
  - [ ] Relax conditions to match spec (visible when scrollable content exists)

### M13. Team Search — Input Autofocus
- **Findings**: #5.1 ⚠️
- **Spec**: §16
- **Files**: `src/lib/components/team-search-drawer.svelte`
- **Description**: Drawer search input has no autofocus. No `autofocus` attribute or programmatic `focus()` on drawer open.
- **Acceptance**:
  - [ ] Search input receives focus when drawer opens (`autofocus` or `$effect` with `.focus()`)

### M14. Team Search — Loading Spinner
- **Findings**: #5.2 ⚠️
- **Spec**: §16
- **Files**: `src/lib/components/team-search-drawer.svelte`
- **Description**: Loading state shows plain text "Chargement des équipes…" without spinner.
- **Acceptance**:
  - [ ] Spinner/SVG animation element displayed alongside loading text

### M15. Team Search — No-Results Styling
- **Findings**: #5.4 ⚠️
- **Spec**: §16
- **Files**: `src/lib/components/team-search-drawer.svelte`
- **Description**: No-results message rendered as plain `<p>`. Spec requires warning alert banner.
- **Acceptance**:
  - [ ] No-results message wrapped in alert component with warning variant and 😞 emoji

### M16. Team Search — Arrow Icon
- **Findings**: #5.5 ⚠️
- **Spec**: §16
- **Files**: `src/lib/components/team-search-drawer.svelte`
- **Description**: Team result items show logo + name but no arrow icon.
- **Acceptance**:
  - [ ] Arrow icon (→ or ➡) added to each search result item

### M17. Error Message — Danger Styling & Bold
- **Findings**: #6.1 ⚠️
- **Spec**: §20.3
- **Files**: `src/lib/components/error-message.svelte`
- **Description**: Error message component missing danger/red styling. Message text not bold.
- **Acceptance**:
  - [ ] Component uses `variant="danger"` or `text-error` classes
  - [ ] Message text wrapped in `<strong>` or styled bold

### M18. Dialogs — Button Sizing & Colors
- **Findings**: #6.2 ⚠️ #6.3 ⚠️
- **Spec**: §B
- **Files**: `src/lib/components/confirm-dialog.svelte`, `src/lib/components/alert-dialog.svelte`
- **Description**: ConfirmDialog Non button uses `preset-tonal` (not warning). Both dialogs' buttons not "large" sized.
- **Acceptance**:
  - [ ] ConfirmDialog: Non button → warning variant
  - [ ] Both dialogs: buttons use large sizing (`btn-lg` or equivalent)

### M19. NBA Schedule — Unused Constraints
- **Findings**: #4.13 ⚠️
- **Spec**: §15
- **Files**: `src/lib/utils/nba-schedule.ts`
- **Description**: `NBA_HOME_AWAY_BALANCE` defined but unused. Window-5 and max-consecutive-2 constraints not implemented.
- **Acceptance**:
  - [ ] `HOME_AWAY_BALANCE` integrated into opponent scoring
  - [ ] Window and consecutive scheduling constraints implemented

### M20. NBA Schedule — Opponent Scoring Penalty
- **Findings**: #4.14 ⚠️
- **Spec**: §15
- **Files**: `src/lib/utils/nba-schedule.ts`
- **Description**: NBA Step 2 opponent scoring has extra `-100000` fallback penalty not in spec formula.
- **Acceptance**:
  - [ ] Remove the extra `-100000` penalty or align with spec formula

---

## LOW Priority

### L1. Config — Remove Extra Emoji
- **Findings**: #2.1 ⚠️
- **Spec**: §7
- **Files**: `src/routes/config/+page.svelte`
- **Description**: Cache heading has extra 🗂️ emoji prefix not in spec.
- **Acceptance**:
  - [ ] Remove the 🗂️ emoji from cache heading

### L2. Tournament Detail — Team Number Input Default
- **Findings**: #3.7 ⚠️
- **Spec**: §5
- **Files**: `src/routes/tournament/[tournamentId]/+page.svelte`
- **Description**: Team number input shows `0` for new tournaments (empty grid). No placeholder text.
- **Acceptance**:
  - [ ] Show placeholder or sensible default (e.g., 4) when grid is empty

### L3. Tournament Detail — Footer Button Order
- **Findings**: #3.8 ⚠️
- **Spec**: §5
- **Files**: `src/routes/tournament/[tournamentId]/+page.svelte`
- **Description**: Footer buttons order differs from spec. Spec order: Effacer, Classement, Go Match, Magic. Current: Effacer, Magic, Classement, Go Match.
- **Acceptance**:
  - [ ] Reorder buttons to: Effacer, Classement, Go Match, Magic

### L4. Tournament Detail — Reset Confirmation Typography
- **Findings**: #3.9 ⚠️
- **Spec**: §5
- **Files**: `src/routes/tournament/[tournamentId]/+page.svelte`
- **Description**: Grid reset confirmation has French typography space before "?" that differs from spec.
- **Acceptance**:
  - [ ] Align confirmation text with spec's exact typography

### L5. Backend API — Response Type Mismatches
- **Findings**: #5.6 ⚠️
- **Spec**: §19
- **Files**: `src/lib/services/backend-api.ts`
- **Description**: Backend response types simplified: `debug` is `string` (not `string[]`), `error` is `string` (not `{message}`), `procedure` is truncated enum (`"ERROR"|"OK"`).
- **Acceptance**:
  - [ ] Align TypeScript interfaces with spec or document simplification as intentional

### L6. Sync — Sequential vs Concurrent Load
- **Findings**: #1.3 ⚠️
- **Spec**: §10
- **Files**: `src/lib/services/sync.ts`
- **Description**: Initialization loads localStorage synchronously first, then fetches backend. Not truly concurrent.
- **Acceptance**:
  - [ ] Use `Promise.all` or equivalent for parallel loading

---

## Spec Alignment Notes

> Implementation is **better** than spec. Document for awareness; no code action needed unless spec must be followed literally.

### N1. Name Min Length Enforced
- **Findings**: #3.2 ⚠️ (linked to #3.6)
- **Spec §4**: min name length = 2 characters; §5: no validation on inline edit
- **Implementation**: enforces `MIN_NAME_LENGTH = 3` on creation; inline edit also validates ≥3
- **Decision needed**: relax to spec (2 chars) or update spec to match (3 chars)

### N2. NaN Guard in Win Percentage
- **Findings**: #4.10 ⚠️
- **Spec §C.1**: Documents the NaN bug (0/0 = NaN) as a known anomaly
- **Implementation**: Guard returns `0` instead of `NaN`
- **Decision needed**: spec §C.1 should be updated to reflect the fix

---

## Appendix A — File Index

Cross-reference of affected files to tasks.

| File | Tasks |
|------|-------|
| `src/lib/components/team-tile.svelte` | H1, H2, H8 |
| `src/lib/components/grid-table.svelte` | H3, H4, H5, M5, M6 |
| `src/lib/components/match-tile.svelte` | H8, M8, M9 |
| `src/lib/components/match-scorer.svelte` | H9b, M10 |
| `src/lib/components/team-search-drawer.svelte` | H12, M13, M14, M15, M16 |
| `src/lib/components/nav-dock.svelte` | M12 |
| `src/lib/components/error-message.svelte` | M17 |
| `src/lib/components/confirm-dialog.svelte` | M18 |
| `src/lib/components/alert-dialog.svelte` | M18 |
| `src/lib/components/tournament-list-item.svelte` | M1 |
| `src/lib/components/new-tournament-form.svelte` | M2, M3 |
| `src/routes/tournament/[tournamentId]/+page.svelte` | H6, M4, L2, L3, L4 |
| `src/routes/match/[tournamentId]/+page.svelte` | H7, M7 |
| `src/routes/config/+page.svelte` | L1 |
| `src/lib/utils/scoring.ts` | H9, H10 |
| `src/lib/utils/ranking.ts` | H10, M11 |
| `src/lib/utils/nba-schedule.ts` | M19, M20 |
| `src/lib/domain/types.ts` | H11 |
| `src/lib/services/backend-api.ts` | L5 |
| `src/lib/services/sync.ts` | L6 |

## Appendix B — Finding Coverage

All findings mapped to their task.

| Finding | Task | Status |
|---------|------|--------|
| #1.1 | H11 | ⚠️ |
| #1.2 | H11 | ⚠️ |
| #1.3 | L6 | ⚠️ |
| #2.1 | L1 | ⚠️ |
| #3.1 | M1 | ⚠️ |
| #3.2 | N1 | ⚠️ spec note |
| #3.3 | M3 | ⚠️ |
| #3.4 | M2 | ⚠️ |
| #3.5 | M4 | ⚠️ |
| #3.6 | H6, N1 | ❌ |
| #3.7 | L2 | ⚠️ |
| #3.8 | L3 | ⚠️ |
| #3.9 | L4 | ⚠️ |
| #3.10 | H3 | ❌ |
| #3.11+3.12 | M5 | ⚠️ (merged) |
| #3.13 | M6 | ⚠️ |
| #3.14 | H5 | ⚠️ |
| #3.15 | H1 | ⚠️ |
| #3.16 | H1 | ❌ |
| #3.17 | H2 | ❌ |
| #3.18 | H2 | ⚠️ |
| #3.19 | H2 | ❌ |
| #4.1 | M7 | ⚠️ |
| #4.2 | M8 | ⚠️ |
| #4.3 | H7 | ⚠️ |
| #4.4 | M12 | ⚠️ |
| #4.5 | H8 | ❌ |
| #4.6 | M10 | ⚠️ |
| #4.7 | H9 | ⚠️ |
| #4.8 | M11 | ⚠️ |
| #4.9 | H10 | ⚠️ |
| #4.10 | N2 | ⚠️ spec note |
| #4.11 | M9 | ⚠️ |
| #4.12 | H4 | ⚠️ |
| #4.13 | M19 | ⚠️ |
| #4.14 | M20 | ⚠️ |
| #5.1 | M13 | ⚠️ |
| #5.2 | M14 | ⚠️ |
| #5.3 | H12 | ❌ |
| #5.4 | M15 | ⚠️ |
| #5.5 | M16 | ⚠️ |
| #5.6 | L5 | ⚠️ |
| #6.1 | M17 | ⚠️ |
| #6.2 | M18 | ⚠️ |
| #6.3 | M18 | ⚠️ |
