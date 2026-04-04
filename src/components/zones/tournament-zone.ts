import { ZoneContainer } from "../zone-container/zone-container.js";
import "../page-tournament/page-tournament.js";

/**
 * TournamentZone - Tournament detail zone component with Shadow DOM support.
 * Handles route changes and displays tournament information.
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
    super._render();
    const root = this._renderRoot;
    const zoneContent = root.querySelector(".zone-content");
    if (zoneContent) {
      // Check if page-tournament already exists to avoid duplication
      let pageTournament = zoneContent.querySelector("page-tournament");
      if (!pageTournament) {
        pageTournament = document.createElement("page-tournament");
        if (this.currentTournamentId) {
          pageTournament.setAttribute(
            "tournament-id",
            this.currentTournamentId
          );
        }
        zoneContent.appendChild(pageTournament);
      }
    }
  }
}

customElements.define("tournament-zone", TournamentZone);
