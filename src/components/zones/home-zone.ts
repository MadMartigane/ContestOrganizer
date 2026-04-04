import { ZoneContainer } from "../zone-container/zone-container.js";
import "../page-home/page-home.js";

/**
 * HomeZone - Home zone component with Shadow DOM support.
 */
export class HomeZone extends ZoneContainer {
  constructor() {
    super();
    this.zoneType = "home";
    this.title = "Home";
    this.icon = "house";
  }

  protected _render(): void {
    super._render();
    const root = this._renderRoot;
    const zoneContent = root.querySelector(".zone-content");
    if (zoneContent && !zoneContent.querySelector("page-home")) {
      const pageHome = document.createElement("page-home");
      zoneContent.appendChild(pageHome);
    }
  }
}
customElements.define("home-zone", HomeZone);
