import { html, nothing } from "lit-html";
import { BaseElement } from "../../core/base-element.js";
import { Signal } from "../../core/signal.js";
import { getTournaments } from "../../modules/init.js";
import type { GenericTeam } from "../../modules/team-row/team-row.d.js";
import type TeamRow from "../../modules/team-row/team-row.js";
import type { Tournament } from "../../modules/tournaments/tournaments.types.js";

interface MadTeamTileElement extends HTMLElement {
  rank?: number;
  reverse: boolean | null;
  team: GenericTeam | null;
}

/**
 * MatchTile - Displays a match with host and visitor teams
 * @element mad-match-tile
 */
export class MatchTile extends BaseElement {
  private declare _hostSignal: Signal<TeamRow | null>;
  private declare _visitorSignal: Signal<TeamRow | null>;
  private _fetchPending = false;
  private _tournamentUpdateHandler: (() => void) | null = null;
  private _tournamentUnsubscribe: (() => void) | null = null;

  static get observedAttributes(): string[] {
    return [
      "host-id",
      "visitor-id",
      "tournament-id",
      "host-score",
      "visitor-score",
      "host-rank",
      "visitor-rank",
    ];
  }

  protected _setupProperties(): void {
    this._hostSignal = new Signal<TeamRow | null>(null);
    this._visitorSignal = new Signal<TeamRow | null>(null);

    this._trackSignal(this._hostSignal);
    this._trackSignal(this._visitorSignal);

    this._initialized = true;
  }

  protected _onAttributeChange(name: string, _value: string | null): void {
    // Score changes don't require team data fetch - just re-render
    if (name === "host-score" || name === "visitor-score") {
      this._requestRender();
      return;
    }

    // Team ID or tournament changes require fetching new team data
    if (
      name === "host-id" ||
      name === "visitor-id" ||
      name === "tournament-id"
    ) {
      this._scheduleFetch();
    }
  }

  private _scheduleFetch(): void {
    if (this._fetchPending) {
      return;
    }
    this._fetchPending = true;
    queueMicrotask(() => {
      this._fetchPending = false;
      this._fetchTeamsFromAttributes();
    });
  }

