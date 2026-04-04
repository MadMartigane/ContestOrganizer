import { BaseElement } from "@core/base-element.js";

export class MadInput extends BaseElement {
  static get observedAttributes(): string[] {
    return [
      "type",
      "value",
      "placeholder",
      "label",
      "size",
      "disabled",
      "readonly",
      "autofocus",
      "autocomplete",
      "min",
      "max",
      "step",
      "minlength",
      "name",
      "no-spin-buttons",
    ];
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

  private _getInputClasses(): string {
    const size = this.getAttribute("size") ?? "medium";
    const disabled = this.hasAttribute("disabled");
    const noSpinButtons = this.hasAttribute("no-spin-buttons");

    const sizeClasses: Record<string, string> = {
      small: "px-3 py-1.5 text-sm",
      medium: "px-4 py-2 text-base",
      large: "px-4 py-3 text-lg",
    };

    const base =
      "w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:border-orange-400";
    const sizeCls = sizeClasses[size] ?? sizeClasses.medium;
    const disabledCls = disabled ? "opacity-50 cursor-not-allowed" : "";
    const spinCls = noSpinButtons
      ? "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
      : "";

    return `${base} ${sizeCls} ${disabledCls} ${spinCls}`;
  }

  protected _render(): void {
    const type = this.getAttribute("type") ?? "text";
    const label = this.getAttribute("label") ?? "";
    const inputClasses = this._getInputClasses();

    const attrs = this._buildInputAttrs();

    this.innerHTML = `
      ${label ? `<label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">${label}</label>` : ""}
      <input type="${type}" class="${inputClasses}" ${attrs} />
    `;
  }

  private _buildInputAttrs(): string {
    const parts: string[] = [];

    const value = this.value;
    const placeholder = this.getAttribute("placeholder") ?? "";
    const autocomplete = this.getAttribute("autocomplete") ?? "off";

    parts.push(`value="${this._escapeAttr(value)}"`);
    parts.push(`placeholder="${this._escapeAttr(placeholder)}"`);
    parts.push(`autocomplete="${autocomplete}"`);

    if (this.hasAttribute("disabled")) {
      parts.push("disabled");
    }
    if (this.hasAttribute("readonly")) {
      parts.push("readonly");
    }
    if (this.hasAttribute("autofocus")) {
      parts.push("autofocus");
    }

    const optional = ["min", "max", "step", "minlength", "name"] as const;
    for (const attr of optional) {
      const val = this.getAttribute(attr);
      if (val) {
        parts.push(`${attr}="${this._escapeAttr(val)}"`);
      }
    }

    return parts.join(" ");
  }

  private _escapeAttr(str: string): string {
    return str
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
}

customElements.define("mad-input", MadInput);
