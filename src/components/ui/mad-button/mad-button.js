import { BaseElement } from "@core/base-element.js";
import { html } from "lit-html";
/**
 * MadButton - A button component with variants, sizes, and accessibility
 * @element mad-button
 * @fires mad-click - Fired when button is activated
 */
export class MadButton extends BaseElement {
  static formAssociated = false;
  static get observedAttributes() {
    return ["variant", "size", "disabled", "pill", "href"];
  }
  _internals;
  constructor() {
    super();
    // Set up ElementInternals for ARIA
    try {
      this._internals = this.attachInternals();
    } catch {
      this._internals = null;
    }
  }
  _setupProperties() {
    // Properties handled via getters/setters
  }
  connectedCallback() {
    super.connectedCallback();
    // Set ARIA role via ElementInternals
    if (this._internals) {
      this._internals.role = "button";
    }
    this._requestRender();
  }
  _handleKeydown = (event) => {
    if (this.disabled) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this._activate();
    }
  };
  _activate() {
    if (this.href) {
      window.location.href = this.href;
    } else {
      this._emit("mad-click", {});
    }
  }
  get variant() {
    return this.getAttribute("variant") ?? "default";
  }
  set variant(value) {
    value
      ? this.setAttribute("variant", value)
      : this.removeAttribute("variant");
  }
  get size() {
    return this.getAttribute("size") ?? "medium";
  }
  set size(value) {
    value ? this.setAttribute("size", value) : this.removeAttribute("size");
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(value) {
    value
      ? this.setAttribute("disabled", "")
      : this.removeAttribute("disabled");
  }
  get pill() {
    return this.hasAttribute("pill");
  }
  set pill(value) {
    value ? this.setAttribute("pill", "") : this.removeAttribute("pill");
  }
  get href() {
    return this.getAttribute("href");
  }
  set href(value) {
    value ? this.setAttribute("href", value) : this.removeAttribute("href");
  }
  _render() {
    this._renderTemplate(html`
      <style>
        :host {
          display: inline-block;
        }

        :host([hidden]) {
          display: none !important;
        }

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
        }

        /* Focus visible styles */
        .button:focus-visible {
          outline: 2px solid #f97316;
          outline-offset: 2px;
        }

        /* Variant: default */
        :host([variant="default"]) .button,
        :host(:not([variant])) .button {
          background-color: #f3f4f6;
          color: #111827;
        }

        :host([variant="default"]) .button:hover,
        :host(:not([variant])) .button:hover {
          background-color: #e5e7eb;
        }

        :host([variant="default"]) .button:focus-visible,
        :host(:not([variant])) .button:focus-visible {
          outline-color: #f97316;
        }

        /* Variant: brand */
        :host([variant="brand"]) .button {
          background-color: #ea580c;
          color: #ffffff;
        }

        :host([variant="brand"]) .button:hover {
          background-color: #c2410c;
        }

        /* Variant: success */
        :host([variant="success"]) .button {
          background-color: #16a34a;
          color: #ffffff;
        }

        :host([variant="success"]) .button:hover {
          background-color: #15803d;
        }

        :host([variant="success"]) .button:focus-visible {
          outline-color: #16a34a;
        }

        /* Variant: warning */
        :host([variant="warning"]) .button {
          background-color: #eab308;
          color: #111827;
        }

        :host([variant="warning"]) .button:hover {
          background-color: #ca8a04;
        }

        :host([variant="warning"]) .button:focus-visible {
          outline-color: #eab308;
        }

        /* Variant: danger */
        :host([variant="danger"]) .button {
          background-color: #dc2626;
          color: #ffffff;
        }

        :host([variant="danger"]) .button:hover {
          background-color: #b91c1c;
        }

        :host([variant="danger"]) .button:focus-visible {
          outline-color: #dc2626;
        }

        /* Variant: secondary */
        :host([variant="secondary"]) .button {
          background-color: #e5e7eb;
          color: #111827;
        }

        :host([variant="secondary"]) .button:hover {
          background-color: #d1d5db;
        }

        /* Size: small */
        :host([size="small"]) .button {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
        }

        /* Size: medium (default) */
        :host([size="medium"]) .button,
        :host(:not([size])) .button {
          padding: 0.5rem 1rem;
          font-size: 1rem;
        }

        /* Size: large */
        :host([size="large"]) .button {
          padding: 0.75rem 1.5rem;
          font-size: 1.125rem;
        }

        /* Border radius */
        :host([pill]) .button {
          border-radius: 9999px;
        }

        :host(:not([pill])) .button {
          border-radius: 0.5rem;
        }

        /* Disabled styles */
        :host([disabled]) .button {
          cursor: not-allowed;
          opacity: 0.5;
        }

        /* Slot styles */
        ::slotted(*) {
          pointer-events: none;
        }
      </style>

      ${
        this.href
          ? html`<a class="button" href=${this.href} @click=${this._activate}><slot name="start"></slot><slot></slot><slot name="end"></slot></a>`
          : html`<button class="button" type="button" ?disabled=${this.disabled} @click=${this._activate} @keydown=${this._handleKeydown}><slot name="start"></slot><slot></slot><slot name="end"></slot></button>`
      }
    `);
  }
  _onAttributeChange(name, _value) {
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
