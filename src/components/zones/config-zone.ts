import { ZoneContainer } from "../zone-container/zone-container.js";
import "../page-config/page-config.js";

export class ConfigZone extends ZoneContainer {
  constructor() {
    super();
    this.zoneType = "config";
    this.title = "Configuration";
    this.icon = "gear";
  }

  protected _render(): void {
    super._render();
    const zoneContent = this.querySelector(".zone-content");
    if (zoneContent) {
      const pageConfig = document.createElement("page-config");
      zoneContent.appendChild(pageConfig);
    }
  }
}
customElements.define("config-zone", ConfigZone);
