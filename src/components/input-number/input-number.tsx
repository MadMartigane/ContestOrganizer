import {
    InputChangeEventDetail,
    IonInputCustomEvent
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

    @State() private number: number;

    @Event() madNumberChange: EventEmitter<InputChangeEventDetail>;

    constructor() {
        this.argColor = this.color || "primary";
        this.number = this.value || this.min || 0;
        this.itemId = "mad_input_number_" + Math.floor(Math.random() * 3000);
        this.innerSep = this.step || 1;
    }

    @Watch("value")
    onPropValueChange () {
      this.number = this.value;
    }

    onInputChange(ev: IonInputCustomEvent<InputChangeEventDetail>): void {
        const newNumber = Number(ev.detail.value);
        this.number = newNumber;
        this.madNumberChange.emit(ev.detail);
    }

    onIncrementNumber() {
      if (this.max && this.number >= this.max) {
        this.number = this.max;
        return;
      }

      this.number += this.innerSep;
      this.madNumberChange.emit({ value: String(this.number)});
    }

    onDecrementNumber() {
      if (this.min && this.number <= this.min) {
        this.number = this.min;
        return;
      }

      this.number -= this.innerSep;
      this.madNumberChange.emit({ value: String(this.number)});
    }

    render() {
        return (
            <Host
            class={{
              "pointer": true
            }}>
                <ion-item
                    id={this.itemId}
                    color={this.argColor}
                    lines="none"
                    fill="outline">
                    <ion-label>
                      { this.label ?
                          <span>{this.label}: </span> :
                          null
                      }
                      <ion-text
                          color={this.value ? this.argColor : "medium"}>
                          {this.number || this.placeholder}
                      </ion-text>
                    </ion-label>
                </ion-item>
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
            </Host>
        );
    }
}