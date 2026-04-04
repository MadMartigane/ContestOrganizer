import { BaseElement } from "@core/base-element.js";

export class MadTooltip extends BaseElement {
  static get observedAttributes(): string[] {
    return ["content", "placement"];
  }

  protected _setupProperties(): void {
    this._initialized = true;
  }

  get content(): string {
    return this.getAttribute("content") ?? "";
  }
  set content(v: string) {
    v ? this.setAttribute("content", v) : this.removeAttribute("content");
  }

  protected _render(): void {
    const content = this.content;
    this.innerHTML = `
      <span class="relative inline-block group">
        <slot></slot>
        <span class="absolute z-50 hidden group-hover:block px-2 py-1 text-xs font-medium text-white bg-neutral-900 rounded shadow-lg dark:bg-neutral-700 whitespace-nowrap bottom-full left-1/2 -translate-x-1/2 mb-2">${content}</span>
      </span>
    `;
  }
}

customElements.define("mad-tooltip", MadTooltip);
