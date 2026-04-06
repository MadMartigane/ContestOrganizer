import { ZoneContainer } from "../zone-container/zone-container.js";
import "../page-config/page-config.js";
/**
 * ConfigZone - Configuration zone component with Shadow DOM support.
 */
export class ConfigZone extends ZoneContainer {
  constructor() {
    super();
    this.zoneType = "config";
    this.title = "Configuration";
    this.icon = "gear";
  }
  _render() {
    super._render();
    const root = this._renderRoot;
    const zoneContent = root.querySelector(".zone-content");
    if (zoneContent && !zoneContent.querySelector("page-config")) {
      const pageConfig = document.createElement("page-config");
      zoneContent.appendChild(pageConfig);
    }
  }
}
customElements.define("config-zone", ConfigZone);
