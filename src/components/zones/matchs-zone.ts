import { ZoneContainer } from "../zone-container/zone-container.js";
import "../page-match/page-match.js";

export class MatchsZone extends ZoneContainer {
  constructor() {
    super();
    this.zoneType = "matchs";
    this.title = "Matchs";
    this.icon = "controller";
  }

  protected _render(): void {
    super._render();
    const zoneContent = this.querySelector(".zone-content");
    if (zoneContent) {
      const pageMatch = document.createElement("page-match");
      zoneContent.appendChild(pageMatch);
    }
  }
}
customElements.define("matchs-zone", MatchsZone);
