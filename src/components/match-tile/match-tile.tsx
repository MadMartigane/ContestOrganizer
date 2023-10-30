import {
  Component,
  Host,
  Prop,
  h,
  State
} from '@stencil/core';
import { TeamRow } from "../../modules/team-row/team-row";

@Component({
  tag: 'mad-match-tile',
  styleUrl: './match-tile.css',
  shadow: false
})
export class MadMatchTile {

  @State() host: TeamRow | null;
  @State() visitor: TeamRow | null;

  @Prop() hostPending: Promise<TeamRow | null>;
  @Prop() visitorPending: Promise<TeamRow | null>;

  constructor() {
    this.hostPending.then((team: TeamRow | null) => { this.host = team; })
    this.visitorPending.then((team: TeamRow | null) => { this.visitor = team; })
  }

  render() {
    return (
      <Host>
        <ion-row class="ion-align-items-center">
          <ion-col size="5">
            {this.host ?
              <mad-team-tile reverse={true} team={this.host?.team}></mad-team-tile> :
              <span>loading…</span>
            }
          </ion-col>
          <ion-col size="2">
            <p> VS </p>
          </ion-col>
          <ion-col size="5">
            {this.visitor ?
              <mad-team-tile team={this.visitor?.team}></mad-team-tile> :
              <span>loading…</span>
            }
          </ion-col>
        </ion-row>
      </Host>
    );
  }
}
