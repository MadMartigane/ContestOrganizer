import { BaseElement } from "@core/base-element";
import { spinnerSheet } from "@core/styles";
import { html } from "lit-html";

/**
 * MadSpinner - Animated loading spinner indicator
 *
 * Observed attributes: none
 *
 * @element mad-spinner
 */
export class MadSpinner extends BaseElement {
  static get observedAttributes() {
    return [] as const;
  }

  protected _setupProperties(): void {
    // No signals needed — properties handled via attributes/getters
  }

  protected _injectStyles(): void {
    super._injectStyles(spinnerSheet);
  }

  protected _render(): void {
    this._renderTemplate(html`
      <svg part="base" class="h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" role="status" aria-label="Loading">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    `);
  }
}

customElements.define("mad-spinner", MadSpinner);
