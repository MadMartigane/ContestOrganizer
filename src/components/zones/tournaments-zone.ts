import { html } from "lit-html";
import { ZoneContainer } from "../zone-container/zone-container";
import "../page-tournament-select/page-tournament-select";

/**
 * TournamentsZone - Tournaments selection zone component that renders page-tournament-select inside the zone container.
 *
 * Observed attributes: none
 *
 * Custom events: none
 *
 * @element tournaments-zone
 */
export class TournamentsZone extends ZoneContainer {
  constructor() {
    super();
    this.zoneType = "tournaments";
    this.title = "Tournaments";
    this.icon = "trophy";
  }

  protected _render(): void {
    const zoneType = this.zoneType;
    const title = this.title;
    const icon = this.icon;
    const isFocused = this._isFocused();
    const isCollapsed = this._isCollapsed();
    const showFocusButton = !(isFocused || isCollapsed);

    this._renderTemplate(html`
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
          <page-tournament-select></page-tournament-select>
        </div>
      </div>
    `);
  }
}
customElements.define("tournaments-zone", TournamentsZone);
