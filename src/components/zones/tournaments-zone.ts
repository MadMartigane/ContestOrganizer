import { ZoneContainer } from "../zone-container/zone-container.js";
import "../page-tournament-select/page-tournament-select.js";

export class TournamentsZone extends ZoneContainer {
  constructor() {
    super();
    this.zoneType = "tournaments";
    this.title = "Tournaments";
    this.icon = "trophy";
  }

  protected _render(): void {
    super._render();
    const zoneContent = this.querySelector(".zone-content");
    if (zoneContent) {
      // Clear previous content to prevent duplication on re-render
      zoneContent.innerHTML = "";
      const pageTournamentSelect = document.createElement(
        "page-tournament-select"
      );
      zoneContent.appendChild(pageTournamentSelect);
    }
  }
}
customElements.define("tournaments-zone", TournamentsZone);
