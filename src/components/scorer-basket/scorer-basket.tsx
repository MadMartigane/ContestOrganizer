import { InputChangeEventDetail } from '@ionic/core';
import { Component, Event, EventEmitter, Host, Prop, h, State, Watch } from '@stencil/core';
import uuid from '../../modules/uuid/uuid';

@Component({
  tag: 'mad-scorer-basket',
  styleUrl: './scorer-basket.css',
  shadow: false,
})
export class MadScorerBasket {
  private argColor: string;
  private itemId: string;

  @Prop() color: string;
  @Prop() placeholder: string;
  @Prop() label?: string;
  @Prop() min?: number;
  @Prop() max?: number;
  @Prop() value?: number;
  @Prop() readonly?: boolean;

  @State() private number: number;
  @State() private minusMode: boolean;

  @Event() madNumberChange: EventEmitter<InputChangeEventDetail>;

  constructor() {
    this.argColor = this.color || 'primary';
    this.number = this.value || this.min || 0;
    this.itemId = `mad_scorer_basket_${uuid.new()}`;
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

  render() {
    return (
      <Host>
        <div id={this.itemId}>
          {this.label ? <span>{this.label}: </span> : null}
          {this.value !== undefined ? <span class={this.argColor}>{this.number}</span> : <span class="placeholder">{this.placeholder}</span>}
        </div>
        {this.readonly ? null : (
          <div>
            <ion-grid>
              <ion-row>
                <ion-col>
                  <ion-button
                    color={this.minusMode ? 'tertiary' : 'warning'}
                    onClick={() => {
                      this.onIncrementNumber(1);
                    }}
                    size="default"
                  >
                    <mad-icon slot="icon-only" m primary name={this.minusMode ? 'math-minus' : 'math-plus'}></mad-icon>
                    <span>1</span>
                  </ion-button>
                </ion-col>
                <ion-col>
                  <ion-button
                    color={this.minusMode ? 'tertiary' : 'warning'}
                    onClick={() => {
                      this.onIncrementNumber(2);
                    }}
                    size="default"
                  >
                    <mad-icon slot="icon-only" m primary name={this.minusMode ? 'math-minus' : 'math-plus'}></mad-icon>
                    <span>2</span>
                  </ion-button>
                </ion-col>
                <ion-col>
                  <ion-button
                    color={this.minusMode ? 'tertiary' : 'warning'}
                    onClick={() => {
                      this.onIncrementNumber(3);
                    }}
                    size="default"
                  >
                    <mad-icon slot="icon-only" m primary name={this.minusMode ? 'math-minus' : 'math-plus'}></mad-icon>
                    <span>3</span>
                  </ion-button>
                </ion-col>
                <ion-col>
                  <ion-button
                    color={this.minusMode ? 'secondary' : 'primary'}
                    onClick={() => {
                      this.switchMode();
                    }}
                    size="default"
                  >
                    <mad-icon slot="icon-only" l light name={this.minusMode ? 'swap' : 'swap-vertical'}></mad-icon>
                  </ion-button>
                </ion-col>
              </ion-row>
            </ion-grid>
          </div>
        )}
      </Host>
    );
  }
}
