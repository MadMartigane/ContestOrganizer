import { Component, Host, Prop, h, State, Watch } from '@stencil/core';
import apiFutDB from '../../modules/futbd/futdb';
import { GenericTeam } from '../../components.d';

@Component({
  tag: 'mad-team-tile',
  styleUrl: './team-tile.css',
  shadow: false,
})
export class MadTeamTile {
  private apiFutDB: typeof apiFutDB;

  @State() private imgSrc: string;

  @Prop() team: GenericTeam | null;
  @Prop() reverse: Boolean | null;

  constructor() {
    this.apiFutDB = apiFutDB;

    this.loadImg(this.team?.id || null);
  }

  private loadImg(id: number | null) {
    if (this.team?.logo) {
      setTimeout(() => {
        this.imgSrc = this.team?.logo || '';
      });
    } else if (id) {
      this.apiFutDB.loadTeamImage(id).then(base64Img => {
        this.imgSrc = base64Img;
      });
    }
  }

  @Watch('team')
  onTeamChange(newTeam: GenericTeam | null) {
    if (!newTeam) {
      return;
    }

    this.loadImg(newTeam.id);
  }

  render() {
    return (
      <Host>
        <ion-grid class="grid-team-tile">
          <ion-row class="ion-align-items-center">
            <ion-col size="12" size-md="6" push-md={this.reverse ? '6' : null}>
              {this.team && this.imgSrc ? (
                <ion-thumbnail class={this.reverse ? 'ion-float-end' : 'ion-float-start'}>
                  <img alt={`${this.team?.name} club logo`} src={this.imgSrc} />
                </ion-thumbnail>
              ) : (
                <span></span>
              )}
            </ion-col>
            <ion-col size="12" size-md="6" pull-md={this.reverse ? '6' : null} color="dark" class={this.reverse ? 'ion-text-end' : 'ion-text-start'}>
              {this.team ? <span class="grid-team-text">{this.team?.name}</span> : <span>⏳</span>}
            </ion-col>
          </ion-row>
        </ion-grid>
      </Host>
    );
  }
}
