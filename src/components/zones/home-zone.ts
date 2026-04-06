import { html } from "lit-html";
import { ZoneContainer } from "../zone-container/zone-container.js";
import "../page-home/page-home.js";

/**
 * HomeZone - Home zone component that renders page-home inside the zone container.
 * Uses Shadow DOM with lit-html rendering.
 * @element home-zone
 * @observedAttributes None - uses JavaScript properties (zoneType, title, icon)
 * @fires None
 */
export class HomeZone extends ZoneContainer {
  constructor() {
    super();
    this.zoneType = "home";
    this.title = "Home";
    this.icon = "house";
  }

  protected _render(): void {
    const zoneType = this.zoneType;
    const title = this.title;
    const icon = this.icon;
    const isFocused = this._isFocused();
    const isCollapsed = this._isCollapsed();
    const showFocusButton = !(isFocused || isCollapsed);

    this._renderTemplate(html`
      ${this._getStyles()}
      <div part="base" class="zone-container zone-${zoneType}" data-focused="${isFocused}">
        <header part="header" class="zone-header">
          <mad-icon name="${icon}"></mad-icon>
          <h2 part="title">${title}</h2>
          <button
            part="focus-btn"
            class="focus-btn"
            aria-label="Focus ${title} zone"
            ?hidden=${!showFocusButton}
            @click=${this._handleFocus}
          >
            <mad-icon name="expand"></mad-icon>
          </button>
        </header>
        <div part="content" class="zone-content">
          <page-home></page-home>
        </div>
      </div>
    `);
  }
}
customElements.define("home-zone", HomeZone);
