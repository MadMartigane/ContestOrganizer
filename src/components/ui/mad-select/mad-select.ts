import { BaseElement } from "@core/base-element.js";

/**
 * MadSelect - Custom select component
 * Renders a native select element with options from mad-option children
 * @element mad-select
 */
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

  /**
   * Get options from either captured light DOM children or current DOM
   * This handles the case where options are set before connectedCallback runs
   */
  private getOptions(): Element[] {
    // First try to get from captured content (_initialContent from BaseElement)
    const initialContent = (
      this as unknown as { _initialContent: Node[] | null }
    )._initialContent;
    if (initialContent) {
      return Array.from(initialContent).filter(
        (node): node is Element =>
          node instanceof Element && node.tagName === "MAD-OPTION"
      );
    }
    // Fallback to current DOM children (for cases where we haven't captured yet)
    return Array.from(this.querySelectorAll("mad-option"));
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

    // Get options from captured light DOM children
    const options = this.getOptions();
    const optionsHtml = options
      .map((opt) => {
        const val = opt.getAttribute("value") ?? "";
        const text = opt.textContent?.trim() ?? "";
        return `<option value="${val}">${text}</option>`;
      })
      .join("");

    // Get current value to maintain selection
    const currentValue = this.getAttribute("value") ?? "";

    this.innerHTML = `
      ${label ? `<label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">${label}</label>` : ""}
      <select class="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 ${sizeClasses[size] ?? sizeClasses.medium}">
        ${!currentValue && placeholder ? `<option value="" disabled selected>${placeholder}</option>` : ""}
        ${optionsHtml}
      </select>
      ${helpText ? `<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">${helpText}</p>` : ""}
    `;

    const select = this.querySelector("select") as HTMLSelectElement | null;
    if (select) {
      // Restore selected value if present
      if (currentValue) {
        select.value = currentValue;
      }

      select.removeAttribute("data-mad-hook");
      select.addEventListener("change", () => {
        this.value = select.value;
        this._emit("mad-change", { value: this.value });
      });
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
