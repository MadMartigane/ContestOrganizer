import { ZoneContainer } from "../zone-container/zone-container.js";
import "../page-tournament/page-tournament.js";

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
      const pageTournament = document.createElement("page-tournament");
      zoneContent.appendChild(pageTournament);
    }
  }
}
customElements.define("tournaments-zone", TournamentsZone);
