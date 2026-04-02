import { BaseElement } from "@core/base-element.js";
import { Signal } from "@core/signal.js";

const POINTS = [1, 2, 3] as const;

export class MadScorerBasket extends BaseElement {
  // Signals for reactive state
  private declare _number: Signal<number>;
  private declare _minusMode: Signal<boolean>;

  // Property backing fields
  private _min?: number;
  private _max?: number;
  private _value?: number;
  private _readonly = false;

  static get observedAttributes(): string[] {
    return ["min", "max", "value", "readonly"];
  }

  protected _setupProperties(): void {
    this._number = new Signal<number>(0);
    this._minusMode = new Signal<boolean>(false);

    this._trackSignal(this._number);
    this._trackSignal(this._minusMode);

    this._initialized = true;
  }

  protected _createRenderRoot(): Element {
    return this;
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

  connectedCallback(): void {
    super.connectedCallback();
    const initialValue = this._value ?? this._min ?? 0;
    this._number.value = initialValue;
  }

  private _onIncrement(points: number): void {
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

  private _onSwitchToggle(): void {
    this._minusMode.value = !this._minusMode.value;
  }

  protected _render(): void {
    if (this._readonly) {
      this.innerHTML = "";
      return;
    }

    const minusMode = this._minusMode.value;
    const iconName = minusMode ? "minus" : "plus";
    const variant = minusMode ? "warning" : "brand";

    this.innerHTML = `
      <div class="my-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        ${POINTS.map(
          (points) => `
          <wa-button
            data-points="${points}"
            size="large"
            variant="${variant}"
          >
            <wa-icon
              class="xl"
              name="${iconName}"
              slot="start"
            ></wa-icon>
            <span slot="end">${points}</span>
          </wa-button>
        `
        ).join("")}
        <wa-switch
          id="plus-minus-switch"
          checked="${!minusMode}"
          help-text="Ajouter/Supprimer des points"
          size="large"
        >
          <wa-icon class="xl" name="plus-slash-minus"></wa-icon>
        </wa-switch>
      </div>
    `;

    // Attach event listeners after render
    const buttons = Array.from(this.querySelectorAll("wa-button[data-points]"));
    for (const btn of buttons) {
      const points = Number(btn.getAttribute("data-points"));
      btn.addEventListener("click", () => this._onIncrement(points));
    }

    const switchEl = this.querySelector("#plus-minus-switch");
    switchEl?.addEventListener("wa-change", () => this._onSwitchToggle());
  }
}

customElements.define("mad-scorer-basket", MadScorerBasket);
