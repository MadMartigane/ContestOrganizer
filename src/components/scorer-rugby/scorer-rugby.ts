import { BaseElement } from "@core/base-element";
import { Signal } from "@core/signal";
import { html, nothing } from "lit-html";
import scorerRugbyStyles from "./scorer-rugby.css?raw";

const POINTS = [2, 3, 5] as const;

export class MadScorerRugby extends BaseElement {
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

  protected _createRenderRoot(): ShadowRoot {
    return this.attachShadow({ mode: "open" });
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
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(scorerRugbyStyles);
    this._injectStyles(sheet);
    const initialValue = this._value ?? this._min ?? 0;
    this._number.value = initialValue;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  private readonly _handleButtonClick = (points: number) => (): void => {
    this._onIncrement(points);
  };

  private readonly _handleSwitchChange = (): void => {
    this._onSwitchToggle();
  };

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

customElements.define("mad-scorer-rugby", MadScorerRugby);
