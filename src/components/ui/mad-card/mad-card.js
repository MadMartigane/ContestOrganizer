import { BaseElement } from "@core/base-element.js";
import { html } from "lit-html";
export class MadCard extends BaseElement {
  static get observedAttributes() {
    return [];
  }
  _setupProperties() {
    this._initialized = true;
  }
  _render() {
    this._renderTemplate(html`
      <style>
        :host { display: block; }
      </style>
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
