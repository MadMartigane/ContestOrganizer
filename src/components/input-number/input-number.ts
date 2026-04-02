import { BaseElement } from "@core/base-element.js";
import { Signal } from "@core/signal.js";
import uuid from "../../modules/uuid/uuid.js";

/**
 * MadInputNumber - Number input component with increment/decrement buttons
 * @element mad-input-number
 */
export class MadInputNumber extends BaseElement {
  private readonly itemId: string;
  private domInput: HTMLInputElement | null = null;

  private _placeholder = "";
  private _label: string | undefined;
  private _min = 0;
  private _max: number | undefined;
  private _step: number | undefined;
  private _value: number | undefined;
  private _readonly = false;

  private declare _number: Signal<number>;

  constructor() {
    super();
    this.itemId = `mad_input_number_${uuid.new()}`;
  }

  static get observedAttributes(): string[] {
    return ["placeholder", "label", "min", "max", "step", "value", "readonly"];
  }

  protected _setupProperties(): void {
    this._placeholder = this.getAttribute("placeholder") || "";
    this._label = this.getAttribute("label") || undefined;
    this._min =
      this.getAttribute("min") === null ? 0 : Number(this.getAttribute("min"));
    this._max =
      this.getAttribute("max") === null
        ? undefined
        : Number(this.getAttribute("max"));
    this._step =
      this.getAttribute("step") === null
        ? undefined
        : Number(this.getAttribute("step"));
    this._value =
      this.getAttribute("value") === null
        ? undefined
        : Number(this.getAttribute("value"));
    this._readonly = this.hasAttribute("readonly");

    this._number = new Signal<number>(this._value || this._min || 0);
    this._trackSignal(this._number);

    this._initialized = true;
  }

  protected _onAttributeChange(name: string, value: string | null): void {
    switch (name) {
      case "value": {
        this._value = value === null ? undefined : Number(value);
        this._number.value = this._value || 0;
        break;
      }
      case "min": {
        this._min = value === null ? 0 : Number(value);
        break;
      }
      case "max": {
        this._max = value === null ? undefined : Number(value);
        break;
      }
      case "step": {
        this._step = value === null ? undefined : Number(value);
        break;
      }
      case "placeholder": {
        this._placeholder = value || "";
        break;
      }
      case "label": {
        this._label = value || undefined;
        break;
      }
      case "readonly": {
        this._readonly = value !== null;
        break;
      }
      default: {
        break;
      }
    }
    this._requestRender();
  }

  protected _render(): void {
    const inputId = this.itemId;
    const numberValue = this._number.value;

    this.innerHTML = `
      <style>
        .button-group {
          display: flex;
          gap: 0.5rem;
        }
      </style>
      <span class="container-xl">
        <span class="container-xl">
          <wa-input
            autocomplete="off"
            autofocus
            id="${inputId}"
            label="${this._label || ""}"
            max="${this._max === undefined ? "" : this._max}"
            min="${this._min}"
            no-spin-buttons
            placeholder="${this._placeholder || "Score"}"
            ${this._readonly ? "readonly" : ""}
            size="large"
            step="${this._step === undefined ? "" : this._step}"
            type="number"
            value="${numberValue}"
          ></wa-input>
        </span>
        <span class="container-xl">
          <div class="button-group">
            <wa-button
              class="decrement-btn"
              variant="default"
              ${this._readonly ? "disabled" : ""}
              pill
              size="large"
            >
              <wa-icon class="text-warning" name="minus"></wa-icon>
            </wa-button>
            <wa-button
              class="increment-btn"
              variant="default"
              ${this._readonly ? "disabled" : ""}
              pill
              size="large"
            >
              <wa-icon class="text-primary" name="plus"></wa-icon>
            </wa-button>
          </div>
        </span>
      </span>
    `;

    this.domInput = this.querySelector(`#${inputId}`) as HTMLInputElement;
    if (this.domInput) {
      this.domInput.addEventListener("change", () => {
        this._onNumberChange();
      });
    }

    // Setup button event handlers
    const decrementBtn = this.querySelector(".decrement-btn");
    const incrementBtn = this.querySelector(".increment-btn");

    decrementBtn?.addEventListener("click", () => {
      this._decrementNumber();
    });

    incrementBtn?.addEventListener("click", () => {
      this._incrementNumber();
    });
  }

  private _incrementNumber(): void {
    let number = Number.isInteger(this._number.value)
      ? this._number.value
      : this._value || 0;

    number += this._step || 1;

    if (this._max !== undefined && number > this._max) {
      number = this._max;
    }

    if (this.domInput) {
      this.domInput.value = String(number);
    }

    this._onNumberChange();
  }

  private _decrementNumber(): void {
    let number = Number.isInteger(this._number.value)
      ? this._number.value
      : this._value || 0;

    number -= this._step || 1;

    if (this._min !== undefined && this._min !== null && number < this._min) {
      number = this._min;
    }

    if (this.domInput) {
      this.domInput.value = String(number);
    }

    this._onNumberChange();
  }

  private _onNumberChange(): void {
    const oldValue: number = this._number.value;

    if (!this.domInput) {
      return;
    }

    this._number.value = Number.parseInt(this.domInput.value, 10);
    if (Number.isNaN(this._number.value)) {
      console.warn(
        "<mad-input-number> unable to parse input value as integer."
      );
      this._number.value = oldValue;
      this.domInput.value = String(oldValue);
      return;
    }

    this._emit("madNumberChange", { value: String(this._number.value) });
  }
}

customElements.define("mad-input-number", MadInputNumber);
