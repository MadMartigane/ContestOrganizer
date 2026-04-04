import { BaseElement } from "@core/base-element.js";

const variantClasses: Record<string, string> = {
  default:
    "bg-neutral-50 border-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200",
  danger:
    "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
  warning:
    "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200",
  success:
    "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
  info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200",
};

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display: block; }
  </style>
  <div part="base" class="rounded-lg border p-4 bg-neutral-50 border-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200">
    <slot name="start"></slot>
    <slot></slot>
    <slot name="end"></slot>
  </div>
`;

export class MadCallout extends BaseElement {
  static get observedAttributes(): string[] {
    return ["variant", "open"];
  }

  protected _setupProperties(): void {
    this._initialized = true;
  }

  get variant(): string {
    return this.getAttribute("variant") ?? "default";
  }
  set variant(v: string) {
    v ? this.setAttribute("variant", v) : this.removeAttribute("variant");
  }

  get open(): boolean {
    return this.hasAttribute("open");
  }
  set open(v: boolean) {
    v ? this.setAttribute("open", "") : this.removeAttribute("open");
  }

  protected _onAttributeChange(name: string, _value: string | null): void {
    if (name === "variant") {
      this._updateVariantClasses();
    }
  }

  private _updateVariantClasses(): void {
    const base = this._renderRoot.querySelector('[part="base"]');
    if (!base) {
      return;
    }

    const variant = this.variant;
    const classes = variantClasses[variant] ?? variantClasses.default;
    const baseClasses = "rounded-lg border p-4";
    base.className = `${baseClasses} ${classes}`;
  }

  protected _render(): void {
    const root = this._renderRoot;

    if (!this.open) {
      root.innerHTML = "";
      return;
    }

    if (!root.firstChild) {
      root.appendChild(template.content.cloneNode(true));
    }

    this._updateVariantClasses();
  }
}

customElements.define("mad-callout", MadCallout);
