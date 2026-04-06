import { ZoneContainer } from "../zone-container/zone-container.js";
import "../page-match/page-match.js";
/**
 * MatchsZone - Matchs zone component with Shadow DOM support.
 * Handles route changes and displays match information.
 */
export class MatchsZone extends ZoneContainer {
  currentTournamentId = null;
  static MATCHS_PATH_REGEX = /^\/(\d+)$/;
  static NUMERIC_ID_REGEX = /^\d+$/;
  handleRouteChangedBound;
  constructor() {
    super();
    this.zoneType = "matchs";
    this.title = "Matchs";
    this.icon = "controller";
    this.handleRouteChangedBound = this.handleRouteChanged.bind(this);
  }
  connectedCallback() {
    // Read hash FIRST, before super triggers _render()
    const hash = window.location.hash;
    if (hash.startsWith("#/matchs/")) {
      const id = hash.split("/")[2];
      if (id && MatchsZone.NUMERIC_ID_REGEX.test(id)) {
        this.currentTournamentId = id;
      }
    }
    // NOW call super - _render() will see the correct currentTournamentId
    super.connectedCallback();
    document.addEventListener("route-changed", this.handleRouteChangedBound);
  }
  disconnectedCallback() {
    document.removeEventListener("route-changed", this.handleRouteChangedBound);
    super.disconnectedCallback();
  }
  handleRouteChanged(event) {
    const detail = event.detail;
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
  updateTournamentId(tournamentId) {
    const root = this._renderRoot;
    const pageMatch = root.querySelector("page-match");
    if (pageMatch) {
      pageMatch.setAttribute("tournament-id", tournamentId);
    }
  }
  _render() {
    super._render();
    const root = this._renderRoot;
    const zoneContent = root.querySelector(".zone-content");
    if (zoneContent) {
      // Check if page-match already exists to avoid duplication
      let pageMatch = zoneContent.querySelector("page-match");
      if (!pageMatch) {
        pageMatch = document.createElement("page-match");
        if (this.currentTournamentId) {
          pageMatch.setAttribute("tournament-id", this.currentTournamentId);
        }
        zoneContent.appendChild(pageMatch);
      }
    }
  }
}
customElements.define("matchs-zone", MatchsZone);
