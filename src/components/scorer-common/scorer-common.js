// /src/components/scorer-common/scorer-common.ts
import { html } from "lit-html";
import { BaseElement } from "../../core/base-element.js";
import { Signal } from "../../core/signal.js";
import scorerCommonStyles from "./scorer-common.css?raw";
export class MadScorerCommon extends BaseElement {
  // Property backing fields
  _min = 0;
  _max;
  _step = 1;
  _value;
  _readonly = false;
  _hidden = false;
  // Event emitter
  _emitChange;
  static get observedAttributes() {
    return ["min", "max", "step", "value", "readonly", "hidden"];
  }
  constructor() {
    super();
    this._emitChange = (value) => {
      this._emit("madNumberChange", { value });
    };
  }
  _setupProperties() {
    // 1. Initialize all signals first
    this._number = new Signal(0);
    // 2. Track all signals
    this._trackSignal(this._number);
    // 3. Mark initialization as complete (REQUIRED)
    this._initialized = true;
  }
  _createRenderRoot() {
    return this.attachShadow({ mode: "open" });
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    switch (name) {
      case "min":
        this._min = newValue === null ? 0 : Number(newValue);
        break;
      case "max":
        this._max = newValue === null ? undefined : Number(newValue);
        break;
      case "step":
        this._step = newValue === null ? 1 : Number(newValue);
        break;
      case "value":
        this._value = newValue === null ? undefined : Number(newValue);
        // Initialize number from value attribute
        if (this._value !== undefined) {
          this._number.value = this._value;
        }
        break;
      case "readonly":
        this._readonly = newValue !== null;
        break;
      case "hidden":
        this._hidden = newValue !== null;
        break;
      default:
        // Unknown attribute - ignore
        break;
    }
    this._requestRender();
  }
  connectedCallback() {
    super.connectedCallback();
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(scorerCommonStyles);
    this._injectStyles(sheet);
    // Initialize number from value or min
    const initialValue = this._value ?? this._min ?? 0;
    this._number.value = initialValue;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  // Public getter for current value (useful for testing/debugging)
  get value() {
    return this._number.value;
  }
  // Hidden property
  get hidden() {
    return this._hidden;
  }
  set hidden(value) {
    this._hidden = value;
    this._requestRender();
  }
  // Internal methods
  _increment() {
    if (this._readonly) {
      return;
    }
    let newValue = this._number.value + this._step;
    if (this._max !== undefined && newValue > this._max) {
      newValue = this._max;
    }
    this._number.value = newValue;
    this._emitChange(String(newValue));
  }
  _decrement() {
    if (this._readonly) {
      return;
    }
    let newValue = this._number.value - this._step;
    if (this._min !== undefined && newValue < this._min) {
      newValue = this._min;
    }
    this._number.value = newValue;
    this._emitChange(String(newValue));
  }
  _handleDecrement = () => {
    this._decrement();
  };
  _handleIncrement = () => {
    this._increment();
  };
  _render() {
    const isReadonly = this._readonly;
    const value = this._number.value;
    this._renderTemplate(html`
      <style>
        :host {
          display: block;
        }
      </style>
      <div part="base" class="scorer-wrapper ${this._hidden ? "hidden" : ""}">
        <div class="flex justify-center items-center gap-4 py-4">
          <mad-button
            variant="warning"
            size="large"
            pill
            ?disabled=${isReadonly}
            aria-label="Decrement score"
            title="Decrease score"
            class="decrement-btn"
            part="button decrement"
            @click=${this._handleDecrement}
          >
            <mad-icon name="dash-lg" slot="prefix" part="icon"></mad-icon>
          </mad-button>

          <span class="text-2xl font-mono font-bold min-w-12 text-center tabular-nums">${value}</span>

          <mad-button
            variant="brand"
            size="large"
            pill
            ?disabled=${isReadonly}
            aria-label="Increment score"
            title="Increase score"
            class="increment-btn"
            part="button increment"
            @click=${this._handleIncrement}
          >
            <mad-icon name="plus-lg" slot="prefix" part="icon"></mad-icon>
          </mad-button>
        </div>
        <slot></slot>
      </div>
    `);
  }
}
// Register the custom element
customElements.define("mad-scorer-common", MadScorerCommon);
