
import {
    Component,
    Event,
    EventEmitter,
    Listen,
    Host,
    Prop,
    h,
    State,
    Watch
} from "@stencil/core";
import { FutDBTeam } from "../../modules/futbd/futdb.d";
import { PageTeamSelectEventDatail } from "../page-team-select/page-team-select.d";

@Component({
  tag: "mad-select-team",
  styleUrl: "./select-team.css",
  shadow: false
})
export class MadSelectTeam {
  private argColor: string;
  private itemId: string;

  @Prop() color: string;
  @Prop() placeholder: string;
  @Prop() label: string;
  @Prop() value: FutDBTeam;
  @State() team: FutDBTeam;

  @Event() madSelectChange: EventEmitter<FutDBTeam>;

  @Listen("pageTeamNewSelection", {
    target: "window"
  }) onPageTeamNewSelection(event: CustomEvent<PageTeamSelectEventDatail>) {
    const detail = event.detail;
    if (detail.id === this.itemId) {
      this.team = detail.team;
      this.madSelectChange.emit(this.team);
    }
  }

  @Watch("value")
  onValueChange() {
    this.team = this.value;
  }

  constructor() {
    this.argColor = this.color || "primary";
    this.team = this.value;
    this.itemId = String(Math.floor(Math.random() * 999999));
  }

  render() {
    return (
      <Host
        class={{
          "pointer": true
        }}>
        <ion-router-link
          href={`/team-select/${this.itemId}`} key="teamId"
          id={this.itemId}
          color={this.argColor}
          lines="none"
          fill="outline">
          {this.label ?
            <ion-label position="floating">{this.label}</ion-label> :
            null
          }
          {this.team?.id ?
            <mad-team-tile team={this.team}></mad-team-tile> :
            <p class="placeholder ion-padding-top">{this.placeholder}</p>
          }
        </ion-router-link>
      </Host>
    );
  }
}
