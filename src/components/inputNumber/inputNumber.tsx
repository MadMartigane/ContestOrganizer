import {
    InputChangeEventDetail,
    IonInputCustomEvent
} from '@ionic/core';
import {
    Component,
    Event,
    EventEmitter,
    Host,
    Prop,
    h,
    State
} from '@stencil/core';

@Component({
  tag: 'mad-input-number',
  styleUrl: './inputNumber.css',
})
export class MadInputNumber {
    private argColor: string;
    private itemId: string;

    @Prop() color: string;
    @Prop() placeholder: string;
    @Prop() label: string;
    @Prop() min: number;
    @Prop() max: number;
    @Prop() step: number;
    @Prop() value: number;
    @State() number: number;

    @Event() madNumberChange: EventEmitter<InputChangeEventDetail>;

    constructor() {
        this.argColor = this.color || "primary";
        this.number = this.value || this.min || 0;
        this.itemId = "mad_input_number_" + Math.floor(Math.random() * 3000);
    }

    onInputChange(ev: IonInputCustomEvent<InputChangeEventDetail>): void {
        const newNumber = Number(ev.detail.value);
        this.number = newNumber;
        this.madNumberChange.emit(ev.detail);
    }

    onIncrementNumber() {
      if (this.max || this.number === this.max) {
        return;
      }

      this.number++;
      this.madNumberChange.emit({ value: String(this.number)});
    }

    onDecrementNumber() {
      if (this.number === this.min) {
        return;
      }

      this.number--;
      this.madNumberChange.emit({ value: String(this.number)});
    }

    render() {
        return (
            <Host>
                <ion-item
                    id={this.itemId}
                    color={this.argColor}
                    lines="none"
                    fill="outline">
                    {this.label ?
                        <ion-label position="floating">{this.label}</ion-label> :
                        null
                    }
                    <ion-text
                        onIonChange={(ev: IonInputCustomEvent<InputChangeEventDetail>): void => { this.onInputChange(ev) }}
                        color={this.value ? this.argColor : "medium"}>
                        {this.number || this.placeholder}
                    </ion-text>
                </ion-item>
                <ion-popover
                    size="auto"
                    alignment="center"
                    animated="true"
                    arrow="true"
                    trigger={this.itemId}
                    trigger-action="click">
                    <ion-content class="ion-padding">
                        <ion-chip>
                            <ion-icon
                                size="large"
                                onClick={() => { this.onDecrementNumber() }}
                                color="primary"
                                name="remove-outline"
                            ></ion-icon>
                            <ion-label
                                size="large" /* TODO doesn’t work */
                                outline="true"
                                color={this.color}
                            >{this.number}</ion-label>
                            <ion-icon
                                size="large"
                                onClick={() => { this.onIncrementNumber() }}
                                color="primary"
                                name="add-outline"
                            ></ion-icon>
                        </ion-chip>
                    </ion-content>
                </ion-popover>
            </Host>
        );
    }
}
