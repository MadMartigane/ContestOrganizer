import { BaseElement } from "@core/base-element";
import { html } from "lit-html";

/**
 * MadCard - Container card with header, body, and footer slots
 *
 * Observed attributes: none
 *
 * Slots:
 * - `header`: Card header content
 * - default: Card body content
 * - `footer`: Card footer content
 *
 * @element mad-card
 */
export class MadCard extends BaseElement {
  static get observedAttributes() {
    return [] as const;
  }

  protected _setupProperties(): void {
    // No signals needed — properties handled via attributes/getters
  }

  protected _render(): void {
    this._renderTemplate(html`
      <div part="base" class="rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
        <div part="header" class="px-4 py-3">
          <slot name="header"></slot>
        </div>
        <slot></slot>
        <div part="footer" class="px-4 py-3">
          <slot name="footer"></slot>
        </div>
      </div>
    `);
  }
}

customElements.define("mad-card", MadCard);
