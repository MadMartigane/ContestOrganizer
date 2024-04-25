import { InputChangeEventDetail } from '@ionic/core';
import { Component, Event, EventEmitter, Host, Prop, h, State, Watch } from '@stencil/core';
import uuid from '../../modules/uuid/uuid';

import SlInput from '@shoelace-style/shoelace/dist/components/input/input.component';

@Component({
  tag: 'mad-input-number',
  styleUrl: './input-number.css',
  shadow: false,
})
export class MadInputNumber {
  private itemId: string;
  private domInput: SlInput;

  @Prop() placeholder: string;
  @Prop() label?: string;
  @Prop() min?: number;
  @Prop() max?: number;
  @Prop() step?: number;
  @Prop() value?: number;
  @Prop() readonly?: boolean;

  @State() private number: number;

  @Event() madNumberChange: EventEmitter<InputChangeEventDetail>;

  constructor() {
    this.number = this.value || this.min || 0;
    this.itemId = `mad_input_number_${uuid.new()}`;
  }

  public componentDidLoad() {
    if (this.domInput) {
      this.domInput.addEventListener('sl-change', () => {
        this.onNumberChange();
      });
    }
  }

  @Watch('value')
  public onPropValueChange() {
    this.number = this.value || 0;
  }

  private incrementNumber() {
    let number = Number.isInteger(this.number) ? this.number : this.value || 0;

    number += this.step || 1;

    if (this.max && number > this.max) {
      number = this.max;
    } else if (this.domInput) {
      this.domInput.value = String(number);
    }

    this.onNumberChange();
  }

  private decrementNumber() {
    let number = Number.isInteger(this.number) ? this.number : this.value || 0;

    number -= this.step || 1;

    if (this.min && number < this.min) {
      number = this.min;
    } else if (this.domInput) {
      this.domInput.value = String(number);
    }

    this.onNumberChange();
  }

  private onNumberChange() {
    const oldValue: number = this.number;

    this.number = parseInt(this.domInput.value, 10);
    if (isNaN(this.number)) {
      console.warn('<mad-input-number> unable to parse input value as integer.');
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
            autofocus
            no-spin-buttons
            autocomplete="off"
            type="number"
            id={this.itemId}
            label={this.label}
            value={this.number}
            min={this.min}
            max={this.max}
            step={this.step}
            readonly={Boolean(this.readonly)}
            ref={(el: SlInput) => {
              this.domInput = el;
            }}
            placeholder="Score"
            size="large"
          ></sl-input>
        </span>
        <span class="container-xl">
          <sl-button-group label="Plus/minus action buttons">
            <sl-button
              onclick={() => {
                this.decrementNumber();
              }}
              disabled={Boolean(this.readonly)}
              size="large"
              pill
            >
              <sl-icon class="warning" name="dash-lg"></sl-icon>
            </sl-button>
            <sl-button
              onclick={() => {
                this.incrementNumber();
              }}
              disabled={Boolean(this.readonly)}
              size="large"
              pill
            >
              <sl-icon class="primary" name="plus-lg"></sl-icon>
            </sl-button>
          </sl-button-group>
        </span>
      </span>
    );
  }

  public render() {
    return <Host>{this.renderEditingState()}</Host>;
  }
}
