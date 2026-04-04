import { BaseElement } from "@core/base-element.js";

export class MadSelect extends BaseElement {
  static get observedAttributes(): string[] {
    return ["label", "placeholder", "size", "help-text", "value"];
  }

  protected _setupProperties(): void {
    this._initialized = true;
  }

  get value(): string {
    return this.getAttribute("value") ?? "";
  }
  set value(v: string) {
    this.setAttribute("value", v);
  }

  protected _render(): void {
    const label = this.getAttribute("label") ?? "";
    const placeholder = this.getAttribute("placeholder") ?? "";
    const size = this.getAttribute("size") ?? "medium";
    const helpText = this.getAttribute("help-text") ?? "";

    const sizeClasses: Record<string, string> = {
      small: "px-3 py-1.5 text-sm",
      medium: "px-4 py-2 text-base",
      large: "px-4 py-3 text-lg",
    };

    const options = Array.from(this.querySelectorAll("mad-option"));
    const optionsHtml = options
      .map((opt) => {
        const val = opt.getAttribute("value") ?? "";
        const text = opt.textContent?.trim() ?? "";
        return `<option value="${val}">${text}</option>`;
      })
      .join("");

    this.innerHTML = `
      ${label ? `<label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">${label}</label>` : ""}
      <select class="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 ${sizeClasses[size] ?? sizeClasses.medium}">
        ${placeholder ? `<option value="" disabled selected>${placeholder}</option>` : ""}
        ${optionsHtml}
      </select>
      ${helpText ? `<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">${helpText}</p>` : ""}
    `;

    const select = this.querySelector("select") as HTMLSelectElement | null;
    select?.removeAttribute("data-mad-hook");
    select?.addEventListener("change", () => {
      this.value = select.value;
      this._emit("mad-change", { value: this.value });
    });
    if (select) {
      select.dataset.madHook = "true";
    }
  }
}

customElements.define("mad-select", MadSelect);

export class MadOption extends BaseElement {
  static get observedAttributes(): string[] {
    return ["value"];
  }

  protected _setupProperties(): void {
    this._initialized = true;
  }

  protected _render(): void {
    // Content rendered by parent select
  }
}

customElements.define("mad-option", MadOption);
