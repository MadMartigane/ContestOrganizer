import { Component, Host, Prop, h, State, Watch } from '@stencil/core';
import { TeamRow } from '../../modules/team-row/team-row';

@Component({
  tag: 'mad-match-tile',
  styleUrl: './match-tile.css',
  shadow: false,
})
export class MadMatchTile {
  @State() host: TeamRow | null;
  @State() visitor: TeamRow | null;

  @Prop() hostPending: Promise<TeamRow | null>;
  @Prop() visitorPending: Promise<TeamRow | null>;

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

  constructor() {
    this.hostPendingChange();
    this.visitorPendingChange();
  }

  render() {
    return (
      <Host>
        <div class="grid grid-cols-5 gap-2 content-center items-center min-h-36 border rounded my-4 border-sky">
          <div class="col-span-2 text-end">{this.host ? <mad-team-tile reverse={true} team={this.host?.team}></mad-team-tile> : <span>Sélection…</span>}</div>
          <div>VS</div>
          <div class="col-span-2 text-start">{this.visitor ? <mad-team-tile team={this.visitor?.team}></mad-team-tile> : <span>Sélection…</span>}</div>
        </div>
      </Host>
    );
  }
}
