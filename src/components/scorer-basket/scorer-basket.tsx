import type SlSwitch from "@shoelace-style/shoelace/dist/components/switch/switch.component";
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
import Utils from "../../modules/utils/utils";

@Component({
  tag: "mad-scorer-basket",
  styleUrl: "./scorer-basket.css",
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

  @Watch("value")
  onPropValueChange() {
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

  componentDidRender() {
    Utils.installEventHandler(this.domPlusMinusSwitch, "sl-change", () => {
      this.switchMode();
    });
  }

  render() {
    return (
      <Host>
        {this.readonly ? null : (
          <div class="my-4 grid grid-rows-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <sl-button
              onclick={() => {
                this.onIncrementNumber(1);
              }}
              size="large"
              variant={this.minusMode ? "warning" : "primary"}
            >
              <sl-icon
                class="xl"
                name={this.minusMode ? "dash-lg" : "plus-lg"}
                slot="prefix"
              />
              <span slot="suffix">1</span>
            </sl-button>
            <sl-button
              onclick={() => {
                this.onIncrementNumber(2);
              }}
              size="large"
              variant={this.minusMode ? "warning" : "primary"}
            >
              <sl-icon
                class="xl"
                name={this.minusMode ? "dash-lg" : "plus-lg"}
                slot="prefix"
              />
              <span slot="suffix">2</span>
            </sl-button>
            <sl-button
              onclick={() => {
                this.onIncrementNumber(3);
              }}
              size="large"
              variant={this.minusMode ? "warning" : "primary"}
            >
              <sl-icon
                class="xl"
                name={this.minusMode ? "dash-lg" : "plus-lg"}
                slot="prefix"
              />
              <span slot="suffix">3</span>
            </sl-button>
            <sl-switch
              checked={!this.minusMode}
              help-text="Ajouter/Supprimer des points"
              ref={(el: SlSwitch) => (this.domPlusMinusSwitch = el)}
              size="large"
            >
              <sl-icon class="xl" name="plus-slash-minus" />
            </sl-switch>
          </div>
        )}
      </Host>
    );
  }
}
