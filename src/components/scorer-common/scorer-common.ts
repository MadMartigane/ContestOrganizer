// /src/components/scorer-common/scorer-common.ts
import { BaseElement } from "../../core/base-element.js";
import { Signal } from "../../core/signal.js";

export class MadScorerCommon extends BaseElement {
  // Signal for reactive state
  private declare _number: Signal<number>;

  // Property backing fields
  private _min = 0;
  private _max?: number;
  private _step = 1;
  private _value?: number;
  private _readonly = false;
  private _hidden = false;

  // Event emitter
  private readonly _emitChange: (value: string) => void;

  static get observedAttributes(): string[] {
    return ["min", "max", "step", "value", "readonly", "hidden"];
  }

  constructor() {
    super();
    this._emitChange = (value: string) => {
      this._emit("madNumberChange", { value });
    };
  }

  protected _setupProperties(): void {
    // 1. Initialize all signals first
    this._number = new Signal<number>(0);

    // 2. Track all signals
    this._trackSignal(this._number);

    // 3. Mark initialization as complete (REQUIRED)
    this._initialized = true;
  }

  protected _createRenderRoot(): Element {
    return this; // Light DOM - no shadow root
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
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

  connectedCallback(): void {
    super.connectedCallback();
    // Initialize number from value or min
    const initialValue = this._value ?? this._min ?? 0;
    this._number.value = initialValue;
  }

  // Public getter for current value (useful for testing/debugging)
  get value(): number {
    return this._number.value;
  }

  // Hidden property
  get hidden(): boolean {
    return this._hidden;
  }

  set hidden(value: boolean) {
    this._hidden = value;
    this._requestRender();
  }

  // Internal methods
  private _increment(): void {
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

  private _decrement(): void {
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

  protected _render(): void {
    const isReadonly = this._readonly;
    const value = this._number.value;

    this.innerHTML = `
      <div class="scorer-wrapper${this._hidden ? " hidden" : ""}">
        <div class="flex justify-center items-center gap-4 py-4">
          <mad-button
            variant="warning"
            size="large"
            pill
            ${isReadonly ? "disabled" : ""}
            aria-label="Decrement score"
            title="Decrease score"
            class="decrement-btn"
          >
            <mad-icon name="dash-lg" slot="prefix"></mad-icon>
          </mad-button>

          <span class="text-2xl font-mono font-bold min-w-12 text-center tabular-nums">${value}</span>

          <mad-button
            variant="brand"
            size="large"
            pill
            ${isReadonly ? "disabled" : ""}
            aria-label="Increment score"
            title="Increase score"
            class="increment-btn"
          >
            <mad-icon name="plus-lg" slot="prefix"></mad-icon>
          </mad-button>
        </div>
      </div>
    `;

    // Attach event listeners to mad-button elements
    const decrementBtn = this.querySelector(".decrement-btn");
    const incrementBtn = this.querySelector(".increment-btn");
    decrementBtn?.addEventListener("click", () => this._decrement());
    incrementBtn?.addEventListener("click", () => this._increment());
  }
}

// Register the custom element
customElements.define("mad-scorer-common", MadScorerCommon);
