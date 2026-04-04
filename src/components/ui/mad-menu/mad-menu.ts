import { BaseElement } from "@core/base-element.js";

export class MadMenu extends BaseElement {
  static get observedAttributes(): string[] {
    return [];
  }

  protected _setupProperties(): void {
    this._initialized = true;
  }

  protected _render(): void {
    this.innerHTML = `<div class="divide-y divide-neutral-200 dark:divide-neutral-700"><slot></slot></div>`;

    const items = Array.from(
      this.querySelectorAll<HTMLElement>("mad-menu-item")
    );
    for (const item of items) {
      if (!item.dataset.madHook) {
        item.addEventListener("click", () => {
          this._emit("mad-select", { item });
        });
        item.dataset.madHook = "true";
      }
    }
  }
}

customElements.define("mad-menu", MadMenu);

export class MadMenuItem extends BaseElement {
  static get observedAttributes(): string[] {
    return [];
  }

  protected _setupProperties(): void {
    this._initialized = true;
  }

  protected _render(): void {
    this.innerHTML = `<div class="flex items-center justify-between gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"><slot></slot><slot name="end"></slot></div>`;
  }
}

customElements.define("mad-menu-item", MadMenuItem);
