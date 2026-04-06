import { BaseElement } from "@core/base-element";
import { createComponentSheet } from "@core/styles";
import { html } from "lit-html";

const switchSheet = createComponentSheet(`
  :host {
    display: inline-block;
    vertical-align: middle;
  }

  :host([disabled]) {
    pointer-events: none;
    opacity: 0.6;

    & .switch {
      cursor: not-allowed;
    }

    & .thumb {
      cursor: not-allowed;
    }

    & ::slotted(*) {
      cursor: not-allowed;
      pointer-events: none;
    }
  }

  .switch {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    outline: none;

    &.focus-visible {
      outline: 2px solid #f97316;
      outline-offset: 2px;
    }
  }

  .track {
    position: relative;
    flex-shrink: 0;
    overflow: hidden;
    border-radius: 9999px;
    transition: background-color 200ms ease;

    &.off {
      background-color: #d1d5db;
    }

    &.on {
      background-color: #f97316;
    }

    &.disabled {
      background-color: #9ca3af;
    }
  }

  .thumb {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    border-radius: 50%;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform 200ms ease;

    &.off {
      transform: translateY(-50%) translateX(0);
    }

    &.on {
      transform: translateY(-50%) translateX(100%);
    }
  }

  :host([size="small"]) {
    & .track {
      width: 36px;
      height: 18px;
    }

    & .thumb {
      width: 14px;
      height: 14px;
      left: 2px;

      &.on {
        transform: translateY(-50%) translateX(calc(36px - 14px - 4px));
      }
    }
  }

  :host(:not([size])) {
    & .track {
      width: 48px;
      height: 24px;
    }

    & .thumb {
      width: 20px;
      height: 20px;
      left: 2px;

      &.on {
        transform: translateY(-50%) translateX(calc(48px - 20px - 4px));
      }
    }
  }

  :host([size="medium"]) {
    & .track {
      width: 48px;
      height: 24px;
    }

    & .thumb {
      width: 20px;
      height: 20px;
      left: 2px;

      &.on {
        transform: translateY(-50%) translateX(calc(48px - 20px - 4px));
      }
    }
  }

  :host([size="large"]) {
    & .track {
      width: 60px;
      height: 30px;
    }

    & .thumb {
      width: 26px;
      height: 26px;
      left: 2px;

      &.on {
        transform: translateY(-50%) translateX(calc(60px - 26px - 4px));
      }
    }
  }

  .input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
  }

  ::slotted(*) {
    cursor: pointer;
    user-select: none;
  }

  .help-text {
    margin: 4px 0 0 0;
    font-size: 0.75rem;
    color: #6b7280;
    display: none;

    &.visible {
      display: block;
    }
  }
`);

/**
 * MadSwitch - Toggle switch component with ARIA switch role
 *
 * Observed attributes:
 * - `checked`: When present, switch is on
 * - `disabled`: Disables the switch
 * - `size`: Size — "small" | "medium" | "large" (default: "medium")
 * - `name`: Form field name
 * - `value`: Form field value
 * - `help-text`: Help text displayed below the switch
 *
 * Custom events:
 * - `mad-change`: Fired when switch toggles, detail: { checked: boolean }
 *
 * @element mad-switch
 */
export class MadSwitch extends BaseElement {
  private readonly _internals: ElementInternals | null = null;

  static get observedAttributes() {
    return [
      "checked",
      "disabled",
      "size",
      "name",
      "value",
      "help-text",
    ] as const;
  }

  constructor() {
    super();
    // Set up ElementInternals for ARIA
    try {
      this._internals = this.attachInternals();
    } catch {
      // attachInternals not supported (e.g., in older browsers)
      this._internals = null;
    }
  }

  protected _setupProperties(): void {
    // Properties are handled via getters/setters
  }

  protected _injectStyles(): void {
    super._injectStyles(switchSheet);
  }

  connectedCallback(): void {
    super.connectedCallback();

    // Set ARIA role via ElementInternals
    if (this._internals) {
      this._internals.role = "switch";
    }

    this._requestRender();
  }

  private readonly _handleClick = (): void => {
    if (this.disabled) {
      return;
    }
    this._toggle();
  };

  private readonly _handleKeydown = (event: KeyboardEvent): void => {
    if (this.disabled) {
      return;
    }

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      this._toggle();
    }
  };

  private _toggle(): void {
    const newChecked = !this.checked;
    this.checked = newChecked;
    this._requestRender();
    this._emit("mad-change", { checked: newChecked });
  }

  /**
   * Checked state of the switch
   */
  get checked(): boolean {
    return this.hasAttribute("checked");
  }

  set checked(value: boolean) {
    if (value) {
      this.setAttribute("checked", "");
    } else {
      this.removeAttribute("checked");
    }
  }

  /**
   * Disabled state of the switch
   */
  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean) {
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }

  /**
   * Name for the hidden input (form association)
   */
  get name(): string | null {
    return this.getAttribute("name");
  }

  set name(value: string | null) {
    value ? this.setAttribute("name", value) : this.removeAttribute("name");
  }

  /**
   * Value for the hidden input (form association)
   */
  get value(): string | null {
    return this.getAttribute("value");
  }

  set value(value: string | null) {
    value ? this.setAttribute("value", value) : this.removeAttribute("value");
  }

  /**
   * Size of the switch: 'small' | 'medium' | 'large'
   */
  get size(): "small" | "medium" | "large" {
    const s = this.getAttribute("size");
    if (s === "small" || s === "large") {
      return s;
    }
    return "medium";
  }

  set size(value: "small" | "medium" | "large") {
    this.setAttribute("size", value);
  }

  protected _render(): void {
    const checked = this.checked;
    const disabled = this.disabled;
    const name = this.name;
    const value = this.value ?? "";
    const helpText = this.getAttribute("help-text") ?? "";

    this._renderTemplate(html`
      <div
        class="switch ${disabled ? "" : ""}"
        role="switch"
        aria-checked="${checked}"
        tabindex="0"
        ?disabled=${disabled}
        @click=${this._handleClick}
        @keydown=${this._handleKeydown}
      >
        <input
          type="checkbox"
          class="input"
          ?checked=${checked}
          ?disabled=${disabled}
          .name=${name ?? ""}
          .value=${value}
        />
        <div class="track ${checked ? "on" : "off"} ${disabled ? "disabled" : ""}">
          <div class="thumb ${checked ? "on" : "off"}"></div>
        </div>
        <slot></slot>
      </div>
      <p class="help-text ${helpText ? "visible" : ""}" part="help-text" aria-live="polite">${helpText}</p>
    `);
  }

  protected _onAttributeChange(name: string, _value: string | null): void {
    if (
      name === "checked" ||
      name === "disabled" ||
      name === "size" ||
      name === "name" ||
      name === "value" ||
      name === "help-text"
    ) {
      this._requestRender();
    }
  }
}

customElements.define("mad-switch", MadSwitch);
