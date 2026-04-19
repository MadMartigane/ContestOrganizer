# ContestOrganizer — Functional Specifications

> **Purpose**: This document describes ALL functional behaviors of the ContestOrganizer application. It is intended to be comprehensive enough for a complete re-implementation. It contains **no technical specifications** — only what the system does, not how.

> **Language**: The application UI is in **French**. All UI labels are documented in French with English translations.

> **Version**: Based on the last functional codebase state.

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [Navigation & Routing](#2-navigation--routing)
3. [Home Page](#3-home-page)
4. [Tournament Selection Page](#4-tournament-selection-page)
5. [Tournament Detail Page](#5-tournament-detail-page)
6. [Match Page](#6-match-page)
7. [Configuration Page](#7-configuration-page)
8. [404 Page](#8-404-page)
9. [Tournament Domain Model](#9-tournament-domain-model)
10. [Tournament Persistence & Merge](#10-tournament-persistence--merge)
11. [Grid Management](#11-grid-management)
12. [Match Management](#12-match-management)
13. [Scoring Systems](#13-scoring-systems)
14. [Ranking & Standings](#14-ranking--standings)
15. [NBA Schedule Generation](#15-nba-schedule-generation)
16. [Team Search & Selection](#16-team-search--selection)
17. [Team Display (Team Tile)](#17-team-display-team-tile)
18. [Theme Management](#18-theme-management)
19. [Error Handling](#19-error-handling)
20. [Reusable UI Components](#20-reusable-ui-components)
21. [Cross-cutting Behaviors](#21-cross-cutting-behaviors)
22. [Appendix A — Internationalization Labels](#appendix-a--internationalization-labels)
23. [Appendix B — Confirmation & Alert Dialog Specification](#appendix-b--confirmation--alert-dialog-specification)
24. [Appendix C — Known Anomalies & Edge Cases](#appendix-c--known-anomalies--edge-cases)

---

## 1. Application Overview

**ContestOrganizer** is a single-page application for organizing and scoring multi-sport tournaments. It supports five sport types: Football (Soccer), Basketball, NBA, NFL, and Rugby.

### Core Capabilities
- Create, configure, and delete tournaments by sport type
- Populate tournament grids with professional sports teams (fetched from external APIs)
- Create matches between teams (manually, automatically, or NBA bulk generation)
- Score matches in real-time with sport-specific scoring controls
- Automatically calculate standings and rankings
- Persist tournament data locally and to a backend server
- Support dark/light theme with system preference detection

### Sport Types

| Identifier | Display Label | Emoji |
|---|---|---|
| `Foot` | Foot | ⚽ |
| `Basket` | Basket | 🏀 |
| `NBA` | NBA | 🏀 |
| `NFL` | NFL | 🏈 |
| `Rugby` | Rugby | 🏉 |

### Functional Differences by Sport Type

| Behavior | Foot | Basket | NBA | NFL | Rugby |
|---|---|---|---|---|---|
| Grid model | Goal-based (points, goals, goal avg) | Win/Loss (W, L, win%) | Win/Loss (W, L, win%) | Win/Loss (W, L, win%) | Win/Loss (W, L, win%) |
| Scorer buttons | +1 / −1 | +1, +2, +3 with toggle | +1, +2, +3 with toggle | +2, +3, +5 with toggle | +2, +3, +5 with toggle |
| Draw possible | Yes (1 pt each) | No explicit handling | No explicit handling | No explicit handling | No explicit handling |
| Manual ranking button | Yes ("Classement !") | No (auto-sorted) | No (auto-sorted) | No (auto-sorted) | No (auto-sorted) |
| Magic Fill-up | No | No | Yes | No | No |
| NBA schedule generation | No | No | Yes | No | No |
| Default sport | Yes | No | No | No | No |

---

## 2. Navigation & Routing

### Route Registry

The application uses **file-based routing** (SvelteKit conventions). Only one page renders at a time.

| Route | Page | Purpose | Parameters |
|---|---|---|---|
| `/home` | Home | Landing page | None |
| `/tournaments` | Tournament Selection | List, create, delete tournaments | None |
| `/tournament/[tournamentId]` | Tournament Detail | Grid configuration & management | `tournamentId` |
| `/match/[tournamentId]` | Match Page | Match management & scoring | `tournamentId` |
| `/team-select/[teamId]/[teamType]` | Team Selection | Search & pick a team (drawer) | `teamId`, `teamType` |
| `/config` | Configuration | App settings | None |

### Routing Rules

| Rule | Description |
|---|---|
| Default route | Root path (`/`) redirects to `/home` |
| 404 handling | Unmatched routes render the 404 page |
| Deep linking | All routes support direct URL entry |
| History | Browser back/forward buttons work via History API |

### Navigation Map

```
Home ←→ Config
Home ←→ Tournaments ←→ Tournament Detail ←→ Match Page
                                          ←→ Team Selection (drawer)
404 Page (fallback)
```

### Breadcrumb Navigation

| Page | Breadcrumb Items |
|---|---|
| Home | 🏠 Home (current) |
| Tournaments | 🏠 Home (clickable) → 🏆 Tournaments (current) |
| Tournament Detail | 🏠 Home → 🏆 Tournaments → 📋 Tournament (current) |
| Match Page | 🏠 Home → 🏆 Tournaments → 📋 Tournament (clickable) → 🎮 Match (current) |
| Config | ⚙ Config (current) |
| 404 | 4-0-4 (decorative) |

---

## 3. Home Page

### UI Elements

1. **Breadcrumb**: Single house icon (🏠), not clickable (current page).
2. **Page Title**: "Contest Tournament"
3. **Rotating Image Carousel**:
   - Displays one illustration at a time, centered.
   - Auto-rotates every **5 seconds**, randomly selecting from five sport-themed illustrations.
   - Initial image: "Greek freak basketball" (300×300).
   - No user controls — cannot be paused.
4. **App Version Badge**: Displays the current application version number.
5. **Footer Navigation Buttons** (two large primary buttons side by side):
   - ⚙ "Configuration" → navigates to `/config`
   - 🏆 "Tournois" → navigates to `/tournaments`

---

## 4. Tournament Selection Page

### UI Elements

1. **Breadcrumb**: 🏠 Home (clickable) → 🏆 Tournaments (current)

2. **Tournament List** (when tournaments exist):
   - Vertical menu of all tournaments in insertion order.
   - Each tournament item shows:
     - Tournament name
     - Sport type label with emoji
     - Pill badge with team count
     - 🗑 Trash icon (warning color) — triggers deletion
     - ➡ Arrow-right icon — navigation indicator
   - Clicking a tournament item navigates to `/tournament/{id}`.

3. **Empty State** (no tournaments):
   - 🏆 Trophy icon (warning color)
   - "Pas encore de tournois" (No tournaments yet)
   - ⛹ Basketball icon (success color)

4. **Divider**: Horizontal separator.

5. **New Tournament Button**:
   - ➕ "Nouveau tournoi" — reveals the creation form.

6. **Creation Form** (when open):
   - **Name input**: Label "Nom du tournois", placeholder "Playoff", min length 2, auto-focused.
   - **Sport selector**: Label "Quel sport ?", placeholder "Basket, NBA, Foot, …", help text "(defaut: Foot ⚽️)". Options: 🏀 NBA, 🏉 Rugby, 🏈 NFL, 🏀 Basket, ⚽ Foot. Default: Foot.
   - **Buttons**: "Annuler" (Cancel, warning) and "Ajouter" (Add, primary). "Ajouter" is disabled until name ≥ 3 characters.
   - **Keyboard**: Enter submits, ArrowDown moves focus to sport selector.

### Create Tournament Behavior

1. User clicks "Nouveau tournoi" → form appears, name input auto-focused.
2. User types name (≥ 3 chars enables "Ajouter"). Optionally selects sport type.
3. Submit: unique ID generated, tournament created with empty grid and empty matches, persisted, form closes.
4. Cancel ("Annuler"): form closes, nothing created.

### Delete Tournament Behavior

1. User clicks 🗑 on a tournament item.
2. Confirmation dialog: "Supprimer le tournoi: {name}?" with 🚨 icon, "Oui"/"Non" buttons. Overlay click does NOT dismiss.
3. If confirmed: tournament permanently removed (all grid data, matches, scores deleted). Irreversible.
4. If cancelled: nothing happens.

---

## 5. Tournament Detail Page

### Prerequisite
- Tournament loaded by ID from URL parameter.
- If tournament not found: error message "Tournois #{id} non trouvé." with breadcrumbs for navigation.

### UI Elements

1. **Breadcrumb**: 🏠 Home → 🏆 Tournaments → 📋 Tournament (current)

2. **Tournament Name**: Displayed as heading. Click to edit inline:
   - Heading replaced by text input pre-filled with current name.
   - Enter or Escape or blur: saves the trimmed name.
   - No validation on empty names.

3. **Team Number Input**: "Nombre d'équipes (min:2, max:32)", placeholder 4, step 2.
   - Constraints: min 2, max 32, step 2, default 4.
   - Changing value resizes the grid (see Section 11).

4. **Grid**: Team slots with stats (see Section 11).

5. **Footer Actions**:
   - "Effacer" (Reset) — clears all data after confirmation
   - "Classement !" (Ranking, Foot only) — sorts grid by ranking
   - "Go Match" — navigates to match page
   - "🔮 Magic fill-up" (NBA only) — auto-populates with NBA teams

### Grid Reset
1. User clicks "Effacer".
2. Confirmation dialog: "Es-tu sûre de vouloir effacer les noms, ainsi que les scores de toutes les équipes?"
3. If confirmed: grid emptied, all matches deleted, grid reset to 4 empty slots. Irreversible.

### Ranking Button (Foot Only)
- Clicking "Classement !" sorts the grid by points DESC, then goal average DESC.
- The sorted order is persisted in the grid array.
- Not displayed for Basket/NBA/NFL/Rugby (auto-sorted on display).

---

## 6. Match Page

### Prerequisite
- Tournament loaded by ID from URL parameter.
- If tournament not found: error message "Tournois #{id} non trouvé."

### UI Elements

1. **Breadcrumb**: 🏠 Home → 🏆 Tournaments → 📋 Tournament (clickable) → 🎮 Match (current)

2. **Match Count Header**: "Match(s) {count}"

3. **Match List Header**:
   - Left (3/11 width): "Locaux" (Home teams)
   - Center (5/11 width): Sport type label
   - Right (3/11 width): "Visiteurs" (Visitor teams)

4. **Match List**: All matches in insertion order.

5. **Empty State**: "Aucun match en cours" (amber/warning).

6. **Match Creation Buttons**:
   - "Nouveau match" — opens team selector for manual match creation
   - "Auto-Match" — creates one auto-paired match
   - "Generate All Missing ({count})" — NBA only, generates full schedule
   - These buttons are **disabled** when NBA schedule is complete (82 games/team).

### Match Creation (Manual)

1. User clicks "Nouveau match".
2. Team selector panel opens showing all teams in a selection table.
3. Each row shows: checkbox, team tile (logo + name), total matches, played matches, scheduled matches.
4. Teams sorted by: completed matches ASC, then scheduled matches DESC.
5. First team clicked = **host**, second = **visitor**.
6. "Valider" button disabled until both selected.
7. "Annuler" discards the match.
8. On validation: match created in PENDING status, 0–0 score.

### Match Creation (Auto-Match)

1. **Team 1** (host): Team with fewest total matches. Tiebreaker: first in grid order.
2. **Team 2** (visitor): Team with fewest confrontations against Team 1. Tiebreaker: fewest total matches, then last in grid order.
3. Match created in PENDING status, 0–0.
4. Requires ≥ 2 teams.

### Match Display (Match Tile)

Each match tile shows:
- **Host team tile** (left): logo, name, rank
- **Visitor team tile** (right): logo, name, rank
- **Scores** (center): host score and visitor score, separated by "VS"
- **Status badge**: PENDING (blue, calendar icon), DOING (green, spinner), DONE (amber, check icon)
- **Action buttons**: Play/Stop and Delete

Placeholder "Sélection…" shown when team slot is empty.

### Match Lifecycle

```
PENDING ──[Play]──► DOING ──[Stop]──► DONE ◄──[Play]──┘
                                              │
                                        (re-open for
                                     score correction)
```

- PENDING → DOING: User clicks "Play" button. Scorer controls become active.
- DOING → DONE: User clicks "Stop" button. Scores finalized, standings recalculated.
- DONE → DOING: User clicks "Play" button on a completed match to **re-open it**. This allows:
  - **Score correction**: Fix an erroneously entered score.
  - **Temporary viewing**: Pause to check current standings before resuming.
  - After re-opening, the match can be stopped again to finalize.
- Scoring controls are **only active in DOING status**.
- Deleting a match (any status) requires confirmation: "Supprimer le match?"

### Auto-Scroll Behavior

On page load, the match list auto-scrolls to the most relevant match:
1. Priority 1: Last match with DOING status.
2. Priority 2: Last match with DONE status.
3. No scroll if all matches are PENDING.
- Smooth scroll animation. Uses virtual scrolling APIs for reliable targeting.

### Scroll Navigation Dock

Fixed dock in bottom-right corner:
- **Top** (Alt+T): Scroll to page top
- **Current Match** (Alt+M): Scroll to target match
- **Bottom** (Alt+B): Scroll to page bottom
- Visible when scrolled down and target match exists (or past 75% viewport).
- "Current Match" button disabled when no target exists.

---

## 7. Configuration Page

### UI Elements

1. **Breadcrumb**: ⚙ Config (current, not clickable)

2. **Page Title**: "Configuration"

3. **Dark Mode Toggle**:
   - Label: "Mode sombre" with 💡 icon
   - Reflects current theme state
   - Toggle ON/OFF immediately applies theme
   - Persisted in local storage

4. **Divider**

5. **Team Cache Section**:
   - Heading: "Cache des équipes"
   - Description: "Vide le cache des équipes si vous rencontrez des problèmes de recherche."
   - "Vider le cache" button (warning variant, trash icon)
   - **No confirmation dialog** — clears immediately on click
   - Success feedback: green alert "Le cache des équipes a été vidé." — auto-dismisses after 3 seconds

6. **Footer Navigation**:
   - 🏠 "Accueil" → `/home`
   - 🏆 "Tournois" → `/tournaments`

---

## 8. 404 Page

### When Displayed
- Any URL that doesn't match a registered route.

### UI Elements

1. **Breadcrumb**: "4" "0" "4" circle icons (decorative).
2. **Error Title**: "404 - La page demandée n'existe pas."
3. **Image Carousel**: Auto-playing loop with two 404-themed illustrations (400×300) and pagination dots.
4. **Footer Navigation**:
   - 🏠 "Accueil" → `/home`
   - 🏆 "Tournois" → `/tournaments`

---

## 9. Tournament Domain Model

### Tournament

| Field | Type | Description | Auto-Generated |
|---|---|---|---|
| `id` | Number | Unique identifier | Yes (cryptographic random) |
| `name` | String | User-defined name | No |
| `type` | TournamentType | Sport category | No (defaults to Foot) |
| `grid` | TeamRow[] | Ordered list of team slots | Yes (empty at creation) |
| `matchs` | Match[] | All matches | Yes (empty at creation) |
| `timestamp` | Number | Last modification time (ms) | Yes (updated on every change) |

**Invariants**:
- `id` is immutable after creation.
- `timestamp` updated on every create, update, or delete.
- `type` cannot be changed after creation.

### TeamRow (Grid Slot)

| Field | Type | Default | Description |
|---|---|---|---|
| `id` | Number | Auto-generated | Unique slot identifier |
| `type` | TournamentType | From parent tournament | Sport category |
| `team` | GenericTeam or undefined | undefined | Assigned team (empty slot if undefined) |
| `points` | Number | 0 | Cumulative points (3/1/0 system) |
| `scoredGoals` | Number | 0 | Goals/points scored |
| `concededGoals` | Number | 0 | Goals/points conceded |
| `goalAverage` | Number | 0 | Scored − conceded |
| `scheduledMatchs` | Number | 0 | Total matches (all statuses) |

### GenericTeam (Team Data)

| Field | Type | Description |
|---|---|---|
| `id` | Number | Team identifier |
| `name` | String | Team name |
| `type` | TournamentType | Sport category |
| `logo` | String (optional) | URL to team logo |
| `league` | Number (optional) | League identifier |
| `country` | Object (optional) | `{id, name, code, flag}` |

### Match

| Field | Type | Description |
|---|---|---|
| `id` | Number | Unique match identifier |
| `hostId` | Number | Home team's grid slot ID |
| `visitorId` | Number | Away team's grid slot ID |
| `goals` | Object | `{host: number, visitor: number}` — both initialized to 0 |
| `status` | MatchStatus | `PENDING`, `DOING`, or `DONE` |

### Match Statuses

| Status | Label (French) | Visual | Color |
|---|---|---|---|
| PENDING | "Match programmé" | Calendar-check icon | Primary (blue) |
| DOING | "Match en cours" | Animated spinner | Success (green) |
| DONE | "Match terminé" | Check-square icon | Warning (amber) |

---

## 10. Tournament Persistence & Merge

### Dual Persistence

Tournaments are persisted to **two locations simultaneously**:

| Location | Mechanism | Timing |
|---|---|---|
| Browser local storage | JSON under path-based key | Synchronous (before backend) |
| Backend server | REST API POST | Asynchronous (fire-and-forget) |

### Local Storage
- Key: `CONTEST_ORGANIZER_TOURNAMENTS`.
- Format: `{ timestamp: number, tournaments: Tournament[] }`.

### Backend
- Load: `GET /api/index.php/list/tournaments`
- Store: `POST /api/index.php/store/tournaments` (full collection sent as JSON body).
- Backend save failure is logged but does not block the user.

### Merge Algorithm (Startup)

When the app starts, data from both sources is merged:

1. Load tournaments from local storage and backend (both may fail).
2. Compare collection timestamps — the **newer source is primary**.
3. Merge individual tournaments:
   - For each tournament in the primary list, find a match by `id` in the secondary list.
   - Keep the version with the **higher timestamp**.
   - Tournaments only in the secondary list are **discarded** (deletion in the newer source is honored).
4. Result is written back to both locations.

| Scenario | Result |
|---|---|
| Both sources, local newer | Merge with local as primary |
| Both sources, backend newer | Merge with backend as primary |
| Only backend | Use backend data |
| Only local | Use local data |
| Neither | Empty tournament list |

### Initialization Sequence

1. On app startup, local data is loaded and backend data is fetched concurrently.
2. Merge algorithm is applied using timestamps.
3. Result is persisted to both locations.
4. The app waits for initialization to complete before accepting user interactions.

---

## 11. Grid Management

### Grid Component Selection

| Sport Type | Grid Component | Columns |
|---|---|---|
| Foot | Default Grid | #, Teams, Points, Goals+, Goals−, Goal avg, 📅 |
| Basket, NBA, NFL, Rugby | Basket Grid | #, Teams, %, J, G, P, +, −, 📅 |

### Default Grid Columns (Foot)

| Header | Field | Color |
|---|---|---|
| # (zero-padded row number) | Sequential | — |
| Équipes | Team selector | — |
| Points | `points` | Primary |
| Buts + | `scoredGoals` | Success (green) |
| Buts − | `concededGoals` | Warning (amber) |
| Goal average | `goalAverage` | Primary |
| 📅 | `scheduledMatchs` | Primary, centered |

### Basket Grid Columns (Basket/NBA/NFL/Rugby)

| Header | Full (Desktop) | Short (Mobile) | Field | Color |
|---|---|---|---|---|
| # | — | — | Sequential | — |
| Équipes | — | — | Team selector | — |
| % | — | — | `winGamesPercent` | Primary |
| J | Joués | J | `winGames + looseGames` | Default |
| G | Gagnés | G | `winGames` | Success (green) |
| P | Perdus | P | `looseGames` | Warning (amber) |
| + | Marqués | + | `scoredPoints` | Success (green) |
| − | Encaissés | − | `concededPoints` | Warning (amber) |
| 📅 | — | — | `scheduledMatchs` | Primary, centered |

Mobile legend explains abbreviations: % (win percentage), J (played), G (won), P (lost), + (scored), − (conceded), 📅 (scheduled).

### Grid Size Constraints

| Parameter | Value |
|---|---|
| Minimum teams | 2 |
| Maximum teams | 32 |
| Step increment | 2 |
| Default teams | 4 |

### Grid Resizing

- **Increasing**: New empty slots appended at the end.
- **Decreasing**: Slots beyond the new count are permanently removed. Remaining slots (index 0 to new count − 1) are preserved with all data.
- Team number input synchronizes to actual row count when loading an existing tournament.

### Team Assignment to Grid Slots

- Each row has a team selector filtered to the tournament's sport type.
- Selecting a team: assigned to the row, tournament persisted.
- Changing a team: old team replaced, **existing statistics are preserved** (not reset).
- Empty slots show "Équipe vide" placeholder.
- Same team can be assigned to multiple slots (no uniqueness constraint).

### Empty Grid State
- When team count is 0: grid is hidden, replaced by "Choisissez le nombre d'équipes pour commencer !"

### Row Numbering
- Sequential from 1, zero-padded to 2 digits for 1–9 (01, 02, …, 09, 10, 11, …).

---

## 12. Match Management

### Match Lifecycle

```
PENDING ──[Play]──► DOING ──[Stop]──► DONE
```

**Transitions**:
- PENDING → DOING: User clicks "Play" button. Scorer controls become active.
- DOING → DONE: User clicks "Stop" button. Scores finalized, standings recalculated.
- DONE → DOING: User clicks "Play" button to **re-open** a completed match. This is an intentional feature allowing score correction and temporary pause for standings review. The match can be stopped again to re-finalize.

**Match deletion**: Available on any status. Requires confirmation ("Supprimer le match?"). Permanently removes match and triggers full score recalculation.

### Score Propagation Per Click

Every scorer click:
1. Match score updated immediately.
2. Tournament persisted (triggers full score recalculation).
3. Match tile display updated incrementally.

### Score Recalculation Process

Triggered on **every** tournament update (match create, delete, status change, score change):

1. **Reset** all team statistics to zero.
2. **Iterate** all matches:
   - Increment `scheduledMatchs` for both teams (all statuses).
   - For DONE matches only: accumulate scored/conceded goals, award points (3/1/0).
3. Recalculate `goalAverage = scoredGoals − concededGoals` per team.

**Important**: This is a full reset-and-replay, not incremental.

### Auto-Match Algorithm

1. **Team 1** (host): Team with fewest total matches. Tiebreaker: first in grid order.
2. **Team 2** (visitor): Among all other teams, the one with fewest prior matchups against Team 1.
   - Tiebreaker: fewest total matches, then last in grid order.
3. Match created: PENDING, 0–0.
4. Requires ≥ 2 teams.

### NBA Schedule Integration
- "Generate All Missing ({count})" button — only for NBA tournaments.
- Shows "Season Complete (82 games)" when done — disables "Nouveau match" and "Auto-Match".
- See Section 15 for full algorithm details.

---

## 13. Scoring Systems

### Scorer Assignment by Tournament Type

| Sport | Scorer | Buttons | Point Values |
|---|---|---|---|
| Foot | Common | +1 / −1 | Goals (1 per click) |
| Basket | Basket | +1, +2, +3 with Add/Remove toggle | Free throw (1), field goal (2), three-pointer (3) |
| NBA | Basket | +1, +2, +3 with Add/Remove toggle | Same as Basket |
| NFL | Rugby | +2, +3, +5 with Add/Remove toggle | Conversion (2), penalty/drop (3), try (5) |
| Rugby | Rugby | +2, +3, +5 with Add/Remove toggle | Conversion (2), penalty/drop (3), try (5) |

### Football Scorer (Common)

- Two buttons: decrement (−) and increment (+).
- Step size: 1 per click.
- Minimum: 0 (cannot go below).
- Maximum: unlimited.
- Buttons disabled when match is not in DOING status.

### Basketball Scorer

- Three buttons: +1, +2, +3.
- **Add/Remove toggle switch**: Default = Add mode (plus icon, blue). Toggled = Remove mode (minus icon, amber).
- In Add mode: clicking +N adds N to score.
- In Remove mode: clicking +N subtracts N from score.
- Score clamped to min/max bounds after each click.
- Label: "Ajouter/Supprimer des points"

### Rugby Scorer

- Three buttons: +2, +3, +5.
- Same Add/Remove toggle as Basketball.
- Point values: 2 (conversion kick), 3 (penalty/drop goal), 5 (try).

### Point System (Universal — All Sports)

The same point system is used for **all** tournament types in the data model:

| Outcome | Points |
|---|---|
| Win (score > opponent) | 3 |
| Draw (score = opponent) | 1 |
| Loss (score < opponent) | 0 |

**Note**: Basket/NBA/NFL/Rugby display uses a separate W/L model (see Section 14).

---

## 14. Ranking & Standings

### Two Independent Ranking Models

The system operates **two distinct ranking models** that can produce different results:

| Model | Used For | Data Source | Sort Criteria |
|---|---|---|---|
| TeamRow (Foot) | Foot grid display & manual ranking | TeamRow properties | 2-level: points DESC, goal avg DESC |
| Basket Data | Basket/NBA/NFL/Rugby grid display | Recomputed from matches on every render | 5-level: win% → wins → losses → scored → conceded |

**Both models coexist for Basket/NBA/NFL/Rugby**: TeamRow is used for match page rank badges, Basket Data is used for grid display.

### Foot Ranking (2-Level Sort)

1. **Primary**: Points — DESCENDING (most points first)
2. **Secondary**: Goal average — DESCENDING (best difference first)
3. Ties: preserved from original grid order (stable sort)

- Triggered manually by "Classement !" button.
- Sort result is persisted (grid array is reordered).

### Basket/NBA/NFL/Rugby Ranking (5-Level Sort)

Applied automatically on every grid render (not persisted):

| Priority | Sort Key | Direction |
|---|---|---|
| 1st (highest) | Win percentage (`winGamesPercent`) | DESCENDING |
| 2nd | Wins (`winGames`) | DESCENDING |
| 3rd | Losses (`looseGames`) | ASCENDING |
| 4th | Scored points (`scoredPoints`) | DESCENDING |
| 5th (lowest) | Conceded points (`concededPoints`) | ASCENDING |

### Basket Data Aggregation (Independent from TeamRow)

For each team, computed from scratch on every render:

| Statistic | Calculation |
|---|---|
| `winGames` | Count of DONE matches where team scored more than opponent |
| `looseGames` | Count of DONE matches where team scored less than opponent |
| `winGamesPercent` | `Math.round(winGames / (winGames + looseGames) × 100)` |
| `scoredPoints` | Sum of team's scores in all DONE matches |
| `concededPoints` | Sum of opponent's scores in all DONE matches |
| `scheduledMatchs` | From TeamRow (count of all matches, any status) |

### Draw Handling (Basket/NBA/NFL/Rugby)

Basketball, NBA, NFL, and Rugby do **not** have draws in practice. The ranking model reflects this:
- Host: if `host === visitor` → host gets `looseGames++` (loss).
- Visitor: if `host === visitor` → visitor gets `winGames++` (win).

Since tied scores should not occur in these sports, no draw handling is needed. If a tied score somehow occurs (e.g., data entry before match completion), the visitor is credited with a win.

### Win Percentage Formula

```
winGamesPercent = Math.round( winGames / (winGames + looseGames) × 100 )
```

- Result is an integer 0–100.
- If zero completed matches: `0 / 0` results in NaN. This is a **known bug** — the display should show 0, not NaN.

### Rank Display

**On match tiles**: Circular badges (28×28px) overlaid on team tiles:

| Rank | Gradient | Border | Visual |
|---|---|---|---|
| 1st | Gold (#FFD700 → #B8860B) | Light Goldenrod | 🥇 Gold |
| 2nd | Silver (#E8E8E8 → #A0A0A0) | White | 🥈 Silver |
| 3rd | Bronze (#CD7F32 → #8B4513) | Light Goldenrod | 🥉 Bronze |
| 4th+ | Light Blue (#E0F2FE → #7DD3FC) | White | Standard |

- Badge position: right side for host, left side for visitor (reversed layout).
- Ranks computed using the TeamRow 2-level sort (points, goal average) regardless of sport type.
- **No tie handling**: tied teams get unique sequential ranks based on array position.

**On grid**: Sequential zero-padded row numbers (not badges).

---

## 15. NBA Schedule Generation

### Overview

NBA tournaments can generate all remaining matches needed for a full 82-game season with a single button click.

### Configuration

| Parameter | Default | Description |
|---|---|---|
| Max games per team | 82 | Full season target |
| Respect home/away balance | true | Alternates home/away by count |
| Balance window size | 5 | Recent opponents tracked per team |
| Max consecutive appearances | 2 | Same opponent max N times in window |

### Constants

| Constant | Value |
|---|---|
| `NBA_MAX_GAMES_PER_TEAM` | 82 |
| `NBA_MIN_TEAMS` | 2 |
| `NBA_HOME_AWAY_BALANCE` | 41 |

### Validation (Pre-Generation)

Before generating, the system validates:
1. **Minimum teams**: ≥ 2 teams required.
2. **No teams over 82 games**: Any team exceeding the limit blocks generation.
3. **Enough teams need games**: ≥ 2 teams must have remaining games.

If validation fails: alert dialog shows all warnings, no generation occurs.

### Missing Match Count Calculation

```
missingMatches = Math.floor( sum(max(0, remainingGames) for all teams) / 2 )
```

Each match consumes 1 remaining game from each of 2 teams.

### Generation Algorithm — Greedy Rest-Based (Minimax)

The algorithm generates matches one at a time until all teams reach 82 games.

#### Phase 1: Initialization

1. Merge configuration with defaults.
2. Initialize team statistics from existing tournament matches:
   - `totalGames`, `homeGames`, `awayGames`, `remainingGames = 82 − totalGames`
   - `gamesByOpponent`: per-opponent matchup counts
3. Initialize last match index map (all set to −1).
4. Warn if any team already exceeds 82 games.

#### Phase 2: Iterative Match Generation Loop

Safety cap: `82 × number of teams` iterations maximum.

**Each iteration:**

##### Step 1: Select Primary Team

1. Among teams with `remainingGames > 0`, find the team with the **most remaining games**.
2. Tiebreaker: highest **rest** value (rest = current match index − last match index, or ∞ if never appeared).
3. **Rest substitution**: If the selected team has rest = 1 (appeared in immediately previous match), look for an alternative with the same remaining games and rest > 1. Use alternative if found.

##### Step 2: Select Opponent

1. **Preferred pass**: Collect opponents with `remainingGames > 0`, not the primary team, and rest ≠ 1.
   - Score each: `10000 − (totalGamesBetween × 1000) + (remainingGames × 10) + restBonus`
   - `restBonus`: −50000 if rest = 1; else +min(rest, 100)
   - Select highest score.
2. **Fallback pass**: If no preferred opponents, score ALL remaining opponents (including rest = 1, with massive penalty).
3. No opponent found → exit loop.

**Opponent Score Priority** (highest impact to lowest):
1. Back-to-back penalty: −50,000
2. Matchup freshness: −1,000 per prior meeting
3. Rest bonus: +1 to +100
4. Opponent workload: +10 per remaining game

##### Step 3: Assign Home/Away

- If `respectHomeAwayBalance = true`: team with fewer home games is host. Ties → primary team is host.
- If `false`: primary team is always host.

##### Step 4: Create Match

- New match: PENDING status, 0–0 score.
- Update stats for both teams (total, remaining, home/away, gamesByOpponent).
- Update last match index for both teams.

#### Phase 3: Return Results

- Array of generated matches.
- Final team statistics map.
- Accumulated warnings (logged, not shown to user).

### Fairness Properties

- **Workload fairness**: Team with most remaining games selected first.
- **Rest fairness**: Back-to-back appearances strongly penalized (−50,000 score).
- **Opponent diversity**: −1,000 per prior matchup ensures varied opponents.
- **Home/away balance**: Greedy assignment based on current counts.

### Magic Fill-Up (NBA Only)

Populates empty grid slots with all 30 real NBA teams:

1. **Fetch**: All NBA teams from external API (cached 7 days).
2. **Deduplicate**: Remove duplicate team IDs from existing grid (keep first occurrence).
3. **Identify missing**: NBA teams not already in the grid.
4. **Shuffle**: Missing teams randomized using Fisher-Yates algorithm.
5. **Fill empty slots**: Assign shuffled teams to rows without a team.
6. **Add remaining**: Create new grid rows for any leftover teams.
7. **Result**: All 30 NBA teams in the grid. Existing teams never removed/replaced.

Error handling: API failure with stale cache → use stale cache. API failure with no cache → display "Failed to load NBA teams".

---

## 16. Team Search & Selection

### Data Sources by Sport

| Sport | API | Endpoint Pattern |
|---|---|---|
| Foot | API-Sports v3 | `https://v3.football.api-sports.io/teams?search={text}` |
| Basket | API-Sports v1 | `https://v1.basketball.api-sports.io/teams?search={text}` |
| NFL | API-Sports v1 | `https://v1.americanfootball.api-sports.io/teams?search={text}` |
| Rugby | API-Sports v1 | `https://v1.rugby.api-sports.io/teams?search={text}` |
| NBA | TheSportsDB | `https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=NBA` (client-side filter) |

Authentication: API-Sports uses `x-apisports-key` header. TheSportsDB uses free API key in URL.

### Search Flow

1. User clicks team selection area → left-side drawer opens, search input auto-focused.
2. Drawer title: "Recherche ton équipe. (3 lettres min)"
3. Search input placeholder: "nom d'équipe"
4. **Minimum characters**: 3. Below 3: results cleared, no API call.
5. **Debounce**: 300ms after last keystroke.
6. **Loading state**: Spinner + "Chargement des équipes…"
7. Only the most recent search's results are displayed — stale results from earlier keystrokes are discarded.
8. After results load, view scrolls to results container (smooth).

### API-Sports Response Mapping

- Two response structures: nested `{team: {...}}` (Foot/Basket/NFL) and flat `{id, name, logo, ...}` (Rugby).
- Auto-detected by checking for `team` property.
- Mapped to `GenericTeam`: id, name, logo, type, country, league.

### TheSportsDB Response Mapping (NBA)

- Fetches ALL NBA teams, then filters client-side by case-insensitive substring match on team name.
- Logo URL: `strBadge` + "/small" suffix (250px variant).
- Team ID: `idTeam` converted from string to number.

### No Results State

- Warning alert with frowning emoji and text "Aucun résultat".
- Only shown when search text ≥ 3 characters and API returns empty.

### Team Selection

1. Results displayed as selectable menu items (logo + name + arrow icon).
2. The team is assigned to the grid slot and the drawer closes automatically.
3. Selection area updates to show selected team (logo + name).

### Cancel

- "Annuler" button closes drawer, no selection change.

### API-Sports Caching

| Aspect | Value |
|---|---|
| Scope | All sport types (Foot, Basket, NFL, Rugby) |
| TTL | Permanent until manual clear |
| Fallback | Corrupted cache → cleared, treated as empty |

### TheSportsDB Caching (NBA)

| Aspect | Value |
|---|---|
| TTL | 7 days |
| Stale fallback | If API fails but stale cache exists → use stale cache |

### Cache Clearing

From Configuration page:
- "Vider le cache" button clears the API-Sports cache.
- No confirmation dialog.
- Success alert auto-dismisses after 3 seconds.

---

## 17. Team Display (Team Tile)

### Overview

Consistent team visual representation used throughout the application.

### Layout
- **Normal**: Logo left (50%), name right (50%), text left-aligned.
- **Reversed** (`reverse=true`): Logo right, name left, text right-aligned.
- Responsive: stacks full-width on small screens.

### Logo Loading (Lazy)

- Logo **not loaded immediately** — placeholder shown.
- **IntersectionObserver** with 10% visibility threshold.
- When tile becomes visible: logo URL set as image source, observer disconnected.
- Placeholder: animated pulsing basketball SVG (scales 95%–105%, opacity 0.6–1.0, 1.5s cycle).
- If `prefers-reduced-motion`: static opacity 0.8, no animation.

### Logo Error State

- If logo fails to load: shield-with-x icon (64×64), muted color.
- Warning logged to console. No automatic retry.

### Rank Badge

See Section 14 (Rank Display) for full badge specification.

### No Team State

- Hourglass emoji (⏳) shown as placeholder when no team assigned.

---

## 18. Theme Management

### Initial Theme

1. On first visit (no saved preference): detect device OS preference via `prefers-color-scheme`.
2. Dark OS → dark theme. Light OS → light theme.

### System Preference Following

- If the user has **never manually toggled** the theme, the app automatically follows OS preference changes in real-time.
- Once the user manually toggles, their choice takes precedence and OS changes are ignored.

### Manual Toggle

- Configuration page: "Mode sombre" switch (large, with 💡 icon).
- Immediate effect on toggle.
- Persisted in local storage under key `CONTEST_ORGANIZER_SETTING` with `darkMode` boolean.

### Theme Application

- Theme is applied via the Skeleton v4 theme system.
- Dark or light mode is toggled at the document root level.

### Edge Cases

| Scenario | Behavior |
|---|---|
| Local storage unavailable | Falls back to device OS preference |
| Corrupted stored data | Falls back to device OS preference |
| Multiple init calls | Only first call has effect |

---

## 19. Error Handling

### Error Classification

All API errors are classified into five categories:

| Type | Trigger | Title (FR) | Message (FR) | Retryable |
|---|---|---|---|---|
| Network | No HTTP status (connection failure, CORS) | "Erreur réseau" | "Impossible de contacter le serveur. Vérifie ta connexion." | ✅ |
| Rate Limit | HTTP 429 | "Trop de requêtes" | "Tu as effectué trop de recherches. Réessaie dans quelques minutes." | ✅ |
| Not Found | HTTP 404 | "Non trouvé" | "La ressource demandée n'existe pas." | ❌ |
| Server | HTTP 500+ | "Erreur serveur" | "Le serveur rencontre un problème. Réessaie plus tard." | ✅ |
| Client | Other 4xx | "Erreur" | "Une erreur est survenue." | ❌ |

### Error Display

- Red/danger alert banner with warning triangle icon.
- Bold title + descriptive message.
- If retryable: "Réessayer" button (refresh icon) that re-executes the same search.

### Backend Response Wrapping (Procedure Pattern)

| Field | Description |
|---|---|
| `procedure` | Status: `OK`, `500`, `NOT_FOUND`, `NOT_IMPLEMENTED`, `NOT_SUPPORTED` |
| `data` | Response payload |
| `error` | Error details with `message` string |
| `debug` | Array of debug/log strings |

- `OK` → success, data available.
- Anything else → error, error details available.

---

## 20. Reusable UI Components

### 20.1 Action Bar
- Horizontal button container, right-aligned.
- Used as a consistent footer action area across pages.
- Built with Skeleton layout primitives.

### 20.2 Number Input
- Labeled numeric input with increment/decrement buttons.
- Configurable min, max, step, and readonly state.
- Value clamped to valid range. Invalid input → previous value restored.
- Disabled when match is not in DOING status.

### 20.3 Error Message
- Red/danger alert with bug icon (🐛).
- Heading: "Erreur".
- Message text in bold.
- Optional "Retour à l'accueil" button.

---

## 21. Cross-cutting Behaviors

### 21.1 ID Generation

- Generates unique numeric identifiers using cryptographic randomness.
- Creates array of 3 random 32-bit unsigned integers, randomly selects one.
- Range: 0 to 4,294,967,295.
- No collision detection. Probability of collision is negligible for typical usage.

### 21.2 Debounce

Team search input is debounced: 300ms delay after the last keystroke before triggering the API call.

---

## Appendix A — Internationalization Labels

All UI labels are managed through the Paraglide JS message system. Messages are defined per language in:

```
messages/
  fr.json    # French (base locale)
  en.json    # English
```

### Message Key Registry

The following message keys are used throughout the application. Each key maps to a localized string; parameters are noted where applicable.

| Context | Message Key | Parameters | French (default) | English |
|---|---|---|---|---|
| **Home Page** | | | | |
| Page title | `app_title` | — | Contest Tournament | Contest Tournament |
| Config button | `home_config` | — | Configuration | Configuration |
| Tournaments button | `home_tournaments` | — | Tournois | Tournaments |
| Version badge | `app_version` | `version` | v{version} | v{version} |
| **Tournament Selection** | | | | |
| Breadcrumb | `nav_tournaments` | — | 🏆 Tournois | 🏆 Tournaments |
| New tournament button | `tournament_new` | — | Nouveau tournoi | New tournament |
| Name input label | `tournament_name_label` | — | Nom du tournois | Tournament name |
| Name input placeholder | `tournament_name_placeholder` | — | Playoff | Playoff |
| Sport selector label | `sport_selector_label` | — | Quel sport ? | Which sport? |
| Sport selector help | `sport_selector_help` | — | (defaut: Foot ⚽️) | (default: Foot ⚽️) |
| Sport selector placeholder | `sport_selector_placeholder` | — | Basket, NBA, Foot, … | Basket, NBA, Foot, … |
| Confirm add | `action_add` | — | Ajouter | Add |
| Cancel | `action_cancel` | — | Annuler | Cancel |
| Empty state | `tournaments_empty` | — | Pas encore de tournois | No tournaments yet |
| Delete confirmation | `tournament_delete_confirm` | `name` | Supprimer le tournoi: {name}? | Delete tournament: {name}? |
| **Tournament Detail** | | | | |
| Team number label | `team_count_label` | — | Nombre d'équipes (min:2, max:32) | Number of teams |
| Empty grid message | `grid_empty` | — | Choisissez le nombre d'équipes pour commencer ! | Choose the number of teams to get started! |
| Reset button | `action_reset` | — | Effacer | Erase/Clear |
| Ranking button | `action_ranking` | — | Classement ! | Ranking! |
| Go to match button | `action_go_match` | — | Go Match | Go Match |
| Magic fill-up button | `action_magic_fillup` | — | 🔮 Magic fill-up | Magic fill-up |
| Reset confirmation | `grid_reset_confirm` | — | Es-tu sûre de vouloir effacer les noms, ainsi que les scores de toutes les équipes ? | Are you sure you want to erase the names and scores of all teams? |
| Team placeholder | `team_empty` | — | Équipe vide | Empty team |
| Not found error | `tournament_not_found` | `id` | Tournois #{id} non trouvé. | Tournament #{id} not found. |
| **Grid Columns** | | | | |
| Teams | `grid_col_teams` | — | Équipes | Teams |
| Points | `grid_col_points` | — | Points | Points |
| Goals scored | `grid_col_goals_scored` | — | Buts + | Goals + |
| Goals conceded | `grid_col_goals_conceded` | — | Buts − | Goals − |
| Goal average | `grid_col_goal_avg` | — | Goal average | Goal average |
| **Match Page** | | | | |
| Match count | `match_count` | `count` | Match(s) {count} | Match(es) {count} |
| Home column | `match_home` | — | Locaux | Home teams |
| Visitor column | `match_visitor` | — | Visiteurs | Visitor teams |
| Empty state | `match_empty` | — | Aucun match en cours | No match in progress |
| New match button | `match_new` | — | Nouveau match | New match |
| Auto-match button | `match_auto` | — | Auto-Match | Auto-Match |
| NBA generate button | `nba_generate` | `count` | Generate All Missing ({count}) | Generate All Missing ({count}) |
| NBA complete | `nba_complete` | — | Season Complete (82 games) | Season Complete (82 games) |
| Match scheduled | `match_status_pending` | — | Match programmé | Match scheduled |
| Match in progress | `match_status_doing` | — | Match en cours | Match in progress |
| Match completed | `match_status_done` | — | Match terminé | Match completed |
| Team placeholder | `match_team_placeholder` | — | Sélection… | Selection… |
| Delete match confirm | `match_delete_confirm` | — | Supprimer le match ? | Delete the match? |
| NBA generate confirm | `nba_generate_confirm` | `count` | Generate {count} matches to complete the season? | Generate {count} matches to complete the season? |
| **Team Search** | | | | |
| Drawer title | `team_search_title` | — | Recherche ton équipe. (3 lettres min) | Search for your team. (3 letters minimum) |
| Search placeholder | `team_search_placeholder` | — | nom d'équipe | team name |
| Loading message | `team_search_loading` | — | Chargement des équipes… | Loading teams… |
| No results | `team_search_no_results` | — | Aucun résultat | No results |
| Default placeholder | `team_select_placeholder` | — | Sélectionner une équipe | Select a team |
| Retry button | `action_retry` | — | Réessayer | Retry |
| **Configuration** | | | | |
| Page title | `config_title` | — | Configuration | Configuration |
| Dark mode label | `config_dark_mode` | — | Mode sombre | Dark Mode |
| Cache heading | `config_cache_heading` | — | Cache des équipes | Team Cache |
| Cache description | `config_cache_description` | — | Vide le cache des équipes si vous rencontrez des problèmes de recherche. | Clears the team cache if you encounter search issues. |
| Clear cache button | `config_cache_clear` | — | Vider le cache | Clear cache |
| Cache cleared message | `config_cache_cleared` | — | Le cache des équipes a été vidé. | Team cache has been cleared. |
| Home button | `nav_home` | — | Accueil | Home |
| **404 Page** | | | | |
| Error title | `error_404_title` | — | 404 - La page demandée n'existe pas. | 404 - The requested page does not exist. |
| **Error Display** | | | | |
| Error heading | `error_heading` | — | Erreur | Error |
| Home button | `error_go_home` | — | Retour à l'accueil | Return to Home |
| **Confirmation Dialog** | | | | |
| Confirm button | `dialog_confirm` | — | Oui | Yes |
| Cancel button | `dialog_cancel` | — | Non | No |
| Default message | `dialog_confirm_default` | — | Es-tu sûre ? | Are you sure? |
| **Alert Dialog** | | | | |
| Close button | `dialog_close` | — | Fermer | Close |
| Default message | `dialog_alert_default` | — | Attention | Attention |
| **Scoring** | | | | |
| Add/remove toggle | `scoring_add_remove` | — | Ajouter/Supprimer des points | Add/Remove points |

Usage in components:
```typescript
import * as m from '$lib/paraglide/messages'
m.match_count({ count: 5 })  // "Match(s) 5" / "Match(es) 5"
```

---

## Appendix B — Confirmation & Alert Dialog Specification

### Confirmation Dialog

- **Trigger**: Destructive actions (delete tournament, reset grid, delete match, generate NBA schedule).
- **Title**: 🚨 (alarm emoji).
- **Body**: Action-specific message.
- **Buttons**: "Oui" (primary, large) + "Non" (warning, large).
- **Overlay click**: Does NOT dismiss.
- **Return**: `true` (confirmed) or `false` (cancelled).

### Alert Dialog

- **Trigger**: Validation failures requiring acknowledgment.
- **Title**: ⚠️ (warning emoji).
- **Body**: Informational message.
- **Buttons**: "Fermer" (primary, large).
- **Overlay click**: Does NOT dismiss.

---

## Appendix C — Known Bugs, Improvements & Edge Cases

### Known Bugs

#### C.1 — Win Percentage NaN

When a team has zero completed matches, `winGamesPercent = 0/0` results in NaN. This should display as 0 but may display as "NaN" in the grid.

### Known Improvements

#### C.2 — Dual Ranking Models for Basket-Type Sports

For Basket/NBA/NFL/Rugby tournaments, **two independent scoring systems coexist**:
1. TeamRow model (3-1-0 points + goal average) — used for match page rank badges.
2. Basket data model (W/L + win%) — used for grid display.

These can produce **different rankings**. A team ranked 1st on the grid page may not be ranked 1st on the match page's rank badges. Unifying these into a single ranking model would improve consistency.

### Design Decisions

#### C.3 — Match Re-opening (DONE → DOING)

Completed matches can be re-opened by clicking the "Play" button. This is **intentional** and serves two purposes:
1. **Score correction**: Fix an erroneously entered score after a match was finalized.
2. **Temporary pause**: Check current standings mid-match without losing progress.

#### C.4 — No Draw in Basket/NBA/NFL/Rugby

Basketball, NBA, NFL, and Rugby do not have draws in practice. The ranking model intentionally assigns a winner and loser for every match.

### Edge Cases

#### C.5 — Empty Tournament Name

The tournament name can be saved as an empty string. There is no validation preventing empty names after creation.

#### C.6 — Duplicate Teams in Grid

The same team can be assigned to multiple grid slots. There is no uniqueness constraint at the grid level.

#### C.7 — Team Statistics Preserved on Team Change

When a team is changed in a grid slot, the existing statistics (points, goals, etc.) are preserved — they are not reset to zero. This means the new team inherits the old team's stats.

#### C.8 — Match Score Default to 0

Goal values default to 0 if null/undefined. This means a score of 0 is indistinguishable from a missing score.

#### C.9 — Home/Away Balance Drift

The NBA home/away balance is a greedy heuristic, not a hard constraint. Over 82 games, counts should approach 41/41, but exact balance is not guaranteed. The `≤` comparison biases slightly toward home games when counts are tied.

#### C.10 — UUID Collision

The system does not check for ID collisions. Probability is extremely low but non-zero.

#### C.11 — Multiple Tabs

Each browser tab maintains its own in-memory state. Changes in one tab are not immediately visible in others. Conflicts are resolved by the timestamp-based merge on next startup.

#### C.12 — Config Page Typo

The "Accueil" (Home) button on the Configuration page was previously spelled "Acceuil" — this typo has been corrected in documentation.

---

*End of Functional Specifications*
