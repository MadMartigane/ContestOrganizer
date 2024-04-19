import { InputChangeEventDetail } from '@ionic/core';
import { Component, Event, EventEmitter, Host, Prop, h, State, Watch } from '@stencil/core';
import uuid from '../../modules/uuid/uuid';
import SlSwitch from '@shoelace-style/shoelace/dist/components/switch/switch.component';

@Component({
  tag: 'mad-scorer-basket',
  styleUrl: './scorer-basket.css',
  shadow: false,
})
export class MadScorerBasket {
  private argColor: string;
  private itemId: string;
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

  @Event() madNumberChange: EventEmitter<InputChangeEventDetail>;

  constructor() {
    this.argColor = this.color || '';
    this.number = this.value || this.min || 0;
    this.itemId = `mad_scorer_basket_${uuid.new()}`;
    this.minusMode = false;
  }

  @Watch('value')
  public onPropValueChange() {
    this.number = this.value || 0;
  }

  private installEventHandler() {
    if (this.domPlusMinusSwitch) {
      this.domPlusMinusSwitch.addEventListener('sl-change', () => {
        this.switchMode();
      });
    }
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

  public componentDidLoad() {
    this.installEventHandler();
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
