import { BaseElement } from "@core/base-element";
import { Signal } from "@core/signal";
import { html, nothing } from "lit-html";
import uuid from "../../modules/uuid/uuid";

/**
 * MadInputNumber - Number input component with increment/decrement buttons
 * @element mad-input-number
 */
export class MadInputNumber extends BaseElement {
  private readonly itemId: string;

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
    const labelAttr = this._label || "";
    const placeholderAttr = this._placeholder || "Score";

    this._renderTemplate(html`
      <style>
        .button-group {
          display: flex;
          gap: 0.5rem;
        }
        :host {
          display: block;
        }
        :host(:focus-within) {
          outline: 2px solid #f97316;
          outline-offset: 2px;
        }
      </style>
      <span class="m-6">
        <span class="m-6">
          <mad-input
            autocomplete="off"
            autofocus
            id="${inputId}"
            label="${labelAttr}"
            max="${this._max ?? nothing}"
            min="${this._min}"
            no-spin-buttons
            placeholder="${placeholderAttr}"
            ?readonly=${this._readonly}
            size="large"
            step="${this._step ?? nothing}"
            type="number"
            .value=${numberValue}
            aria-label="${labelAttr || "Number input"}"
            @change=${this._onNumberChange.bind(this)}
          ></mad-input>
        </span>
        <span class="m-6">
          <div class="button-group">
            <mad-button
              class="decrement-btn"
              variant="default"
              ?disabled=${this._readonly}
              pill
              size="large"
              aria-label="Decrease value"
              @click=${this._decrementNumber.bind(this)}
            >
              <mad-icon class="text-yellow-600" name="minus"></mad-icon>
            </mad-button>
            <mad-button
              class="increment-btn"
              variant="default"
              ?disabled=${this._readonly}
              pill
              size="large"
              aria-label="Increase value"
              @click=${this._incrementNumber.bind(this)}
            >
              <mad-icon class="text-orange-600" name="plus"></mad-icon>
            </mad-button>
          </div>
        </span>
      </span>
    `);
  }

  private _incrementNumber(): void {
    let number = Number.isInteger(this._number.value)
      ? this._number.value
      : this._value || 0;

    number += this._step || 1;

    if (this._max !== undefined && number > this._max) {
      number = this._max;
    }

    this._number.value = number;
    this._emit("madNumberChange", { value: String(this._number.value) });
  }

  private _decrementNumber(): void {
    let number = Number.isInteger(this._number.value)
      ? this._number.value
      : this._value || 0;

    number -= this._step || 1;

    if (this._min !== undefined && number < this._min) {
      number = this._min;
    }

    this._number.value = number;
    this._emit("madNumberChange", { value: String(this._number.value) });
  }

  private _onNumberChange(): void {
    const oldValue: number = this._number.value;

    // Get the input element from the shadow root
    const inputEl = this._renderRoot.querySelector(`#${this.itemId}`);
    if (!inputEl) {
      return;
    }

    // Get value from the mad-input component
    const inputValue = (inputEl as HTMLElement & { value?: string }).value;
    if (inputValue === undefined) {
      return;
    }

    this._number.value = Number.parseInt(inputValue, 10);
    if (Number.isNaN(this._number.value)) {
      this._number.value = oldValue;
      return;
    }

    this._emit("madNumberChange", { value: String(this._number.value) });
  }
}

customElements.define("mad-input-number", MadInputNumber);
