import { BaseElement } from "@core/base-element.js";
import { Signal } from "@core/signal.js";
import { html, nothing } from "lit-html";
import scorerBasketStyles from "./scorer-basket.css?raw";

const POINTS = [1, 2, 3];
export class MadScorerBasket extends BaseElement {
  // Property backing fields
  _min;
  _max;
  _value;
  _readonly = false;
  static get observedAttributes() {
    return ["min", "max", "value", "readonly"];
  }
  _setupProperties() {
    this._number = new Signal(0);
    this._minusMode = new Signal(false);
    this._trackSignal(this._number);
    this._trackSignal(this._minusMode);
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
        this._min = newValue === null ? undefined : Number(newValue);
        break;
      case "max":
        this._max = newValue === null ? undefined : Number(newValue);
        break;
      case "value":
        this._value = newValue === null ? undefined : Number(newValue);
        this._number.value = this._value ?? this._min ?? 0;
        break;
      case "readonly":
        this._readonly = newValue !== null;
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
    sheet.replaceSync(scorerBasketStyles);
    this._injectStyles(sheet);
    const initialValue = this._value ?? this._min ?? 0;
    this._number.value = initialValue;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  _handleButtonClick = (points) => () => {
    this._onIncrement(points);
  };
  _handleSwitchChange = () => {
    this._onSwitchToggle();
  };
  _onIncrement(points) {
    if (this._readonly) {
      return;
    }
    if (this._minusMode.value) {
      this._number.value -= points;
    } else {
      this._number.value += points;
    }
    if (this._max !== undefined && this._number.value >= this._max) {
      this._number.value = this._max;
    }
    if (this._min !== undefined && this._number.value <= this._min) {
      this._number.value = this._min;
    }
    this._emit("madNumberChange", { value: String(this._number.value) });
  }
  _onSwitchToggle() {
    this._minusMode.value = !this._minusMode.value;
  }
  _render() {
    if (this._readonly) {
      this._renderTemplate(html`${nothing}`);
      return;
    }
    const minusMode = this._minusMode.value;
    const iconName = minusMode ? "minus" : "plus";
    const variant = minusMode ? "warning" : "brand";
    this._renderTemplate(html`
      <style>
        :host {
          display: block;
        }
      </style>
      <div part="base" class="scorer-grid">
        <div class="my-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          ${POINTS.map(
            (points) => html`
              <mad-button
                data-points="${points}"
                size="large"
                variant="${variant}"
                part="button"
                @click=${this._handleButtonClick(points)}
              >
                <mad-icon
                  class="xl"
                  name="${iconName}"
                  slot="start"
                  part="icon"
                ></mad-icon>
                <span slot="end">${points}</span>
              </mad-button>
            `
          )}
          <mad-switch
            id="plus-minus-switch"
            ?checked=${!minusMode}
            help-text="Ajouter/Supprimer des points"
            size="large"
            part="switch"
            @mad-change=${this._handleSwitchChange}
          >
            <mad-icon class="xl" name="plus-slash-minus"></mad-icon>
          </mad-switch>
        </div>
        <slot></slot>
      </div>
    `);
  }
}
customElements.define("mad-scorer-basket", MadScorerBasket);
