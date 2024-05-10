import { Component, Event, EventEmitter, Host, Prop, h, State, Watch } from '@stencil/core';
import SlSwitch from '@shoelace-style/shoelace/dist/components/switch/switch.component';
import Utils from '../../modules/utils/utils';

@Component({
  tag: 'mad-scorer-basket',
  styleUrl: './scorer-basket.css',
  shadow: false,
})
export class MadScorerBasket {
  private domPlusMinusSwitch: SlSwitch;

  @Prop() min?: number;
  @Prop() max?: number;
  @Prop() value?: number;
  @Prop() readonly?: boolean;

  @State() private number: number;
  @State() private minusMode: boolean;

  @Event() madNumberChange: EventEmitter<{ value: string }>;

  constructor() {
    this.number = this.value || this.min || 0;
    this.minusMode = false;
  }

  @Watch('value')
  public onPropValueChange() {
    this.number = this.value || 0;
  }

  private onIncrementNumber(i: number) {
    if (this.minusMode) {
      this.number -= i;
    } else {
      this.number += i;
    }

    if (this.max !== undefined && this.number >= this.max) {
      this.number = this.max;
    }

    if (this.min !== undefined && this.number <= this.min) {
      this.number = this.min;
    }

    this.madNumberChange.emit({ value: String(this.number) });
  }

  private switchMode() {
    this.minusMode = !this.minusMode;
  }

  public componentDidRender() {
    Utils.installEventHandler(this.domPlusMinusSwitch, 'sl-change', () => {
      this.switchMode();
    });
  }

  render() {
    return (
      <Host>
        {this.readonly ? null : (
          <div class="grid grid-rows-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-4">
            <sl-button
              variant={this.minusMode ? 'warning' : 'primary'}
              onclick={() => {
                this.onIncrementNumber(1);
              }}
              size="large"
            >
              <sl-icon slot="prefix" name={this.minusMode ? 'dash-lg' : 'plus-lg'} class="xl"></sl-icon>
              <span slot="suffix">1</span>
            </sl-button>
            <sl-button
              variant={this.minusMode ? 'warning' : 'primary'}
              onclick={() => {
                this.onIncrementNumber(2);
              }}
              size="large"
            >
              <sl-icon slot="prefix" name={this.minusMode ? 'dash-lg' : 'plus-lg'} class="xl"></sl-icon>
              <span slot="suffix">2</span>
            </sl-button>
            <sl-button
              variant={this.minusMode ? 'warning' : 'primary'}
              onclick={() => {
                this.onIncrementNumber(3);
              }}
              size="large"
            >
              <sl-icon slot="prefix" name={this.minusMode ? 'dash-lg' : 'plus-lg'} class="xl"></sl-icon>
              <span slot="suffix">3</span>
            </sl-button>
            <sl-switch ref={(el: SlSwitch) => (this.domPlusMinusSwitch = el)} size="large" checked={!this.minusMode} help-text="Ajouter/Supprimer des points">
              <sl-icon name="plus-slash-minus" class="xl"></sl-icon>
            </sl-switch>
          </div>
        )}
      </Host>
    );
  }
}
