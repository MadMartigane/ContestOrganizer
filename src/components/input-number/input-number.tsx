import {
  InputChangeEventDetail
} from "@ionic/core";
import {
  Component,
  Event,
  EventEmitter,
  Host,
  Prop,
  h,
  State,
  Watch
} from "@stencil/core";
import uuid from "../../modules/uuid/uuid";

@Component({
  tag: "mad-input-number",
  styleUrl: "./input-number.css",
  shadow: false
})
export class MadInputNumber {
  private argColor: string;
  private itemId: string;
  private innerSep: number;

  @Prop() color: string;
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
    this.argColor = this.color || "primary";
    this.number = this.value || this.min || 0;
    this.itemId = `mad_input_number_${uuid.new()}`;
    this.innerSep = this.step || 1;
  }

  @Watch("value")
  public onPropValueChange() {
    this.number = this.value || 0;
  }

  private onIncrementNumber() {
    if (this.max !== undefined && this.number >= this.max) {
      this.number = this.max;
      return;
    }

    this.number += this.innerSep;
    this.madNumberChange.emit({ value: String(this.number) });
  }

  private onDecrementNumber() {
    if (this.min !== undefined && this.number <= this.min) {
      this.number = this.min;
      return;
    }

    this.number -= this.innerSep;
    this.madNumberChange.emit({ value: String(this.number) });
  }

  render() {
    return (
      <Host>
        <div id={this.itemId} class={{
          "pointer": !this.readonly
        }}>
          {this.label ?
            <span>{this.label}: </span> :
            null
          }
          {this.value !== undefined ?
            <span class={this.argColor}>{this.number}</span> :
            <span class="placeholder">{this.placeholder}</span>
          }
        </div>
        {this.readonly ?
          null :
          <ion-popover
            mode="ios"
            size="auto"
            alignment="center"
            animated="true"
            arrow="true"
            trigger={this.itemId}
            trigger-action="click">
            <ion-content class="ion-padding">
              <div class="box">
                <ion-button
                  color="warning"
                  onclick={() => { this.onDecrementNumber() }}
                  size="small">
                  <ion-icon
                    slod="icon-only"
                    size="large"
                    color="primary"
                    name="remove-outline"
                  ></ion-icon>
                </ion-button>
                <ion-chip
                  outline="true"
                  color={this.color}
                >{this.number}
                </ion-chip>
                <ion-button
                  color="warning"
                  onclick={() => { this.onIncrementNumber() }}
                  size="small">
                  <ion-icon
                    slod="icon-only"
                    size="large"
                    color="primary"
                    name="add-outline"
                  ></ion-icon>
                </ion-button>
              </div>
            </ion-content>
          </ion-popover>
        }
      </Host>
    );
  }
}
