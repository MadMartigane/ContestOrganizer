import { html } from "lit-html";
import { ZoneContainer } from "../zone-container/zone-container.js";
import "../page-tournament/page-tournament.js";

/**
 * TournamentZone - Tournament detail zone component that renders page-tournament inside the zone container.
 * Handles route changes and displays tournament information.
 * Uses Shadow DOM with lit-html rendering.
 * @element tournament-zone
 * @observedAttributes None - uses JavaScript properties (zoneType, title, icon)
 * @fires None
 */
export class TournamentZone extends ZoneContainer {
  private currentTournamentId: string | null = null;
  private static readonly TOURNAMENT_PATH_REGEX = /^\/(\d+)$/;
  private static readonly NUMERIC_ID_REGEX = /^\d+$/;
  private readonly handleRouteChangedBound: (event: Event) => void;

  constructor() {
    super();
    this.zoneType = "tournament";
    this.title = "Tournament";
    this.icon = "trophy";
    this.handleRouteChangedBound = this.handleRouteChanged.bind(this);
  }

  connectedCallback(): void {
    // Read hash FIRST, before super triggers _render()
    const hash = window.location.hash;
    if (hash.startsWith("#/tournament/")) {
      const id = hash.split("/")[2];
      if (id && TournamentZone.NUMERIC_ID_REGEX.test(id)) {
        this.currentTournamentId = id;
      }
    }

    // NOW call super - _render() will see the correct currentTournamentId
    super.connectedCallback();
    document.addEventListener("route-changed", this.handleRouteChangedBound);
  }

  disconnectedCallback(): void {
    document.removeEventListener("route-changed", this.handleRouteChangedBound);
    super.disconnectedCallback();
  }

  private handleRouteChanged(event: Event): void {
    const detail = (event as CustomEvent<{ zone: string; path: string }>)
      .detail;
    const { zone, path } = detail;

    if (zone === "tournament") {
      const match = path.match(TournamentZone.TOURNAMENT_PATH_REGEX);
      if (match) {
        const tournamentId = match[1];
        if (tournamentId !== this.currentTournamentId) {
          this.currentTournamentId = tournamentId;
          this.updateTournamentId(tournamentId);
        }
      }
    }
  }

  private updateTournamentId(tournamentId: string): void {
    const root = this._renderRoot;
    const pageTournament = root.querySelector("page-tournament");
    if (pageTournament) {
      pageTournament.setAttribute("tournament-id", tournamentId);
    }
  }

  protected _render(): void {
    const zoneType = this.zoneType;
    const title = this.title;
    const icon = this.icon;
    const isFocused = this._isFocused();
    const isCollapsed = this._isCollapsed();
    const showFocusButton = !(isFocused || isCollapsed);
    const tournamentId = this.currentTournamentId ?? "";

    this._renderTemplate(html`
      ${this._getStyles()}
      <div part="base" class="zone-container zone-${zoneType}" data-focused="${isFocused}">
        <header part="header" class="zone-header">
          <mad-icon name="${icon}"></mad-icon>
          <h2 part="title">${title}</h2>
          <button
            part="focus-btn"
            class="focus-btn"
            aria-label="Focus ${title} zone"
            ?hidden=${!showFocusButton}
            @click=${this._handleFocus}
          >
            <mad-icon name="expand"></mad-icon>
          </button>
        </header>
        <div part="content" class="zone-content">
          <page-tournament tournament-id="${tournamentId}"></page-tournament>
        </div>
      </div>
    `);
  }
}

customElements.define("tournament-zone", TournamentZone);
