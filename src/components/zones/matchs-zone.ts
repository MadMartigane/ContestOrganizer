import { ZoneContainer } from "../zone-container/zone-container.js";
import "../page-match/page-match.js";

const NUMERIC_ID_REGEX = /^\d+$/;

export class MatchsZone extends ZoneContainer {
  private currentTournamentId: string | null = null;
  private static readonly MATCHS_PATH_REGEX = /^\/(\d+)$/;
  private readonly handleRouteChangedBound: (event: Event) => void;

  constructor() {
    super();
    this.zoneType = "matchs";
    this.title = "Matchs";
    this.icon = "controller";
    this.handleRouteChangedBound = this.handleRouteChanged.bind(this);
  }

  connectedCallback(): void {
    // Read hash FIRST, before super triggers _render()
    const hash = window.location.hash;
    if (hash.startsWith("#/matchs/")) {
      const id = hash.split("/")[2];
      if (id && NUMERIC_ID_REGEX.test(id)) {
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

    if (zone === "matchs") {
      const match = path.match(MatchsZone.MATCHS_PATH_REGEX);
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
    const pageMatch = this.querySelector("page-match");
    if (pageMatch) {
      pageMatch.setAttribute("tournament-id", tournamentId);
    }
  }

  protected _render(): void {
    super._render();
    const zoneContent = this.querySelector(".zone-content");
    if (zoneContent) {
      zoneContent.innerHTML = "";
      const pageMatch = document.createElement("page-match");

      if (this.currentTournamentId) {
        pageMatch.setAttribute("tournament-id", this.currentTournamentId);
      }

      zoneContent.appendChild(pageMatch);
    }
  }
}

customElements.define("matchs-zone", MatchsZone);
