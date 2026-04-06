import { BaseElement } from "@core/base-element.js";
import { createComponentSheet } from "@core/styles.js";
import { html } from "lit-html";

const tooltipBaseSheet = createComponentSheet(`
  :host {
    display: inline-block;
  }

  :host([hidden]) {
    display: none !important;
  }
`);

const tooltipStylesSheet = createComponentSheet(`
  .tooltip-container {
    position: relative;
    display: inline-block;
  }

  .tooltip-trigger {
    display: inline-block;
  }

  .tooltip-content {
    position: absolute;
    z-index: 50;
    display: none;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: white;
    background-color: #111827;
    border-radius: 0.25rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
    transform: translateX(-50%);
    left: 50%;
  }

  :host([placement="top"]) .tooltip-content {
    bottom: 100%;
    margin-bottom: 0.5rem;
  }

  :host([placement="bottom"]) .tooltip-content {
    top: 100%;
    margin-top: 0.5rem;
  }

  :host([placement="left"]) .tooltip-content {
    right: 100%;
    margin-right: 0.5rem;
    left: auto;
    transform: translateY(-50%);
  }

  :host([placement="right"]) .tooltip-content {
    left: 100%;
    margin-left: 0.5rem;
    left: auto;
    transform: translateY(-50%);
  }

  /* Show on hover and focus-within */
  .tooltip-container:hover .tooltip-content,
  .tooltip-container:focus-within .tooltip-content {
    display: block;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .tooltip-content {
      background-color: #374151;
    }
  }

  /* Slot styles */
  ::slotted(*) {
    display: inline-block;
  }
`);

/**
 * MadTooltip - A tooltip component with keyboard accessibility
 * @element mad-tooltip
 * @fires mad-tooltip-show - Fired when tooltip becomes visible
 * @fires mad-tooltip-hide - Fired when tooltip becomes hidden
 */
export class MadTooltip extends BaseElement {
  static get observedAttributes(): string[] {
    return ["content", "placement"];
  }

  private _tooltipId = "";

  protected _setupProperties(): void {
    // Generate unique ID for aria-describedby
    this._tooltipId = `tooltip-${Math.random().toString(36).slice(2, 9)}`;
  }

  protected _createRenderRoot(): ShadowRoot {
    const root = super._createRenderRoot();
    if (root instanceof ShadowRoot) {
      root.adoptedStyleSheets = [
        ...root.adoptedStyleSheets,
        tooltipBaseSheet,
        tooltipStylesSheet,
      ];
    }
    return root;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._setupAccessibility();
  }

  private _setupAccessibility(): void {
    // Set up aria-describedby on trigger element
    const trigger = this._renderRoot.querySelector(".tooltip-trigger");
    if (trigger) {
      trigger.setAttribute("aria-describedby", this._tooltipId);
    }

    // Set the id on tooltip content
    const content = this._renderRoot.querySelector(".tooltip-content");
    if (content) {
      content.id = this._tooltipId;
    }
  }

  get content(): string {
    return this.getAttribute("content") ?? "";
  }

  set content(v: string) {
    v ? this.setAttribute("content", v) : this.removeAttribute("content");
  }

  get placement(): string {
    return this.getAttribute("placement") ?? "top";
  }

  set placement(v: string) {
    v ? this.setAttribute("placement", v) : this.removeAttribute("placement");
  }

  protected _render(): void {
    this._renderTemplate(html`
      <span class="tooltip-container">
        <span class="tooltip-trigger" tabindex="0">
          <slot></slot>
        </span>
        <span class="tooltip-content" role="tooltip">${this.content}</span>
      </span>
    `);
  }

  protected _onAttributeChange(name: string, _value: string | null): void {
    if (name === "content") {
      this._render();
    }
  }
}

customElements.define("mad-tooltip", MadTooltip);
