import { BaseElement } from "@core/base-element.js";

export class MadButton extends BaseElement {
  static get observedAttributes(): string[] {
    return ["variant", "size", "disabled", "pill", "href"];
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

  get size(): string {
    return this.getAttribute("size") ?? "medium";
  }
  set size(v: string) {
    v ? this.setAttribute("size", v) : this.removeAttribute("size");
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }
  set disabled(v: boolean) {
    v ? this.setAttribute("disabled", "") : this.removeAttribute("disabled");
  }

  get pill(): boolean {
    return this.hasAttribute("pill");
  }
  set pill(v: boolean) {
    v ? this.setAttribute("pill", "") : this.removeAttribute("pill");
  }

  get href(): string | null {
    return this.getAttribute("href");
  }
  set href(v: string | null) {
    v ? this.setAttribute("href", v) : this.removeAttribute("href");
  }

  protected _render(): void {
    const variant = this.variant;
    const size = this.size;
    const disabled = this.disabled;
    const pill = this.pill;
    const href = this.href;

    const variantClasses: Record<string, string> = {
      default:
        "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700",
      brand:
        "bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600",
      success:
        "bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600",
      warning:
        "bg-yellow-500 text-neutral-900 hover:bg-yellow-600 dark:bg-yellow-400",
      danger:
        "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
      secondary:
        "bg-neutral-200 text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600",
    };

    const sizeClasses: Record<string, string> = {
      small: "px-3 py-1.5 text-sm",
      medium: "px-4 py-2 text-base",
      large: "px-6 py-3 text-lg",
    };

    const baseClasses =
      "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    const borderRadius = pill ? "rounded-full" : "rounded-lg";
    const classes = `${baseClasses} ${variantClasses[variant] ?? variantClasses.default} ${sizeClasses[size] ?? sizeClasses.medium} ${borderRadius}`;

    if (href) {
      this.innerHTML = `<a href="${href}" class="${classes}" ${disabled ? 'aria-disabled="true" tabindex="-1"' : ""}><slot name="start"></slot><slot></slot><slot name="end"></slot></a>`;
    } else {
      this.innerHTML = `<button class="${classes}" ${disabled ? "disabled" : ""}><slot name="start"></slot><slot></slot><slot name="end"></slot></button>`;
    }
  }
}

customElements.define("mad-button", MadButton);
