import { BaseElement } from "@core/base-element.js";

export class MadCard extends BaseElement {
  static get observedAttributes(): string[] {
    return [];
  }

  protected _setupProperties(): void {
    this._initialized = true;
  }

  protected _render(): void {
    this.innerHTML = `
      <div class="rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
        <div class="px-4 py-3">
          <slot name="header"></slot>
        </div>
        <slot></slot>
        <slot name="footer"></slot>
      </div>
    `;
  }
}

customElements.define("mad-card", MadCard);
