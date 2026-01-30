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
  @Prop() rank?: number;

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
      <Host class="relative">
        {this.rank && <div class={`rank-badge rank-${this.rank <= 3 ? this.rank : 'other'} ${this.reverse ? 'rank-badge-left' : 'rank-badge-right'}`}>{this.rank}</div>}
        <div class="w-full">
          {this.team && this.imgSrc ? (
            <div class={this.reverse ? 'w-full md:w-1/2 min-h-8' : 'w-full md:w-1/2 min-h-8'}>
              <img class={this.reverse ? 'w-16 float-right' : 'w-16 float-left'} alt={`${this.team?.name} club logo`} src={this.imgSrc} />
            </div>
          ) : null}

          <div class={this.reverse ? 'w-full md:w-1/2 float-right md:float-none min-h-8' : 'w-full md:w-1/2 float-left md:float-none min-h-8'}>
            <div class={this.reverse ? 'w-full text-right my-1 float-right' : 'w-full text-left float-left my-1'}>
              {this.team ? <span class="text-balance">{this.team?.name}</span> : <span>⏳</span>}
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
