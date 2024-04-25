import { Component, Event, EventEmitter, Host, Prop, h, State, Watch } from '@stencil/core';
import SlSwitch from '@shoelace-style/shoelace/dist/components/switch/switch.component';
import Utils from '../../modules/utils/utils';

@Component({
  tag: 'mad-scorer-basket',
  styleUrl: './scorer-basket.css',
  shadow: false,
})
export class MadScorerBasket {
  private argColor: string;
  private domPlusMinusSwitch: SlSwitch;

  @Prop() color: string;
  @Prop() placeholder: string;
  @Prop() label?: string;
  @Prop() min?: number;
  @Prop() max?: number;
  @Prop() value?: number;
  @Prop() readonly?: boolean;

  @State() private number: number;
  @State() private minusMode: boolean;

  @Event() madNumberChange: EventEmitter<{ value: string }>;

  constructor() {
    this.argColor = this.color || '';
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
        <div>
          {this.label ? <span>{this.label}: </span> : null}
          {this.value !== undefined ? <span class={this.argColor}>{this.number}</span> : <span class="placeholder">{this.placeholder}</span>}
        </div>
        {this.readonly ? null : (
          <div>
            <ion-grid>
              <ion-row>
                <ion-col>
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
                </ion-col>
                <ion-col>
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
                </ion-col>
                <ion-col>
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
                </ion-col>
                <ion-col>
                  <sl-spacer></sl-spacer>
                  <sl-switch ref={(el: SlSwitch) => (this.domPlusMinusSwitch = el)} size="large" checked={!this.minusMode} help-text="Ajouter/Supprimer des points">
                    <sl-icon name="plus-slash-minus" class="xl"></sl-icon>
                  </sl-switch>
                </ion-col>
              </ion-row>
            </ion-grid>
          </div>
        )}
      </Host>
    );
  }
}
