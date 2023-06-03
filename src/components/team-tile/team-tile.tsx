import {
  Component,
  Host,
  Prop,
  h,
  State,
  Watch
} from '@stencil/core';
import {FutDBTeam} from "../../modules/futbd/futdb.d";
import ApiFutDB from "../../modules/futbd/futdb";

@Component({
  tag: 'mad-team-tile',
  styleUrl: './team-tile.css',
  shadow: false
})
export class MadTeamTile {
  private apiFutDB: typeof ApiFutDB;

  @State() private imgSrc: string;

  @Prop() team: FutDBTeam | null;
  @Prop() reverse: Boolean | null;

  constructor () {
    this.apiFutDB = ApiFutDB;

    if (this.team) {
      this.loadImg(this.team.id);
    }
  }

  private loadImg(id: number) {
    this.apiFutDB.loadTeamImage(id)
      .then((base64Img) => {
          this.imgSrc = base64Img;
      });
  }

  @Watch("team")
  onTeamChange (newTeam: FutDBTeam | null) {
    if (!newTeam) { return; }

    this.loadImg(newTeam.id);
  }

  render() {
    return (
      <Host>
        <ion-grid class="grid-team-tile">
          <ion-row class="ion-align-items-center">
            <ion-col size="12" size-md="6" push-md={this.reverse ? "6" : null}>
              {this.team && this.imgSrc ?
                <ion-thumbnail class={this.reverse ? "ion-float-end" : "ion-float-start"}>
                  <img alt={`${this.team?.name} club logo`} src={this.imgSrc} />
                </ion-thumbnail>
                :
                <span></span>
              }
            </ion-col>
            <ion-col size="12" size-md="6" pull-md={this.reverse ? "6" : null}
              class={this.reverse ? "ion-text-end" : "ion-text-start"}>
              {this.team ?
                <span>{this.team?.name}</span>
                :
                <span>⏳</span>
              }
            </ion-col>
          </ion-row>
        </ion-grid>
      </Host>
    );
  }
}
