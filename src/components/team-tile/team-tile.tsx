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
export class MadInputNumber {
  private apiFutDB: typeof ApiFutDB;

  @State() private imgSrc: string;

  @Prop() team: FutDBTeam;

  constructor () {
    this.apiFutDB = ApiFutDB;
    this.loadImg(this.team.id);
  }

  private loadImg(id: number) {
    this.apiFutDB.loadTeamImage(id)
      .then((base64Img) => {
          this.imgSrc = base64Img;
      });
  }

  @Watch("team")
  onTeamChange (newTeam: FutDBTeam) {
    this.loadImg(newTeam.id);
  }

  render() {
    return (
        <Host>
          <ion-grid>
            <ion-row>
              <ion-col>
                <ion-thumbnail>
                  <img alt={`${this.team.name} club logo`} src={this.imgSrc} />
                </ion-thumbnail>
              </ion-col>
              <ion-col>
                <span>{this.team.name}</span>
              </ion-col>
            </ion-row>
          </ion-grid>
        </Host>
      );
  }
}
