import { BaseElement } from "@core/base-element.js";
import { html } from "lit-html";
/**
 * MadSwitch - A toggle switch component with animation
 * @element mad-switch
 * @fires mad-change - Fired when the switch toggles, detail: {checked: boolean}
 */
export class MadSwitch extends BaseElement {
  _internals = null;
  static get observedAttributes() {
    return ["checked", "disabled", "size", "name", "value", "help-text"];
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
  _setupProperties() {
    // Properties are handled via getters/setters
  }
  connectedCallback() {
    super.connectedCallback();
    // Set ARIA role via ElementInternals
    if (this._internals) {
      this._internals.role = "switch";
    }
    this._requestRender();
  }
  _handleClick = () => {
    if (this.disabled) {
      return;
    }
    this._toggle();
  };
  _handleKeydown = (event) => {
    if (this.disabled) {
      return;
    }
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      this._toggle();
    }
  };
  _toggle() {
    const newChecked = !this.checked;
    this.checked = newChecked;
    this._requestRender();
    this._emit("mad-change", { checked: newChecked });
  }
  /**
   * Checked state of the switch
   */
  get checked() {
    return this.hasAttribute("checked");
  }
  set checked(value) {
    if (value) {
      this.setAttribute("checked", "");
    } else {
      this.removeAttribute("checked");
    }
  }
  /**
   * Disabled state of the switch
   */
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(value) {
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }
  /**
   * Name for the hidden input (form association)
   */
  get name() {
    return this.getAttribute("name");
  }
  set name(value) {
    value ? this.setAttribute("name", value) : this.removeAttribute("name");
  }
  /**
   * Value for the hidden input (form association)
   */
  get value() {
    return this.getAttribute("value");
  }
  set value(value) {
    value ? this.setAttribute("value", value) : this.removeAttribute("value");
  }
  /**
   * Size of the switch: 'small' | 'medium' | 'large'
   */
  get size() {
    const s = this.getAttribute("size");
    if (s === "small" || s === "large") {
      return s;
    }
    return "medium";
  }
  set size(value) {
    this.setAttribute("size", value);
  }
  _render() {
    const checked = this.checked;
    const disabled = this.disabled;
    const name = this.name;
    const value = this.value ?? "";
    const helpText = this.getAttribute("help-text") ?? "";
    this._renderTemplate(html`
      <style>
        :host {
          display: inline-block;
          vertical-align: middle;
        }

        :host([disabled]) {
          pointer-events: none;
          opacity: 0.6;
        }

        :host([disabled]) .switch {
          cursor: not-allowed;
        }

        :host([disabled]) .thumb {
          cursor: not-allowed;
        }

        .switch {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          outline: none;
        }

        .switch.focus-visible {
          outline: 2px solid #f97316;
          outline-offset: 2px;
        }

        .track {
          position: relative;
          flex-shrink: 0;
          overflow: hidden;
          border-radius: 9999px;
          transition: background-color 200ms ease;
        }

        .track.off {
          background-color: #d1d5db;
        }

        .track.on {
          background-color: #f97316;
        }

        .track.disabled {
          background-color: #9ca3af;
        }

        .thumb {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          border-radius: 50%;
          background-color: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          transition: transform 200ms ease;
        }

        .thumb.off {
          transform: translateY(-50%) translateX(0);
        }

        .thumb.on {
          transform: translateY(-50%) translateX(100%);
        }

        /* Size: small */
        :host([size="small"]) .track {
          width: 36px;
          height: 18px;
        }

        :host([size="small"]) .thumb {
          width: 14px;
          height: 14px;
          left: 2px;
        }

        :host([size="small"]) .thumb.on {
          transform: translateY(-50%) translateX(calc(36px - 14px - 4px));
        }

        /* Size: medium */
        :host(:not([size])) .track,
        :host([size="medium"]) .track {
          width: 48px;
          height: 24px;
        }

        :host(:not([size])) .thumb,
        :host([size="medium"]) .thumb {
          width: 20px;
          height: 20px;
          left: 2px;
        }

        :host(:not([size])) .thumb.on,
        :host([size="medium"]) .thumb.on {
          transform: translateY(-50%) translateX(calc(48px - 20px - 4px));
        }

        /* Size: large */
        :host([size="large"]) .track {
          width: 60px;
          height: 30px;
        }

        :host([size="large"]) .thumb {
          width: 26px;
          height: 26px;
          left: 2px;
        }

        :host([size="large"]) .thumb.on {
          transform: translateY(-50%) translateX(calc(60px - 26px - 4px));
        }

        /* Hidden input for accessibility */
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

        :host([disabled]) ::slotted(*) {
          cursor: not-allowed;
          pointer-events: none;
        }

        .help-text {
          margin: 4px 0 0 0;
          font-size: 0.75rem;
          color: #6b7280;
          display: none;
        }

        .help-text.visible {
          display: block;
        }
      </style>

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
  _onAttributeChange(name, _value) {
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
