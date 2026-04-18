import { BaseElement } from "@core/base-element";
import { createComponentSheet } from "@core/styles";
import { html } from "lit-html";

const tooltipSheet = createComponentSheet(`
  :host {
    display: inline-block;
  }

  :host([hidden]) {
    display: none !important;
  }

  .tooltip-trigger {
    display: inline-block;
    anchor-name: --tooltip-trigger;
  }

  .tooltip-content {
    position: fixed;
    position-anchor: --tooltip-trigger;
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
  }

  :host([placement="top"]) .tooltip-content {
    position-area: block end center;
    margin-bottom: 0.5rem;
  }

  :host([placement="bottom"]) .tooltip-content {
    position-area: block start center;
    margin-top: 0.5rem;
  }

  :host([placement="left"]) .tooltip-content {
    position-area: inline end center;
    margin-right: 0.5rem;
  }

  :host([placement="right"]) .tooltip-content {
    position-area: inline start center;
    margin-left: 0.5rem;
  }

  /* Show on hover and focus-within */
  .tooltip-trigger:hover + .tooltip-content,
  .tooltip-trigger:focus-within + .tooltip-content {
    display: block;
  }

  :host(.dark) .tooltip-content {
    background-color: #374151;
  }

  ::slotted(*) {
    display: inline-block;
  }
`);

/**
 * MadTooltip - Tooltip component with keyboard accessibility
 *
 * Observed attributes:
 * - `content`: Tooltip text content
 * - `placement`: Position — "top" | "bottom" | "left" | "right" (default: "top")
 *
 * Custom events:
 * - `mad-tooltip-show`: Fired when tooltip becomes visible
 * - `mad-tooltip-hide`: Fired when tooltip becomes hidden
 *
 * @element mad-tooltip
 */
export class MadTooltip extends BaseElement {
  static get observedAttributes() {
    return ["content", "placement"] as const;
  }

  private _tooltipId = "";

  protected _setupProperties(): void {
    // Generate unique ID for aria-describedby
    this._tooltipId = `tooltip-${Math.random().toString(36).slice(2, 9)}`;
  }

  protected _injectStyles(): void {
    super._injectStyles(tooltipSheet);
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
      <span class="tooltip-trigger" tabindex="0" aria-describedby=${this._tooltipId}>
        <slot></slot>
      </span>
      <span class="tooltip-content" role="tooltip" id=${this._tooltipId}>${this.content}</span>
    `);
  }

  protected _onAttributeChange(name: string, _value: string | null): void {
    if (name === "content") {
      const update = (): void => this._render();

      if (
        (
          document as Document & {
            startViewTransition?: (cb: () => void) => unknown;
          }
        ).startViewTransition
      ) {
        try {
          document.startViewTransition(() => update());
        } catch {
          update();
        }
      } else {
        update();
      }
    }
  }
}

customElements.define("mad-tooltip", MadTooltip);
