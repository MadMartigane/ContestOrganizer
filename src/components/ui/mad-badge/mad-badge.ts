import { BaseElement } from "@core/base-element.js";

export class MadBadge extends BaseElement {
  static get observedAttributes(): string[] {
    return ["variant", "pill"];
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

  get pill(): boolean {
    return this.hasAttribute("pill");
  }
  set pill(v: boolean) {
    v ? this.setAttribute("pill", "") : this.removeAttribute("pill");
  }

  protected _render(): void {
    const variant = this.variant;
    const pill = this.pill;

    const variantClasses: Record<string, string> = {
      default:
        "bg-neutral-100 text-neutral-700 dark:bg-neutral-600 dark:text-neutral-50",
      brand:
        "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
      success:
        "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
      warning:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
      danger: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
      neutral:
        "bg-neutral-100 text-neutral-700 dark:bg-neutral-600 dark:text-neutral-50",
    };

    const borderRadius = pill ? "rounded-full" : "rounded-md";
    const classes = `inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium ${variantClasses[variant] ?? variantClasses.default} ${borderRadius}`;

    this.innerHTML = `<span class="${classes}"><slot></slot></span>`;
  }
}

customElements.define("mad-badge", MadBadge);
