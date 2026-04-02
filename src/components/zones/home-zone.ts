import { ZoneContainer } from "../zone-container/zone-container.js";
import "../page-home/page-home.js";

export class HomeZone extends ZoneContainer {
  constructor() {
    super();
    this.zoneType = "home";
    this.title = "Home";
    this.icon = "house";
  }

  protected _render(): void {
    super._render();
    const zoneContent = this.querySelector(".zone-content");
    if (zoneContent) {
      const pageHome = document.createElement("page-home");
      zoneContent.appendChild(pageHome);
    }
  }
}
customElements.define("home-zone", HomeZone);
