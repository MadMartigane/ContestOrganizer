import { Component, Host, Prop, h, State, Watch } from '@stencil/core';
import { TeamRow } from '../../modules/team-row/team-row';

@Component({
  tag: 'mad-match-tile',
  styleUrl: './match-tile.css',
  shadow: false,
})
export class MadMatchTile {
  private refreshUIHook: number = 1;

  @State() host: TeamRow | null;
  @State() visitor: TeamRow | null;

  @Prop() hostPending: Promise<TeamRow | null>;
  @Prop() visitorPending: Promise<TeamRow | null>;
  @Prop() hostScore?: number | null = null;
  @Prop() visitorScore?: number | null = null;
  @Prop() hostRank?: number;
  @Prop() visitorRank?: number;

  @Watch('hostPending')
  private hostPendingChange() {
    this.hostPending.then((team: TeamRow | null) => {
      this.host = team;
    });
  }

  @Watch('visitorPending')
  private visitorPendingChange() {
    this.visitorPending.then((team: TeamRow | null) => {
      this.visitor = team;
    });
  }

  @Watch('hostScore')
  @Watch('visitorScore')
  public onUpadateScore() {
    this.refreshUIHook++;
    console.log('%s hostScore: ', this.refreshUIHook, this.hostScore);
    console.log('%s visitorScore: ', this.refreshUIHook, this.visitorScore);
  }

  constructor() {
    this.hostPendingChange();
    this.visitorPendingChange();
  }

  render() {
    return (
      <Host>
        <div class="grid grid-cols-11 gap-1 content-center items-center min-h-36 my-4">
          <div class={this.hostScore === null ? 'col-span-5 text-end' : 'col-span-3 text-end'}>
            {this.host ? <mad-team-tile reverse={true} team={this.host?.team} rank={this.hostRank}></mad-team-tile> : <span>Sélection…</span>}
          </div>
          {this.hostScore !== null ? <div class="col-span-2 text-4xl">{this.refreshUIHook && this.hostScore}</div> : null}
          <div class="text-xs">VS</div>
          {this.visitorScore !== null ? <div class="col-span-2 text-4xl">{this.refreshUIHook && this.visitorScore}</div> : null}
          <div class={this.visitorScore === null ? 'col-span-5 text-start' : 'col-span-3 text-start'}>
            {this.visitor ? <mad-team-tile team={this.visitor?.team} rank={this.visitorRank}></mad-team-tile> : <span>Sélection…</span>}
          </div>
        </div>
      </Host>
    );
  }
}
