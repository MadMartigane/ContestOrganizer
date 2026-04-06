import { ZoneContainer } from "../zone-container/zone-container.js";
import "../page-tournament-select/page-tournament-select.js";
/**
 * TournamentsZone - Tournaments selection zone component with Shadow DOM support.
 */
export class TournamentsZone extends ZoneContainer {
  constructor() {
    super();
    this.zoneType = "tournaments";
    this.title = "Tournaments";
    this.icon = "trophy";
  }
  _render() {
    super._render();
    const root = this._renderRoot;
    const zoneContent = root.querySelector(".zone-content");
    if (zoneContent && !zoneContent.querySelector("page-tournament-select")) {
      const pageTournamentSelect = document.createElement(
        "page-tournament-select"
      );
      zoneContent.appendChild(pageTournamentSelect);
    }
  }
}
customElements.define("tournaments-zone", TournamentsZone);
