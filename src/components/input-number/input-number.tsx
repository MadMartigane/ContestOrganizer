import type SlInput from "@shoelace-style/shoelace/dist/components/input/input.component";
import {
  Component,
  Event,
  type EventEmitter,
  Host,
  h,
  Prop,
  State,
  Watch,
} from "@stencil/core";
import uuid from "../../modules/uuid/uuid";

@Component({
  tag: "mad-input-number",
  styleUrl: "./input-number.css",
  shadow: false,
})
export class MadInputNumber {
  private readonly itemId: string;
  private domInput: SlInput;

  @Prop() placeholder: string;
  @Prop() label?: string;
  @Prop() min?: number | null = 0;
  @Prop() max?: number;
  @Prop() step?: number;
  @Prop() value?: number;
  @Prop() readonly?: boolean;

  @State() private number: number;

  @Event() madNumberChange: EventEmitter<{ value: string }>;

  constructor() {
    this.number = this.value || this.min || 0;
    this.itemId = `mad_input_number_${uuid.new()}`;
  }

  componentDidLoad() {
    if (this.domInput) {
      this.domInput.addEventListener("sl-change", () => {
        this.onNumberChange();
      });
    }
  }

  @Watch("value")
  onPropValueChange() {
    this.number = this.value || 0;
  }

  private incrementNumber() {
    let number = Number.isInteger(this.number) ? this.number : this.value || 0;

    number += this.step || 1;

    if (this.max && number > this.max) {
      number = this.max;
    }

    if (this.domInput) {
      this.domInput.value = String(number);
    }

    this.onNumberChange();
  }

  private decrementNumber() {
    let number = Number.isInteger(this.number) ? this.number : this.value || 0;

    number -= this.step || 1;

    if (this.min !== undefined && this.min !== null && number < this.min) {
      number = this.min;
    }

    if (this.domInput) {
      this.domInput.value = String(number);
    }

    this.onNumberChange();
  }

  private onNumberChange() {
    const oldValue: number = this.number;

    this.number = Number.parseInt(this.domInput.value, 10);
    if (Number.isNaN(this.number)) {
      console.warn(
        "<mad-input-number> unable to parse input value as integer."
      );
      this.number = oldValue;
      this.domInput.value = String(oldValue);
      return;
    }

    this.madNumberChange.emit({ value: String(this.number) });
  }

  private renderEditingState() {
    return (
      <span class="container-xl">
        <span class="container-xl">
          <sl-input
            autocomplete="off"
            autofocus
            id={this.itemId}
            label={this.label}
            max={this.max}
            min={this.min}
            no-spin-buttons
            placeholder="Score"
            readonly={Boolean(this.readonly)}
            ref={(el: SlInput) => {
              this.domInput = el;
            }}
            size="large"
            step={this.step}
            type="number"
            value={this.number}
          />
        </span>
        <span class="container-xl">
          <sl-button-group label="Plus/minus action buttons">
            <sl-button
              disabled={Boolean(this.readonly)}
              onclick={() => {
                this.decrementNumber();
              }}
              pill
              size="large"
            >
              <sl-icon class="text-warning" name="dash-lg" />
            </sl-button>
            <sl-button
              disabled={Boolean(this.readonly)}
              onclick={() => {
                this.incrementNumber();
              }}
              pill
              size="large"
            >
              <sl-icon class="text-primary" name="plus-lg" />
            </sl-button>
          </sl-button-group>
        </span>
      </span>
    );
  }

  render() {
    return <Host>{this.renderEditingState()}</Host>;
  }
}
