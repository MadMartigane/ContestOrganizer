import { InputChangeEventDetail } from '@ionic/core';
import { Component, Event, EventEmitter, Host, Prop, h, State, Watch } from '@stencil/core';
import uuid from '../../modules/uuid/uuid';
import setting, { GlobalSetting } from '../../modules/global-setting/global-setting';

import SlInput from '@shoelace-style/shoelace/dist/components/input/input.component';

@Component({
  tag: 'mad-input-number',
  styleUrl: './input-number.css',
  shadow: false,
})
export class MadInputNumber {
  private readonly globalSetting: GlobalSetting;

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
  @State() private isDarkThemeActive: boolean;

  @Event() madNumberChange: EventEmitter<InputChangeEventDetail>;

  constructor() {
    this.globalSetting = setting;
    this.isDarkThemeActive = this.globalSetting.isDarkThemeActive();
    console.log('constructor isDarkThemeActive: ', this.isDarkThemeActive);

    this.number = this.value || this.min || 0;
    this.itemId = `mad_input_number_${uuid.new()}`;

    this.globalSetting.onDarkThemeChange((state: boolean) => {
      this.onDarkThemeChange(state);
    });
  }

  public componentDidLoad() {
    console.log('onComponentDidLoad(), this.domInput: ', this.domInput);
    if (this.domInput) {
      this.domInput.addEventListener('sl-change', () => {
        console.log('on sl-change !!');
        this.onNumberChange();
      });
    }
  }

  @Watch('value')
  public onPropValueChange() {
    this.number = this.value || 0;
  }

  private incrementNumber() {
    console.log('increment !!!!!');
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
    console.log('decrement !!!!!');
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
    console.log('onNumberChange() this.domInput.value', this.domInput.value);
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

  private onDarkThemeChange(state: boolean): void {
    this.isDarkThemeActive = state;
    console.log('onDarkThemeChange isDarkThemeActive: ', this.isDarkThemeActive);
  }

  private renderEditingState() {
    return (
      <span class="container-xl">
        <span class="container-xl">
          <sl-input
            autofocus
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
              size="large"
              pill
            >
              <sl-icon class="warning" name="dash-lg"></sl-icon>
            </sl-button>
            <sl-button
              onclick={() => {
                this.incrementNumber();
              }}
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
    return (
      <Host>
        <sp-theme scale="large" color={this.isDarkThemeActive ? 'dark' : 'light'}>
          {this.renderEditingState()}
        </sp-theme>
      </Host>
    );
  }
}
