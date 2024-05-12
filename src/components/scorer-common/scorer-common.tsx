import { Component, Event, EventEmitter, Host, Prop, h, State, Watch } from '@stencil/core';

@Component({
  tag: 'mad-scorer-common',
  styleUrl: './scorer-common.css',
  shadow: false,
})
export class MadScorerCommon {
  @State() private number: number;

  @Prop() min?: number | null = 0;
  @Prop() max?: number;
  @Prop() step?: number;
  @Prop() value?: number;
  @Prop() readonly?: boolean = false;

  @Event() madNumberChange: EventEmitter<{ value: string }>;

  constructor() {
    this.number = this.value || this.min || 0;
  }

  @Watch('value')
  public onPropValueChange() {
    this.number = this.value || this.min || 0;
  }

  private incrementNumber() {
    this.number += this.step || 1;

    if (this.max && this.number > this.max) {
      this.number = this.max;
    }

    this.onNumberChange();
  }

  private decrementNumber() {
    this.number -= this.step || 1;

    if (this.min !== undefined && this.min !== null && this.number < this.min) {
      this.number = this.min;
    }

    this.onNumberChange();
  }

  private onNumberChange() {
    this.madNumberChange.emit({ value: String(this.number) });
  }

  private renderEditingState() {
    return (
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
            <sl-icon class="text-warning" name="dash-lg"></sl-icon>
          </sl-button>
          <sl-button
            onclick={() => {
              this.incrementNumber();
            }}
            disabled={Boolean(this.readonly)}
            size="large"
            pill
          >
            <sl-icon class="text-primary" name="plus-lg"></sl-icon>
          </sl-button>
        </sl-button-group>
      </span>
    );
  }

  public render() {
    return <Host>{this.renderEditingState()}</Host>;
  }
}
