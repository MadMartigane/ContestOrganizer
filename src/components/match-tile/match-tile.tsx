import {
  Component,
  Host,
  Prop,
  h
} from '@stencil/core';
import { TeamRow } from "../../modules/team-row/team-row";

@Component({
  tag: 'mad-match-tile',
  styleUrl: './match-tile.css',
  shadow: false
})
export class MadMatchTile {

  @Prop() host: TeamRow | null;
  @Prop() visitor: TeamRow | null;

  render() {
    return (
      <Host>
        <ion-row class="ion-align-items-center">
          <ion-col size="5">
            <mad-team-tile reverse={true} team={this.host?.team}></mad-team-tile>
          </ion-col>
          <ion-col size="2">
            <p> VS </p>
          </ion-col>
          <ion-col size="5">
            <mad-team-tile team={this.visitor?.team}></mad-team-tile>
          </ion-col>
        </ion-row>
      </Host>
    );
  }
}
