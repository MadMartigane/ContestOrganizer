import { BaseElement } from "@core/base-element.js";
import { html, nothing } from "lit-html";

const variantClasses = {
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
export class MadCallout extends BaseElement {
  static get observedAttributes() {
    return ["variant", "open"];
  }
  _setupProperties() {
    this._initialized = true;
  }
  get variant() {
    return this.getAttribute("variant") ?? "default";
  }
  set variant(v) {
    v ? this.setAttribute("variant", v) : this.removeAttribute("variant");
  }
  get open() {
    return this.hasAttribute("open");
  }
  set open(v) {
    v ? this.setAttribute("open", "") : this.removeAttribute("open");
  }
  _onAttributeChange(name, _value) {
    if (name === "variant") {
      this._requestRender();
    }
  }
  _render() {
    if (!this.open) {
      this._renderTemplate(html`${nothing}`);
      return;
    }
    const variant = this.variant;
    const classes = variantClasses[variant] ?? variantClasses.default;
    const baseClasses = "rounded-lg border p-4";
    this._renderTemplate(html`
      <style>
        :host { display: block; }
      </style>
      <div part="base" class="${baseClasses} ${classes}">
        <slot name="start"></slot>
        <slot></slot>
        <slot name="end"></slot>
      </div>
    `);
  }
}
customElements.define("mad-callout", MadCallout);
