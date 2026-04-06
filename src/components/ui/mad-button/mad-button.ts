import { BaseElement } from "@core/base-element";
import { createComponentSheet } from "@core/styles";
import { html } from "lit-html";

const buttonSheet = createComponentSheet(`
  :host([disabled]) {
    pointer-events: none;
    opacity: 0.5;
  }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-family: inherit;
    font-weight: 500;
    transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
    cursor: pointer;
    border: none;
    outline: none;
    text-decoration: none;

    &:focus-visible {
      outline: 2px solid #f97316;
      outline-offset: 2px;
    }
  }

  :host([variant="default"]),
  :host(:not([variant])) {
    & .button {
      background-color: #f3f4f6;
      color: #111827;

      &:hover {
        background-color: #e5e7eb;
      }

      &:focus-visible {
        outline-color: #f97316;
      }
    }
  }

  :host([variant="brand"]) {
    & .button {
      background-color: #ea580c;
      color: #ffffff;

      &:hover {
        background-color: #c2410c;
      }
    }
  }

  :host([variant="success"]) {
    & .button {
      background-color: #16a34a;
      color: #ffffff;

      &:hover {
        background-color: #15803d;
      }

      &:focus-visible {
        outline-color: #16a34a;
      }
    }
  }

  :host([variant="warning"]) {
    & .button {
      background-color: #eab308;
      color: #111827;

      &:hover {
        background-color: #ca8a04;
      }

      &:focus-visible {
        outline-color: #eab308;
      }
    }
  }

  :host([variant="danger"]) {
    & .button {
      background-color: #dc2626;
      color: #ffffff;

      &:hover {
        background-color: #b91c1c;
      }

      &:focus-visible {
        outline-color: #dc2626;
      }
    }
  }

  :host([variant="secondary"]) {
    & .button {
      background-color: #e5e7eb;
      color: #111827;

      &:hover {
        background-color: #d1d5db;
      }
    }
  }

  :host([size="small"]) {
    & .button {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
    }
  }

  :host([size="medium"]),
  :host(:not([size])) {
    & .button {
      padding: 0.5rem 1rem;
      font-size: 1rem;
    }
  }

  :host([size="large"]) {
    & .button {
      padding: 0.75rem 1.5rem;
      font-size: 1.125rem;
    }
  }

  :host([pill]) {
    & .button {
      border-radius: 9999px;
    }
  }

  :host(:not([pill])) {
    & .button {
      border-radius: 0.5rem;
    }
  }

  :host([disabled]) {
    & .button {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  ::slotted(*) {
    pointer-events: none;
  }
`);

/**
 * MadButton - Button component with variants, sizes, and link support
 *
 * Observed attributes:
 * - `variant`: Color variant — "default" | "brand" | "success" | "warning" | "danger" | "secondary" (default: "default")
 * - `size`: Size — "small" | "medium" | "large" (default: "medium")
 * - `disabled`: When present, disables the button
 * - `pill`: When present, renders with fully rounded corners
 * - `href`: When set, renders as an anchor link instead of a button
 *
 * Custom events:
 * - `mad-click`: Fired when button is activated (not fired for href mode)
 *
 * @element mad-button
 */
export class MadButton extends BaseElement {
  static formAssociated = false;

  static get observedAttributes() {
    return ["variant", "size", "disabled", "pill", "href"] as const;
  }

  private readonly _internals: ElementInternals | null;

  constructor() {
    super();

    // Set up ElementInternals for ARIA
    try {
      this._internals = this.attachInternals();
    } catch {
      this._internals = null;
    }
  }

  protected _setupProperties(): void {
    // Properties handled via getters/setters
  }

  connectedCallback(): void {
    super.connectedCallback();

    // Set ARIA role via ElementInternals
    if (this._internals) {
      this._internals.role = "button";
    }

    this._requestRender();
  }

  private readonly _handleKeydown = (event: KeyboardEvent): void => {
    if (this.disabled) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this._activate();
    }
  };

  private _activate(): void {
    if (this.href) {
      window.location.href = this.href;
    } else {
      this._emit("mad-click", {});
    }
  }

  get variant(): string {
    return this.getAttribute("variant") ?? "default";
  }

  set variant(value: string) {
    value
      ? this.setAttribute("variant", value)
      : this.removeAttribute("variant");
  }

  get size(): string {
    return this.getAttribute("size") ?? "medium";
  }

  set size(value: string) {
    value ? this.setAttribute("size", value) : this.removeAttribute("size");
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean) {
    value
      ? this.setAttribute("disabled", "")
      : this.removeAttribute("disabled");
  }

  get pill(): boolean {
    return this.hasAttribute("pill");
  }

  set pill(value: boolean) {
    value ? this.setAttribute("pill", "") : this.removeAttribute("pill");
  }

  get href(): string | null {
    return this.getAttribute("href");
  }

  set href(value: string | null) {
    value ? this.setAttribute("href", value) : this.removeAttribute("href");
  }

  protected _injectStyles(): void {
    super._injectStyles(buttonSheet);
  }

  protected _render(): void {
    this._renderTemplate(html`
      ${
        this.href
          ? html`<a class="button" href=${this.href} @click=${this._activate}><slot name="start"></slot><slot></slot><slot name="end"></slot></a>`
          : html`<button class="button" type="button" ?disabled=${this.disabled} @click=${this._activate} @keydown=${this._handleKeydown}><slot name="start"></slot><slot></slot><slot name="end"></slot></button>`
      }
    `);
  }

  protected _onAttributeChange(name: string, _value: string | null): void {
    if (
      name === "href" ||
      name === "disabled" ||
      name === "variant" ||
      name === "size" ||
      name === "pill"
    ) {
      this._requestRender();
    }
  }
}

customElements.define("mad-button", MadButton);
