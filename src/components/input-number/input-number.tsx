import { InputChangeEventDetail } from '@ionic/core';
import { Component, Event, EventEmitter, Host, Prop, h, State, Watch } from '@stencil/core';
import uuid from '../../modules/uuid/uuid';
import setting, { GlobalSetting } from '../../modules/global-setting/global-setting';

import { NumberField } from '@spectrum-web-components/number-field';

@Component({
  tag: 'mad-input-number',
  styleUrl: './input-number.css',
  shadow: false,
})
export class MadInputNumber {
  private readonly globalSetting: GlobalSetting;

  private itemId: string;
  private numberField: NumberField;

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

  @Watch('value')
  public onPropValueChange() {
    this.number = this.value || 0;
  }

  private onNumberChange() {
    this.number = this.numberField.value;
    this.madNumberChange.emit({ value: String(this.number) });
  }

  private onDarkThemeChange(state: boolean): void {
    this.isDarkThemeActive = state;
    console.log('onDarkThemeChange isDarkThemeActive: ', this.isDarkThemeActive);
  }

  private renderEditingState() {
    return (
      <span class="container-s">
        <sp-field-label for={this.itemId}>{this.label}</sp-field-label>
        <sp-number-field
          autofocus
          id={this.itemId}
          label={this.label}
          value={this.number}
          min={this.min}
          max={this.max}
          step={this.step}
          size="l"
          readonly={Boolean(this.readonly)}
          ref={(node: NumberField) => {
            this.numberField = node;
          }}
          onChange={() => {
            this.onNumberChange();
          }}
        ></sp-number-field>
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