  private _fetchTeamsFromAttributes(): void {
    const tournamentId = this.getAttribute("tournament-id");
    if (!tournamentId) {
      return;
    }

    const hostId = this.getAttribute("host-id");
    const visitorId = this.getAttribute("visitor-id");

    if (hostId) {
      this._fetchTeam("host", hostId);
    }
    if (visitorId) {
      this._fetchTeam("visitor", visitorId);
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._fetchTeamsFromAttributes();

    // Subscribe to tournament updates to refresh team data when teams change
    this._tournamentUpdateHandler = () => {
      this._fetchTeamsFromAttributes();
    };
    // Migration: Using getTournaments() to get singleton instance shared between Stencil and Vanilla bundles
    this._tournamentUnsubscribe = getTournaments().onUpdate(
      this._tournamentUpdateHandler
    );
  }

  disconnectedCallback(): void {
    if (this._tournamentUnsubscribe) {
      this._tournamentUnsubscribe();
      this._tournamentUnsubscribe = null;
    }
    this._tournamentUpdateHandler = null;
    super.disconnectedCallback();
  }

  private async _fetchTeam(
    side: "host" | "visitor",
    value: string | null
  ): Promise<void> {
    const teamId = value === null ? null : Number.parseInt(value, 10);
    if (!teamId) {
      if (side === "host") {
        this._hostSignal.value = null;
      } else {
        this._visitorSignal.value = null;
      }
      return;
    }

    const tournamentId = this.getAttribute("tournament-id");
    if (!tournamentId) {
      return;
    }

    const tid = Number.parseInt(tournamentId, 10);
    // Migration: Using getTournaments() to get singleton instance shared between Stencil and Vanilla bundles
    const tournament = await getTournaments().get(tid);
    if (!tournament) {
      return;
    }

    const team = await getTournaments().getTournamentTeam(
      tournament as Tournament,
      teamId
    );

    if (side === "host") {
      this._hostSignal.value = team;
    } else {
      this._visitorSignal.value = team;
    }
  }

  private _getHostScore(): number | null {
    const value = this.getAttribute("host-score");
    return value === null ? null : Number.parseInt(value, 10);
  }

  private _getVisitorScore(): number | null {
    const value = this.getAttribute("visitor-score");
    return value === null ? null : Number.parseInt(value, 10);
  }

  private _getRank(attr: string): number | undefined {
    const value = this.getAttribute(attr);
    return value === null ? undefined : Number.parseInt(value, 10);
  }

  /**
   * Try to update only score elements without recreating team tiles
   * Returns true if incremental update was performed, false if full render needed
   */
  private _tryIncrementalUpdate(
    host: TeamRow | null,
    visitor: TeamRow | null,
    hostScore: number | null,
    visitorScore: number | null,
    hostRank: number | undefined,
    visitorRank: number | undefined,
    hasScore: boolean
  ): boolean {
    // Get existing team tiles
    const hostTile = this._renderRoot.querySelector(
      ".host-team-tile"
    ) as MadTeamTileElement | null;
    const visitorTile = this._renderRoot.querySelector(
      ".visitor-team-tile"
    ) as MadTeamTileElement | null;

    // Check team existence alignment
    const hasHostTeam = host?.team != null;
    const hasVisitorTeam = visitor?.team != null;

    if (hasHostTeam !== (hostTile != null)) {
      return false;
    }
    if (hasVisitorTeam !== (visitorTile != null)) {
      return false;
    }

    // Check team data identity (same team = incremental safe)
    if (
      hasHostTeam &&
      hostTile &&
      host?.team &&
      hostTile.team?.id !== host.team.id
    ) {
      return false;
    }
    if (
      hasVisitorTeam &&
      visitorTile &&
      visitor?.team &&
      visitorTile.team?.id !== visitor.team.id
    ) {
      return false;
    }

    // Check layout state (score existence)
    const existingScores = this._renderRoot.querySelectorAll(".score");
    if (hasScore !== (existingScores.length === 2)) {
      return false;
    }

    // No incremental update needed if no scores
    if (!hasScore) {
      return false;
    }

    // === ALL CHECKS PASSED: PERFORM INCREMENTAL UPDATE ===

    // Update team object references (in case reference changed but ID same)
    if (hostTile && host?.team && hostTile.team !== host.team) {
      hostTile.team = host.team;
    }
    if (visitorTile && visitor?.team && visitorTile.team !== visitor.team) {
      visitorTile.team = visitor.team;
    }

    // Update score text content
    existingScores[0].textContent = String(hostScore);
    existingScores[1].textContent = String(visitorScore);

    // Update rank properties
    if (hostTile && hostRank !== undefined) {
      hostTile.rank = hostRank;
    }
    if (visitorTile && visitorRank !== undefined) {
      visitorTile.rank = visitorRank;
    }

    return true;
  }

  protected _render(): void {
    const host = this._hostSignal.value;
    const visitor = this._visitorSignal.value;
    const hostScore = this._getHostScore();
    const visitorScore = this._getVisitorScore();
    const hostRank = this._getRank("host-rank");
    const visitorRank = this._getRank("visitor-rank");
    const hasScore = hostScore !== null && visitorScore !== null;

    // Try incremental update first (preserves team tiles, no flash)
    if (
      this._tryIncrementalUpdate(
        host,
        visitor,
        hostScore,
        visitorScore,
        hostRank,
        visitorRank,
        hasScore
      )
    ) {
      return;
    }

    // Fallback to full render (destroys and recreates everything)
    this._fullRender(
      host,
      visitor,
      hostScore,
      visitorScore,
      hostRank,
      visitorRank,
      hasScore
    );
  }

  private _fullRender(
    host: TeamRow | null,
    visitor: TeamRow | null,
    hostScore: number | null,
    visitorScore: number | null,
    hostRank: number | undefined,
    visitorRank: number | undefined,
    hasScore: boolean
  ): void {
    const hostColClass = hasScore ? "col-span-3" : "col-span-5";
    const visitorColClass = hasScore ? "col-span-3" : "col-span-5";
    const hostTeamName = host?.team?.name ?? "TBD";
    const visitorTeamName = visitor?.team?.name ?? "TBD";

    this._renderTemplate(html`
      <style>
        .match-tile-root {
          display: block;
        }
        .match-grid {
          display: grid;
          min-height: 144px;
          grid-template-columns: repeat(11, 1fr);
          align-content: center;
          align-items: center;
          gap: 0.25rem;
        }
        .host-section {
          text-align: end;
        }
        .visitor-section {
          text-align: start;
        }
        .col-span-3 {
          grid-column: span 3 / span 3;
        }
        .col-span-5 {
          grid-column: span 5 / span 5;
        }
        .col-span-2 {
          grid-column: span 2 / span 2;
        }
        .score {
          font-size: 2.25rem;
          text-align: center;
        }
        .vs {
          text-align: center;
          font-size: 0.75rem;
        }
      </style>
      <div class="match-tile-root">
        <div class="match-grid" role="article" aria-label="Match between ${hostTeamName} and ${visitorTeamName}">
        <div class="host-section ${hostColClass}">
          ${
            host?.team
              ? html`<mad-team-tile class="host-team-tile" .rank=${hostRank ?? 0}></mad-team-tile>`
              : html`<span>Sélection…</span>`
          }
        </div>
        ${
          hasScore
            ? html`<div class="col-span-2 score" aria-label="Home score">${hostScore}</div>`
            : nothing
        }
        <div class="vs" aria-hidden="true">VS</div>
        ${
          hasScore
            ? html`<div class="col-span-2 score" aria-label="Visitor score">${visitorScore}</div>`
            : nothing
        }
        <div class="visitor-section ${visitorColClass}">
          ${
            visitor?.team
              ? html`<mad-team-tile class="visitor-team-tile" .rank=${visitorRank ?? 0}></mad-team-tile>`
              : html`<span>Sélection…</span>`
          }
        </div>
      </div>
    `);

    // Second pass: set properties on newly created team-tiles
    const hostTile = this._renderRoot.querySelector(
      ".host-team-tile"
    ) as MadTeamTileElement | null;
    const visitorTile = this._renderRoot.querySelector(
      ".visitor-team-tile"
    ) as MadTeamTileElement | null;

    if (hostTile && host?.team) {
      hostTile.team = host.team;
      hostTile.reverse = true;
    }

    if (visitorTile && visitor?.team) {
      visitorTile.team = visitor.team;
    }
  }
}

customElements.define("mad-match-tile", MatchTile);
