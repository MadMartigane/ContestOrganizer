import { BaseElement } from "@core/base-element.js";

const template = document.createElement("template");
template.innerHTML = `
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
`;

export class MadCard extends BaseElement {
  static get observedAttributes(): string[] {
    return [];
  }

  protected _setupProperties(): void {
    this._initialized = true;
  }

  protected _render(): void {
    const root = this._renderRoot;
    if (!root.firstChild) {
      root.appendChild(template.content.cloneNode(true));
    }
  }
}

customElements.define("mad-card", MadCard);
